const { currencyHelper } = require('utilities/helpers');

exports.getAndSaveCurrency = async () => {
  const data = {
    resource: 'coingecko',
    ids: ['hive'],
    currencies: ['usd'],
  };
  return currencyHelper.getCurrencyForReservation(data);
};
