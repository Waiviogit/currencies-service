const axios = require('axios');
const _ = require('lodash');
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
    return { error: { message: error.message, status: _.get(error, 'response.status', 403) } };
  }
};

const getWeaklyCurrencies = async () => [];

const collectStatistics = async (type, resource) => {
  const { result, error } = await getCurrenciesFromRequest(
    { ids: serviceData.allowedIds, currencies: serviceData.allowedCurrencies, resource },
  );
  if (error || !result) return;
  result.type = type;
  const { currencies } = await currenciesStatisticsModel.create(result);
  if (currencies) console.log(`Currencies successfully save at ${new Date()}`);
};

module.exports = { getCurrentCurrencies, getWeaklyCurrencies, collectStatistics };
