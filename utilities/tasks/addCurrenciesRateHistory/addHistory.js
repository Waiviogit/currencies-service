/* eslint-disable camelcase */
const rateApiHelper = require('utilities/helpers/rateApiHelper');
const { CURRENCY_RATE_API } = require('constants/serviceData');
const { currenciesRateModel } = require('models');
const moment = require('moment');

const _ = require('lodash');

module.exports = async ({ date, base, symbols }) => {
  const years = moment().diff(date, 'years');
  const dates = [];
  for (let i = 0; i <= years; i++) {
    dates.push(moment(date).add(i, 'years').format());
  }

  for (const year of dates) {
    const start_date = moment(year).startOf('year').format('YYYY-MM-DD');
    let end_date = moment(year).endOf('year').format('YYYY-MM-DD');
    if (moment(year).isSame(moment(), 'year')) end_date = moment().format('YYYY-MM-DD');

    const { rates, error } = await rateApiHelper.getRates({
      url: `${CURRENCY_RATE_API.HOST}${CURRENCY_RATE_API.TIME_SERIES}`,
      params: {
        start_date, end_date, base, symbols,
      },
    });
    if (error) return console.error(start_date, error);

    for (const ratesKey in rates) {
      const keys = symbols.split(',');
      const updateData = _.reduce(keys, (acc, el) => {
        acc[`rates.${el}`] = _.get(rates, `${ratesKey}[${el}]`);
        return acc;
      }, {});
      await currenciesRateModel.updateOne({ dateString: ratesKey, base }, updateData);
    }
  }
  console.info('task completed');
};
