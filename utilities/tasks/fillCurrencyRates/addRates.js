/* eslint-disable camelcase */
const rateApiHelper = require('utilities/helpers/rateApiHelper');
const { CURRENCY_RATE_API, RATE_CURRENCIES } = require('constants/serviceData');
const { currenciesRateModel } = require('models');

const _ = require('lodash');

const reMapRates = {
  CAD: 'USDCAD',
  EUR: 'USDEUR',
  CHF: 'USDCHF',
  GBP: 'USDGBP',
  AUD: 'USDAUD',
  MXN: 'USDMXN',
  JPY: 'USDJPY',
  CNY: 'USDCNY',
  RUB: 'USDRUB',
  UAH: 'USDUAH',
};

module.exports = async ({ start_date = '2023-09-28', end_date = '2023-12-18' }) => {
  const base = 'USD';
  const { rates } = await rateApiHelper.getRates({
    url: `${CURRENCY_RATE_API.HOST}${CURRENCY_RATE_API.TIME_FRAME}`,
    params: {
      start_date,
      end_date,
      base: 'USD',
      symbols: RATE_CURRENCIES.toString(),
      access_key: process.env.CURRENCY_RATE_API_KEY,
    },
    callback: CURRENCY_RATE_API.CALLBACK,
  });

  for (const ratesKey in rates) {
    const daylyRates = rates[ratesKey]
    const updateData = _.reduce(RATE_CURRENCIES, (acc, el) => {

      acc[`rates.${el}`] = daylyRates[reMapRates[el]];
      return acc;
    }, {});

    await currenciesRateModel.updateOne({ dateString: ratesKey, base }, updateData);
  }

  console.info('task completed');
};
