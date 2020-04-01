const { currencyHelper } = require('utilities/helpers');

exports.getCurrencies = async ({ ids, currencies }) => {
  const result = {};
  const { result: currentCurrency, error } = await currencyHelper.getCurrenciesFromRequest(
    { ids, currencies },
  );
  result.current = currentCurrency;
  result.weekly = {
    1: {},
    2: {},
    3: {},
    4: {},
    5: {},
    6: {},
    7: {},
  };
  return { result };
};
