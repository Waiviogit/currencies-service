const _ = require('lodash');
const { currencyHelper } = require('utilities/helpers');

exports.getCurrencies = async (data) => {
  const result = {};
  const { result: currentCurrency } = await currencyHelper.getCurrentCurrencies(data);
  currentCurrency.type = _.get(currentCurrency, 'type') ? currentCurrency.type : 'ordinaryData';
  currentCurrency.createdAt = _.get(currentCurrency, 'createdAt') ? currentCurrency.createdAt : new Date();
  currentCurrency.updatedAt = _.get(currentCurrency, 'updatedAt') ? currentCurrency.updatedAt : new Date();
  result.current = currentCurrency;
  result.weekly = await currencyHelper.getWeaklyCurrencies(currentCurrency);
  return { result };
};
