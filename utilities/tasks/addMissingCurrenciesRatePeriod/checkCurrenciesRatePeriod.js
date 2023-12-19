const { currenciesRateModel, currenciesStatisticsModel, hiveEngineRateModel } = require('models');
const moment = require('moment');
const _ = require('lodash');
const BigNumber = require('bignumber.js');
const addRatesByDate = require('../addMissingDateRates/addRates');
const {
  getCurrenciesFromRequest,
  getDailyCurrency,
  getDailyHiveEngineRate,
} = require('../../helpers/currencyHelper');
const { ObjectId } = require('mongoose').Types;

exports.checkRatesPeriod = async (startDate, endDate) => {
//  await checkCurrenciesRates(startDate, endDate);
  await checkCurrenciesStatistics(startDate, endDate);
  await checkHiveEngineRates(startDate, endDate);
  console.log('task completed!');
};

const getMissingDates = (data) => {
  const missingDates = [];
  for (let count = 0; count < data.length - 1; count++) {
    const dayDifference = Math.abs(data[count].diff(data[count + 1], 'days'));
    if (dayDifference > 1) {
      missingDates.push(...collectDatesWithDifference(dayDifference, data[count]));
    }
  }

  return missingDates;
};

const collectDatesWithDifference = (dayDifference, date) => {
  const missingDates = [];
  for (let count = 1; count < dayDifference; count++) {
    const dateToRemember = _.cloneDeep(date);
    missingDates.push(dateToRemember.add(count, 'days').toDate());
  }

  return missingDates;
};

const checkCurrenciesRates = async (startDate, endDate) => {
  const { result, error } = await currenciesRateModel.find({
    dateString: {
      $gte: startDate,
      $lte: endDate,
    },
  });
  if (error) {
    console.log('Error trying to get currencies rates');
    console.error(error);

    return;
  }

  const missingDates = getMissingDates(result.map((el) => moment(el.dateString)));
  for (const date of missingDates) await addRatesByDate({ date });
};

const checkCurrenciesStatistics = async (startDate, endDate) => {
  const { result, error } = await currenciesStatisticsModel.find({
    condition: {
      createdAt: { $gte: moment.utc(startDate).format(), $lte: moment.utc(endDate).format() },
    },
    limit: 0,
    sort: { createdAt: 1 },
  });
  if (error) {
    console.log('Error trying to get currencies statistics');
    console.error(error);

    return;
  }

  const dates = await getExistingDatesAndSetDailyData(result);
  const missingDates = getMissingDates(dates.map((el) => moment(el).endOf('day')));
  const dataToSave = [];
  if (missingDates.length) {
    dataToSave.push(...await getCurrenciesStatisticsWithRequest(missingDates));
  }
  if (dataToSave.length) {
    for (const data of dataToSave) await currenciesStatisticsModel.create(data);
  }
};

const getExistingDatesAndSetDailyData = async (data, currenciesStatistics = true) => {
  const dates = [];
  let dataToCheck = [];
  for (let count = 0; count < data.length - 1; count++) {
    const sameDay = currenciesStatistics ? moment(data[count].createdAt).isSame(moment(data[count + 1].createdAt), 'day')
      : moment(data[count].dateString).isSame(moment(data[count + 1].dateString), 'day');
    if (!sameDay) {
      currenciesStatistics ? dates.push(data[count].createdAt) : dates.push(data[count].dateString);
      dataToCheck.push(data[count]);
      const dailyData = dataToCheck.find((el) => el.type === 'dailyData');
      if (!dailyData) {
        currenciesStatistics ? await getDailyCurrency(data[count].createdAt)
          : await getDailyHiveEngineRate(data[count].dateString);
      }
      dataToCheck = [];
    } else dataToCheck.push(data[count]);
  }

  return dates;
};

const getCurrenciesStatisticsWithRequest = async (dates) => {
  const data = [];
  for (const date of dates) {
    const { result: hiveResult, error: hiveError } = await getCurrenciesFromRequest({
      id: 'hive',
      date: moment(date).format('DD-MM-YYYY'),
      resource: 'history',
    });

    const { result: hbdResult, error: hbdError } = await getCurrenciesFromRequest({
      id: 'hive_dollar',
      date: moment(date).format('DD-MM-YYYY'),
      resource: 'history',
    });
    if (hiveError || hbdError) {
      console.log('Error trying to get currencies statistics history with request');

      return [];
    }

    data.push({
      _id: new ObjectId(moment.utc(date).unix()),
      type: 'dailyData',
      hive: {
        usd: hiveResult.market_data.current_price.usd,
        usd_24h_change: 0,
        btc: hiveResult.market_data.current_price.btc,
        btc_24h_change: 0,
      },
      hive_dollar: {
        usd: hbdResult.market_data.current_price.usd,
        usd_24h_change: 0,
        btc: hbdResult.market_data.current_price.btc,
        btc_24h_change: 0,
      },
      createdAt: moment.utc(date).startOf('day'),
    });
  }

  return data;
};

const checkHiveEngineRates = async (startDate, endDate) => {
  const { result, error } = await hiveEngineRateModel.find({
    condition: {
      dateString: {
        $gte: startDate,
        $lte: endDate,
      },
    },
  });
  if (error) {
    console.log('Error trying to get hive engine rates');
    console.error(error);

    return;
  }

  const dates = await getExistingDatesAndSetDailyData(result, false);
  const missingDates = getMissingDates(dates.map((el) => moment(el).endOf('day')));

  const dataToSave = [];
  if (missingDates.length) {
    dataToSave.push(...await calculateAverageHiveEngineRate(missingDates));
  }
  if (dataToSave.length) {
    for (const data of dataToSave) await hiveEngineRateModel.create(data);
  }
};

const calculateAverageHiveEngineRate = async (dates) => {
  const data = [];
  for (let count = 0; count < dates.length; count++) {
    const { result: previousDayData, error: previousDayError } = await hiveEngineRateModel.findOne({
      condition:
        { dateString: { $lte: moment(dates[count]).format('YYYY-MM-DD') }, type: 'dailyData' },
      sort: { dateString: -1 },
    });
    const { result: nextDayData, error: nextDayError } = await hiveEngineRateModel.findOne({
      condition:
        { dateString: { $gte: moment(dates[count]).format('YYYY-MM-DD') }, type: 'dailyData' },
    });
    if (previousDayError || nextDayError) {
      console.log('Error trying to get single hive engine rates');

      return [];
    }

    if (previousDayData && nextDayData) {
      data.push({
        base: previousDayData.base,
        type: previousDayData.type,
        dateString: moment(dates[count]).format('YYYY-MM-DD'),
        rates: {
          HIVE: BigNumber(BigNumber(previousDayData.rates.HIVE).plus(nextDayData.rates.HIVE))
            .dividedBy(2).toFixed(),
          USD: BigNumber(BigNumber(previousDayData.rates.USD).plus(nextDayData.rates.USD))
            .dividedBy(2).toFixed(),
        },
      });
    }
  }

  return data;
};
