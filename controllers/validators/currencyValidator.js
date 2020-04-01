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
