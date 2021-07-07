const _ = require('lodash');

exports.allowedIds = ['hive', 'hive_dollar'];
exports.allowedCurrencies = ['usd', 'btc'];

exports.SUPPORTED_CURRENCIES = {
  USD: 'USD',
  CAD: 'CAD',
  EUR: 'EUR',
  AUD: 'AUD',
  MXN: 'MXN',
  GBP: 'GBP',
  JPY: 'JPY',
  CNY: 'CNY',
  RUB: 'RUB',
  UAH: 'UAH',
};

exports.BASE_CURRENCIES = [
  this.SUPPORTED_CURRENCIES.USD,
];

exports.RATE_CURRENCIES = [
  this.SUPPORTED_CURRENCIES.CAD,
  this.SUPPORTED_CURRENCIES.EUR,
  this.SUPPORTED_CURRENCIES.AUD,
  this.SUPPORTED_CURRENCIES.MXN,
  this.SUPPORTED_CURRENCIES.GBP,
  this.SUPPORTED_CURRENCIES.JPY,
  this.SUPPORTED_CURRENCIES.CNY,
  this.SUPPORTED_CURRENCIES.RUB,
  this.SUPPORTED_CURRENCIES.UAH,
];

exports.CURRENCY_RATE_API = {
  HOST: 'https://api.exchangerate.host',
  LATEST: '/latest',
  TIME_SERIES: '/timeseries',
  CALLBACK: (value) => _.get(value, 'data.rates'),
};
