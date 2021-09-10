/* eslint-disable camelcase */
const rateApiHelper = require('utilities/helpers/rateApiHelper');
const { CURRENCY_RATE_API, RATE_CURRENCIES } = require('constants/serviceData');
const { currenciesRateModel } = require('models');
const moment = require('moment');

const _ = require('lodash');

module.exports = async ({ date }) => {
  const missingDate = moment(date).format('YYYY-MM-DD');
  const base = 'USD';
  const { rates, error } = await rateApiHelper.getRates({
    url: `${CURRENCY_RATE_API.HOST}${CURRENCY_RATE_API.TIME_SERIES}`,
    params: {
      start_date: missingDate, end_date: missingDate, base: 'USD', symbols: RATE_CURRENCIES.toString(),
    },
    callback: CURRENCY_RATE_API.CALLBACK,
  });
  if (error) return console.error(missingDate, error);

  for (const ratesKey in rates) {
    const updateData = _.reduce(RATE_CURRENCIES, (acc, el) => {
      acc[`rates.${el}`] = _.get(rates, `${ratesKey}[${el}]`);
      return acc;
    }, {});
    await currenciesRateModel.updateOne({ dateString: ratesKey, base }, updateData);
  }

  console.info('task completed');
};
