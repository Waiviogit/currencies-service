const {
  BASE_CURRENCIES_HIVE_ENGINE,
  SUPPORTED_CURRENCIES,
  BASE_CURRENCIES,
  RATE_CURRENCIES,
} = require('constants/serviceData');
const Joi = require('@hapi/joi');
const { serviceData } = require('constants/index');

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

exports.engineRatesSchema = Joi.object().keys({
  base: Joi.string().valid(...BASE_CURRENCIES_HIVE_ENGINE).required(),
});
