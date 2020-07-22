const axios = require('axios');
const _ = require('lodash');
const moment = require('moment');
const { currenciesStatisticsModel } = require('models');
const { serviceData } = require('constants/index');

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

module.exports = {
  getCurrentCurrencies,
  getWeaklyCurrencies,
  collectStatistics,
  getDailyCurrency,
};
