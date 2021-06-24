const { CURRENCY_RATE_API } = require('constants/serviceData');
const rateApiHelper = require('utilities/helpers/rateApiHelper');
const { currenciesRateModel } = require('models');
const _ = require('lodash');

exports.getCurrencyRatesLatest = async ({ base, symbols }) => {
  const selectRates = _.map(symbols, (el) => ({ [`rates.${el}`]: 1 }));

  const { result: { rates = {} } } = await currenciesRateModel.findOne({
    condition: { base },
    select: Object.assign({}, ...selectRates),
    sort: { dateString: -1 },
  });

  if (_.isEmpty(rates)) return getRatesFromApi({ base, symbols: symbols.toString() });

  return { rates };
};

const getRatesFromApi = async ({ base, symbols }) => {
  const { rates, error } = await rateApiHelper.getRates({
    url: `${CURRENCY_RATE_API.HOST}${CURRENCY_RATE_API.LATEST}`,
    params: { base, symbols },
    callback: CURRENCY_RATE_API.CALLBACK,
  });
  if (error) return { error };
  return { rates };
};
