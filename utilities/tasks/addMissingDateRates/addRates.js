/* eslint-disable camelcase */
const rateApiHelper = require('utilities/helpers/rateApiHelper');
const { CURRENCY_RATE_API, RATE_CURRENCIES } = require('constants/serviceData');
const { currenciesRateModel } = require('models');
const moment = require('moment');

const _ = require('lodash');

module.exports = async ({ date }) => {
  const missingDate = moment(date).format('YYYY-MM-DD');
  console.log('Possible hive engine rates missing rate', missingDate);
  const base = 'USD';
  const { rates, error } = await rateApiHelper.getRates({
    url: `${CURRENCY_RATE_API.HOST}${CURRENCY_RATE_API.TIME_FRAME}`,
    params: {
      start_date: missingDate,
      end_date: missingDate,
      base: 'USD',
      symbols: RATE_CURRENCIES.toString(),
      access_key: process.env.CURRENCY_RATE_API_KEY,
    },
    callback: CURRENCY_RATE_API.CALLBACK,
  });
  if (error) return console.error(missingDate, error);
  const rateDate = rates[missingDate];
  if (!rateDate) {
    console.log(`no rateDate ${date}`, rates);
  }

  const updateData = _.reduce(RATE_CURRENCIES, (acc, el) => {
    acc[`rates.${el}`] = _.get(rateDate, `USD${el}`);
    return acc;
  }, {});

  await currenciesRateModel.updateOne({ dateString: missingDate, base }, updateData);

  console.info('task completed');
};
