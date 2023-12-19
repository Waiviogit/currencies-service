const { currenciesRateModel } = require('models');
const _ = require('lodash');

exports.getCurrencyRatesLatest = async ({ base, symbols }) => {
  if (base === symbols.toString()) return { rates: { [base]: 1 } };
  const selectRates = _.map(symbols, (el) => ({ [`rates.${el}`]: 1 }));

  const { result: { rates = {} } } = await currenciesRateModel.findOne({
    condition: { base },
    select: Object.assign({}, ...selectRates),
    sort: { dateString: -1 },
  });

  return { rates };
};
