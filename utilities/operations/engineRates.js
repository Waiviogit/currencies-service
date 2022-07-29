const currencyHelper = require('utilities/helpers/currencyHelper');
const { DIESEL_POOLS } = require('constants/serviceData');
const { hiveEngineRateModel } = require('models');
const moment = require('moment');
const _ = require('lodash');
const { marketPools } = require('../hiveEngine');
const { SYMBOL_TO_TOKEN_PAIR } = require('../../constants/hive-engine');
const { getCurrentCurrencies } = require('../helpers/currencyHelper');
const { serviceData } = require('../../constants');

exports.getEngineRates = async ({ base }) => {
  const requests = await Promise.all([await getCurrent({ base }), await getWeekly({ base })]);
  for (const request of requests) {
    if (_.has(request, 'error')) return { error: request.error };
  }

  const [current, weekly] = requests;
  current.change24h = currencyHelper.getEngine24hChange({
    current: _.get(current, 'rates'), previous: _.get(weekly, '[0].rates'),
  });
  weekly.unshift(current);

  return { current, weekly };
};

exports.getEngineCurrent = async ({ token }) => {
  const current = await getCurrent({ base: token });
  if (_.has(current, 'error')) return { error: new Error('bad request') };
  const { rates: { HIVE, USD } } = current;

  return { HIVE, USD };
};

const getCurrent = async ({ base }) => {
  const dieselPool = _.find(DIESEL_POOLS, (pool) => pool.base === base);

  const priceInHive = await currencyHelper
    .getEngineCurrentPriceFromDieselPool(dieselPool.dieselPoolId);
  if (!priceInHive) return { error: new Error('bad request') };
  const { result, error } = await currencyHelper.getCurrentCurrencies({
    ids: ['hive'],
    currencies: ['usd'],
    resource: 'coingecko',
  });
  if (error) return { error };
  return {
    base,
    dateString: moment().format('YYYY-MM-DD'),
    rates: {
      HIVE: priceInHive,
      USD: priceInHive * result.hive.usd,
    },
  };
};

const getWeekly = async ({ base }) => {
  const sixDaysAgo = moment().subtract(6, 'days').format('YYYY-MM-DD');

  const { result } = await hiveEngineRateModel.find({
    condition: { base, type: 'dailyData', dateString: { $gte: sixDaysAgo } },
    projection: { _id: 0, type: 0 },
    sort: { dateString: -1 },
  });
  return result;
};

const getTokenPairArr = (symbols) => _.reduce(symbols, (acc, el) => {
  const pair = SYMBOL_TO_TOKEN_PAIR[el];
  if (pair) acc.push(pair);
  return acc;
}, []);

exports.getEnginePoolsRate = async ({ symbols }) => {
  const { result: enginePools, error: enginePoolsError } = await marketPools
    .getMarketPools({ query: { tokenPair: { $in: getTokenPairArr(symbols) } } });
  if (enginePoolsError) return { error: enginePoolsError };
  const { result: price } = await getCurrentCurrencies({
    ids: serviceData.allowedIds,
    currencies: serviceData.allowedCurrencies,
    resource: 'coingecko',
  });
  const mappedBaseQuote = _.map(enginePools, (p) => {
    const [base, quote] = p.tokenPair.split(':');
    return {
      base,
      quote,
      ...p,
    };
  });
  const hivePriceUsd = _.get(price, 'hive.usd');

  const responseArray = _.reduce(symbols, (acc, el) => {
    if (el === 'SWAP.HIVE') {
      acc.push({ symbol: el, USD: hivePriceUsd });
      return acc;
    }
    const pool = _.find(mappedBaseQuote, (p) => p.base === el || p.quote === el);
    if (!pool) return acc;
    const symbolIsBase = pool.base === el;
    const usdPrice = symbolIsBase
      ? Number(pool.basePrice) * hivePriceUsd
      : Number(pool.quotePrice) * hivePriceUsd;
    acc.push({ symbol: el, USD: usdPrice });
    return acc;
  }, []);

  return { result: responseArray };
};
