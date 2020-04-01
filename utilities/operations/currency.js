const { currencyHelper } = require('utilities/helpers');

exports.getCurrencies = async (data) => {
  const result = {};
  const { result: currentCurrency } = await currencyHelper.getCurrentCurrencies(data);
  result.current = currentCurrency;
  result.weekly = await currencyHelper.getWeaklyCurrencies();
  return { result };
};
