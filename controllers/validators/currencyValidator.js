const Joi = require('@hapi/joi');

exports.currencySchema = Joi.object().keys({
  ids: Joi.array().items(Joi.string().valid('hive', 'hive_dollar')).single()
    .required(),
  currencies: Joi.array().items(Joi.string().valid('usd', 'btc')).single()
    .required(),
});
