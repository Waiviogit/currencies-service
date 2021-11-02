const {
  currenciesStatisticsModel,
  reservationCurrenciesModel,
  currenciesRateModel,
  hiveEngineRateModel,
} = require('models');
const {
  BASE_CURRENCIES, RATE_CURRENCIES, CURRENCY_RATE_API, RATE_HIVE_ENGINE, DIESEL_POOLS_ID,
} = require('constants/serviceData');
const rateApiHelper = require('utilities/helpers/rateApiHelper');
const { serviceData } = require('constants/index');
const { marketPools } = require('utilities/hiveEngine');
const moment = require('moment');
const axios = require('axios');
const _ = require('lodash');

const getCurrentCurrencies = async (data) => {
  const { result } = await getCurrenciesFromRequest(data);
  if (result) return { result };
  const { result: [lastValidCurrencies] } = await currenciesStatisticsModel.find(
    { condition: { type: 'ordinaryData' } },
  );
  return { result: lastValidCurrencies };
};

const getUrlFromRequestData = (data) => {
  switch (data.resource) {
    case 'coingecko':
      return `https://api.coingecko.com/api/v3/simple/price?ids=${data.ids.toString()}&vs_currencies=${data.currencies.toString()}&include_24hr_change=true`;
    default:
      return '';
  }
};

const getCurrenciesFromRequest = async (data) => {
  const url = getUrlFromRequestData(data);
  try {
    const result = await axios.get(url);
    return { result: result.data };
  } catch (error) {
    return {
      error: {
        message: error.message,
        status: _.get(error, 'response.status', 403),
      },
    };
  }
};

const getWeaklyCurrencies = async (currentCurrency) => {
  const { result: weeklyCurrencies } = await currenciesStatisticsModel.find(
    {
      condition: { type: 'dailyData' },
      limit: 7,
    },
  );
  weeklyCurrencies[0] = currentCurrency;
  return weeklyCurrencies;
};

const collectStatistics = async (type, resource) => {
  const { result, error } = await getCurrenciesFromRequest({
    ids: serviceData.allowedIds,
    currencies: serviceData.allowedCurrencies,
    resource,
  });
  if (error || !result) {
    console.error(error.message || 'Something wrong with request');
    return;
  }
  result.type = type;
  const { currencies } = await currenciesStatisticsModel.create(result);
  if (currencies) console.log(`Currencies successfully save at ${new Date()}`);
};

const collectEngineStatistics = async (type, resource) => {
  const { result, error } = await getCurrenciesFromRequest({
    ids: serviceData.allowedIds,
    currencies: serviceData.allowedCurrencies,
    resource,
  });
  if (error || !result) {
    console.error(error.message || 'Something wrong with request');
  }

  const { result: enginePools, error: enginePoolsError } = await marketPools
    .getMarketPools({ query: { _id: { $in: DIESEL_POOLS_ID } } });
  if (enginePoolsError || _.isEmpty(enginePools)) return;
  const { hive } = result;

  const rates = _.reduce(enginePools, (acc, el) => {
    const symbol = el.tokenPair.split(':')[1];
    acc[symbol] = parseFloat(el.quotePrice) * hive.usd;
    return acc;
  }, {});

  await hiveEngineRateModel.create({
    dateString: moment().format('YYYY-MM-DD'),
    rates,
    type,
  });
};

const getDailyCurrency = async () => {
  const startOfDay = moment().startOf('day').toDate();
  const endOfDay = moment().endOf('day').toDate();
  const { result, error } = await currenciesStatisticsModel.aggregate([{
    $match: {
      $and: [{ createdAt: { $gt: startOfDay } }, { createdAt: { $lt: endOfDay } }],
      type: 'ordinaryData',
    },
  }, {
    $group: {
      _id: null,
      hive_dollar_usd: { $avg: '$hive_dollar.usd' },
      hive_dollar_usd_24h: { $avg: '$hive_dollar.usd_24h_change' },
      hive_dollar_btc: { $avg: '$hive_dollar.btc' },
      hive_dollar_btc_24h: { $avg: '$hive_dollar.btc_24h_change' },
      hive_usd: { $avg: '$hive.usd' },
      hive_usd_24h: { $avg: '$hive.usd_24h_change' },
      hive_btc: { $avg: '$hive.btc' },
      hive_btc_24h: { $avg: '$hive.btc_24h_change' },
    },
  }, {
    $project: {
      _id: 0,
      type: 'dailyData',
      'hive_dollar.usd': '$hive_dollar_usd',
      'hive_dollar.usd_24h_change': '$hive_dollar_usd_24h',
      'hive_dollar.btc': '$hive_dollar_btc',
      'hive_dollar.btc_24h_change': '$hive_dollar_btc_24h',
      'hive.usd': '$hive_usd',
      'hive.usd_24h_change': '$hive_usd_24h',
      'hive.btc': '$hive_btc',
      'hive.btc_24h_change': '$hive_btc_24h',
    },
  },
  ]);
  if (error) return { error };
  const { currencies } = await currenciesStatisticsModel.create(result[0]);
  if (currencies) console.log(`Daily currencies successfully save at ${new Date()}`);
};

const getCurrencyForReservation = async (data) => {
  const { result: currentCurrency } = await getCurrentCurrencies(data);
  const { currencies, error } = await reservationCurrenciesModel.create(
    { hiveCurrency: _.get(currentCurrency, 'hive.usd') },
  );
  if (error) return { error };
  return {
    hiveCurrency: _.get(currentCurrency, 'hive.usd'),
    id: currencies._id,
  };
};

const getDailyCurrenciesRate = async () => {
  for (const base of BASE_CURRENCIES) {
    const { rates, error } = await rateApiHelper.getRates({
      url: `${CURRENCY_RATE_API.HOST}${CURRENCY_RATE_API.LATEST}`,
      params: { base, symbols: RATE_CURRENCIES.join(',') },
      callback: CURRENCY_RATE_API.CALLBACK,
    });
    if (error || !rates) return console.error(error.message || 'Something wrong with request');

    const updateData = _.reduce(rates, (acc, el, index) => {
      acc[`rates.${index}`] = el;
      return acc;
    }, {});
    const currentDate = () => moment().format('YYYY-MM-DD');
    const { result } = await currenciesRateModel
      .updateOne({ base, dateString: currentDate() }, updateData);
    if (result) console.log(`Currencies rate successfully save at ${moment().format()}`);
  }
};

const getDailyHiveEngineRate = async () => {
  const dateString = moment().subtract(1, 'day').format('YYYY-MM-DD');
  const { result, error } = await hiveEngineRateModel.aggregate([
    {
      $match: {
        dateString,
        type: 'ordinaryData',
      },
    },
    {
      $group: {
        _id: null,
        ..._.reduce(RATE_HIVE_ENGINE, (acc, el) => {
          acc[el] = { $avg: `$rates.${el}` };
          return acc;
        }, {}),
      },
    },
    {
      $project: {
        _id: 0,
        type: 'dailyData',
        ..._.reduce(RATE_HIVE_ENGINE, (acc, el) => {
          acc[`rates.${el}`] = `$${el}`;
          return acc;
        }, {}),
      },
    },
  ]);
  if (error) return { error };
  await hiveEngineRateModel.create(Object.assign(result[0], { dateString }));
};

module.exports = {
  getCurrencyForReservation,
  getDailyCurrenciesRate,
  getCurrentCurrencies,
  getWeaklyCurrencies,
  collectStatistics,
  getDailyCurrency,
  collectEngineStatistics,
  getDailyHiveEngineRate,
};
