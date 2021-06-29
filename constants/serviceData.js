const _ = require('lodash');

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
  this.SUPPORTED_CURRENCIES.USD,
];

exports.CURRENCY_RATE_API = {
  HOST: 'https://api.exchangerate.host',
  LATEST: '/latest',
  TIME_SERIES: '/timeseries',
  CALLBACK: (value) => _.get(value, 'data.rates'),
};
