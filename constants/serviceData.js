exports.allowedIds = ['hive', 'hive_dollar'];
exports.allowedCurrencies = ['usd', 'btc'];

exports.SUPPORTED_CURRENCIES = {
  USD: 'USD',
  CAD: 'CAD',
};

exports.BASE_CURRENCIES = [
  this.SUPPORTED_CURRENCIES.USD,
];

exports.RATE_CURRENCIES = [
  this.SUPPORTED_CURRENCIES.CAD,
];

exports.CURRENCY_RATE_API = {
  HOST: 'https://api.exchangerate.host',
  LATEST: '/latest',
  TIME_SERIES: '/timeseries',
};
