const _ = require('lodash');

exports.allowedIds = ['hive', 'hive_dollar'];
exports.allowedCurrencies = ['usd', 'btc'];

exports.SUPPORTED_CURRENCIES = {
  USD: 'USD',
  CAD: 'CAD',
  EUR: 'EUR',
  CHF: 'CHF',
  GBP: 'GBP',
  AUD: 'AUD',
  MXN: 'MXN',
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
  this.SUPPORTED_CURRENCIES.CHF,
];

exports.SUPPORTED_HIVE_ENGINE_TOKENS = {
  WAIV: 'WAIV',
};

exports.SUPPORTED_CRYPTO_TOKENS = {
  HIVE: 'HIVE',
};

exports.BASE_CURRENCIES_HIVE_ENGINE = [
  this.SUPPORTED_HIVE_ENGINE_TOKENS.WAIV,
];

exports.RATE_HIVE_ENGINE = [
  this.SUPPORTED_CRYPTO_TOKENS.HIVE,
  this.SUPPORTED_CURRENCIES.USD,
];

exports.SWAP_HIVE_WAIV = {
  base: 'WAIV',
  dieselPoolId: 63,
};

exports.DIESEL_POOLS = [
  this.SWAP_HIVE_WAIV,
];

exports.CURRENCY_RATE_API = {
  HOST: 'http://api.exchangerate.host',
  LATEST: '/live',
  TIME_SERIES: '/timeseries',
  TIME_FRAME: '/timeframe',
  CALLBACK: (value) => _.get(value, 'data.quotes'),
};

exports.STATISTIC_RECORD_TYPES = {
  ORDINARY: 'ordinaryData',
  DAILY: 'dailyData',
};

exports.HIVE_ENGINE_NODES = [
  'https://herpc.dtools.dev',
  'https://api.primersion.com',
  'https://herpc.kanibot.com',
  'https://engine.deathwing.me',//ok
  'https://he.sourov.dev',
];

exports.CACHE_KEYS = {
  COINGECKO: 'coingecko_cache',
};
