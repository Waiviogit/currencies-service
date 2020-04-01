const { currencyOperations } = require('utilities/operations');
const validators = require('controllers/validators');

const show = async (req, res, next) => {
  const value = validators.validate({
    ids: req.query.ids,
    currencies: req.query.currencies,
  }, validators.currency.currencySchema, next);
  if (!value) return;
  const { result, error } = await currencyOperations.getCurrencies(value);
  if (error) return next(error);
  res.result = { status: 200, json: result };
  next();
};
module.exports = { show };
