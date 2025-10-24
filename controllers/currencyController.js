const {
  currencyOperations, reservationCurrency, currencyRates, engineRates,
} = require('utilities/operations');
const {
  getCacheKey, addToCache, getFromCache,
} = require('utilities/helpers/currencyHelper');
const validators = require('controllers/validators');
const _ = require('lodash');
const { SUPPORTED_CURRENCIES } = require('../constants/serviceData');
const { CACHE_KEY } = require('../constants/redis');

const show = async (req, res, next) => {
  const value = validators.validate({
    ids: req.query.ids,
    currencies: req.query.currencies,
    resource: req.query.resource || 'coingecko',
  }, validators.currency.currencySchema, next);
  if (!value) return;

  const cacheKey = `${CACHE_KEY.MARKET_INFO}:${getCacheKey(value)}`;
  const cache = await getFromCache({ key: cacheKey });
  if (cache) return res.status(200).json(cache);

  const { result, error } = await currencyOperations.getCurrencies(value);
  if (error) return next(error);
  await addToCache({ key: cacheKey, data: result });
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

const currencyAvailable = async (req, res, next) => {
  res.status(200).json([...Object.values(SUPPORTED_CURRENCIES)]);
};

const engineCurrencies = async (req, res, next) => {
  const value = validators.validate(
    req.query,
    validators.currency.engineRatesSchema,
    next,
  );
  if (!value) return;
  const cacheKey = `${CACHE_KEY.ENGINE_RATES}:${getCacheKey()}`;
  const cache = await getFromCache({ key: cacheKey });
  if (cache) return res.status(200).json(cache);

  const { current, weekly, error } = await engineRates.getEngineRates(value);
  if (error) return next(error);

  await addToCache({ key: cacheKey, data: { current, weekly } });
  res.status(200).json({ current, weekly });
};

const engineCurrent = async (req, res, next) => {
  const value = validators.validate(
    req.query,
    validators.currency.engineCurrentSchema,
    next,
  );
  if (!value) return;
  const cacheKey = `${CACHE_KEY.ENGINE_CURRENT}:${getCacheKey()}`;
  const cache = await getFromCache({ key: cacheKey });
  if (cache) return res.status(200).json(cache);

  const { HIVE, USD, error } = await engineRates.getEngineCurrent(value);
  if (error) return next(error);
  await addToCache({ key: cacheKey, data: { HIVE, USD } });
  res.status(200).json({ HIVE, USD });
};

const enginePoolsRate = async (req, res, next) => {
  const value = validators.validate(
    { symbols: _.split(req.query.symbols, ',') },
    validators.currency.enginePoolsRateSchema,
    next,
  );

  const cacheKey = `${CACHE_KEY.ENGINE_POOL}:${getCacheKey(_.split(req.query.symbols, ','))}`;
  const cache = await getFromCache({ key: cacheKey });
  if (cache) return res.status(200).json(cache);

  if (!value) return;
  const { result, error } = await engineRates.getEnginePoolsRate(value);
  if (error) return next(error);
  if (result.length) await addToCache({ key: cacheKey, data: result });
  res.status(200).json(result);
};

const withdrawPairs = async (req, res, next) => {
  try {
    const response = await fetch('https://converter-api.hive-engine.com/api/pairs/');
    const result = await response.json();

    res.status(200).json(result);
  } catch (error) {
    if (error) return next(error);
  }
};

const withdrawCoins = async (req, res, next) => {
  try {
    const response = await fetch('https://converter-api.hive-engine.com/api/coins/');
    const result = await response.json();

    res.status(200).json(result);
  } catch (error) {
    if (error) return next(error);
  }
};

const getEngineChart = async (req, res, next) => {
  const value = validators.validate(
    req.query,
    validators.currency.engineChartSchema,
    next,
  );

  if (!value) return;
  const result = await engineRates.getChart(value);

  res.status(200).json(result);
};

module.exports = {
  show,
  currenciesForReserve,
  currencyRateLatest,
  engineCurrencies,
  engineCurrent,
  enginePoolsRate,
  currencyAvailable,
  withdrawPairs,
  withdrawCoins,
  getEngineChart,
};
