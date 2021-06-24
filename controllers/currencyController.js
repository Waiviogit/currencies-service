const { currencyOperations, reservationCurrency, currencyRates } = require('utilities/operations');
const validators = require('controllers/validators');
const _ = require('lodash');

const show = async (req, res, next) => {
  const value = validators.validate({
    ids: req.query.ids,
    currencies: req.query.currencies,
    resource: req.query.resource || 'coingecko',
  }, validators.currency.currencySchema, next);
  if (!value) return;
  const { result, error } = await currencyOperations.getCurrencies(value);
  if (error) return next(error);
  res.status(200).json(result);
};

const currenciesForReserve = async (req, res, next) => {
  const { hiveCurrency, id, error } = await reservationCurrency.getAndSaveCurrency();
  if (error) return next(error);
  res.status(200).json({ hiveCurrency, id });
};

const currencyRateLatest = async (req, res, next) => {
  const value = validators.validate(
    { base: req.query.base, symbols: _.split(req.query.symbols, ',') },
    validators.currency.currencyRateLatestSchema,
    next,
  );
  const { rates, error } = await currencyRates.getCurrencyRatesLatest(value);
  if (error) return next(error);
  res.status(200).json(rates);
};

module.exports = { show, currenciesForReserve, currencyRateLatest };
