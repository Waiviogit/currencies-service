const {
  BASE_CURRENCIES_HIVE_ENGINE,
  SUPPORTED_CURRENCIES,
  BASE_CURRENCIES,
  RATE_CURRENCIES,
} = require('constants/serviceData');
const Joi = require('joi');
const { serviceData } = require('constants/index');
const { SYMBOLS_FOR_POOL_RATES } = require('../../constants/hive-engine');
const { CHART_PERIODS } = require('../../utilities/operations/engineRates');
const { SUPPORTED_HIVE_ENGINE_TOKENS } = require('../../constants/serviceData');

exports.currencySchema = Joi.object().keys({
  resource: Joi.string().valid('coingecko'),
  ids: Joi
    .when('resource', {
      is: 'coingecko',
      then: Joi.array().items(Joi.string().valid(...serviceData.allowedIds)).single(),
    }).required(),
  currencies: Joi
    .when('resource', {
      is: 'coingecko',
      then: Joi.array().items(Joi.string().valid(...serviceData.allowedCurrencies)).single(),
    }).required(),
});

exports.currencyRateLatestSchema = Joi.object().keys({
  base: Joi.string().valid(...BASE_CURRENCIES).required(),
  symbols: Joi.array()
    .items(Joi.string().valid(...RATE_CURRENCIES, SUPPORTED_CURRENCIES.USD)).min(1).required(),
});

exports.enginePoolsRateSchema = Joi.object().keys({
  symbols: Joi.array()
    .items(Joi.string().valid(...SYMBOLS_FOR_POOL_RATES)).min(1).required(),
});

exports.engineRatesSchema = Joi.object().keys({
  base: Joi.string().valid(...BASE_CURRENCIES_HIVE_ENGINE).required(),
});

exports.engineCurrentSchema = Joi.object().keys({
  token: Joi.string().valid(...BASE_CURRENCIES_HIVE_ENGINE).required(),
});

exports.engineChartSchema = Joi.object().keys({
  period: Joi.string()
    .valid(...Object.values(CHART_PERIODS))
    .default(CHART_PERIODS.MONTH),
  base: Joi.string()
    .valid(...BASE_CURRENCIES_HIVE_ENGINE)
    .default(SUPPORTED_HIVE_ENGINE_TOKENS.WAIV),
});
