const { currenciesRateModel, currenciesStatisticsModel, hiveEngineRateModel } = require('models');
const { setTimeout } = require('node:timers/promises');
const moment = require('moment');
const _ = require('lodash');
const BigNumber = require('bignumber.js');
const { ObjectId } = require('mongoose').Types;
const addRatesByDate = require('../addMissingDateRates/addRates');
const {
  getCurrenciesFromRequest,
  getDailyCurrency,
  getDailyHiveEngineRate,
} = require('../../helpers/currencyHelper');

exports.checkRatesPeriod = async (startDate, endDate) => {
  await checkCurrenciesRates(startDate, endDate);
  await checkCurrenciesStatistics(startDate, endDate);
  await checkHiveEngineRates(startDate, endDate);
  console.log('task completed!');
};

const getMissingDates = ({ existingDates, startDate, endDate }) => {
  if (!existingDates || !startDate || !endDate) return [];

  const start = moment.utc(startDate).startOf('day');
  const end = moment.utc(endDate).startOf('day');

  if (!start.isValid() || !end.isValid() || end.isBefore(start)) return [];

  const existingSet = new Set(
    _.uniq(existingDates.map((d) => moment.utc(d).startOf('day').format('YYYY-MM-DD'))),
  );

  const missing = [];
  const cursor = start.clone();
  while (cursor.isSameOrBefore(end, 'day')) {
    const key = cursor.format('YYYY-MM-DD');
    if (!existingSet.has(key)) missing.push(cursor.clone().toDate());
    cursor.add(1, 'day');
  }

  return missing;
};

const checkCurrenciesRates = async (startDate, endDate) => {
  const { result, error } = await currenciesRateModel.find({
    dateString: {
      $gte: startDate,
      $lte: endDate,
    },
  }, { dateString: 1 });
  if (error) {
    console.log('Error trying to get currencies rates');
    console.error(error);

    return;
  }

  // build existing day keys from found records
  const existing = result.map((el) => el.dateString);
  const missingDates = getMissingDates({
    existingDates: existing,
    startDate: moment.utc(startDate).format('YYYY-MM-DD'),
    endDate: moment.utc(endDate).format('YYYY-MM-DD'),
  });
  console.log('checkCurrenciesRates missing dates:');
  console.table(missingDates);
  for (const date of missingDates) {
    await addRatesByDate({ date });
    await setTimeout(1000);
  }
};

const checkCurrenciesStatistics = async (startDate, endDate) => {
  const { result, error } = await currenciesStatisticsModel.find({
    condition: {
      type: 'dailyData',
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
  const normalized = dates.map((el) => moment.utc(el).format('YYYY-MM-DD'));
  const rangeStart = _.min(normalized);
  const rangeEnd = _.max(normalized);
  const missingDates = getMissingDates({
    existingDates: normalized,
    startDate: rangeStart,
    endDate: rangeEnd,
  });

  console.log('checkCurrenciesStatistics missing dates:');
  console.table(missingDates);
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
    if (hiveError) {
      console.log('Error trying to get currencies statistics history with request');

      return [];
    }

    const hiveUsd = _.get(hiveResult, 'market_data.current_price.usd');

    const hiveBtc = _.get(hiveResult, 'market_data.current_price.btc');
    if (!hiveUsd || !hiveBtc) {
      console.log(`getCurrenciesFromRequest No Price for hive ${date}`);
      continue;
    }
    const hbdUsd = _.get(hbdResult, 'market_data.current_price.usd');
    const hbdBtc = _.get(hbdResult, 'market_data.current_price.btc');
    const fallbackHbdBtc = (hiveBtc / hiveUsd);

    data.push({
      _id: new ObjectId(moment.utc(date).unix()),
      type: 'dailyData',
      hive: {
        usd: hiveUsd,
        usd_24h_change: 0,
        btc: hiveBtc,
        btc_24h_change: 0,
      },
      hive_dollar: {
        usd: hbdUsd ?? 1,
        usd_24h_change: 0,
        btc: hbdBtc ?? fallbackHbdBtc,
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
      type: 'dailyData',
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
  const normalized = dates.map((el) => moment.utc(el).format('YYYY-MM-DD'));
  const rangeStart = _.min(normalized);
  const rangeEnd = _.max(normalized);
  const missingDates = getMissingDates({
    existingDates: normalized,
    startDate: rangeStart,
    endDate: rangeEnd,
  });

  console.log('checkHiveEngineRates missing dates:');
  console.table(missingDates);

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
