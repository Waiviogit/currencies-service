const currencyHelper = require('utilities/helpers/currencyHelper');
const { DIESEL_POOLS } = require('constants/serviceData');
const { hiveEngineRateModel } = require('models');
const moment = require('moment');
const _ = require('lodash');
const { marketPools } = require('../hiveEngine');
const { SYMBOL_TO_TOKEN_PAIR } = require('../../constants/hive-engine');
const { getCurrentCurrencies } = require('../helpers/currencyHelper');
const { serviceData } = require('../../constants');

const START_PRICE_WAIV_USD = 0.005;
const START_PRICE_WAIV_HIVE = 0.01;

const getEngineRates = async ({ base }) => {
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

const getEngineCurrent = async ({ token }) => {
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

const CHART_PERIODS = {
  ONE_DAY: '1d',
  WEEK: '7d',
  MONTH: '1m',
  THREE_MONTH: '3m',
  SIX_MONTH: '6m',
  ONE_YEAR: '1y',
  TWO_YEARS: '2y',
  ALL: 'all',
};

const MATCH_CONDITION_BY_PERIOD = {
  [CHART_PERIODS.ONE_DAY]: (base) => ({ base, type: 'ordinaryData', dateString: { $gte: moment().subtract(1, 'day').format('YYYY-MM-DD') } }),
  [CHART_PERIODS.WEEK]: (base) => ({ base, type: 'ordinaryData', dateString: { $gte: moment().subtract(6, 'day').format('YYYY-MM-DD') } }),
  [CHART_PERIODS.MONTH]: (base) => ({ base, type: 'dailyData', dateString: { $gte: moment().subtract(1, 'month').format('YYYY-MM-DD') } }),
  [CHART_PERIODS.THREE_MONTH]: (base) => ({ base, type: 'dailyData', dateString: { $gte: moment().subtract(3, 'month').format('YYYY-MM-DD') } }),
  [CHART_PERIODS.SIX_MONTH]: (base) => ({ base, type: 'dailyData', dateString: { $gte: moment().subtract(6, 'month').format('YYYY-MM-DD') } }),
  [CHART_PERIODS.ONE_YEAR]: (base) => ({ base, type: 'dailyData', dateString: { $gte: moment().subtract(12, 'month').format('YYYY-MM-DD') } }),
  [CHART_PERIODS.TWO_YEARS]: (base) => ({ base, type: 'dailyData', dateString: { $gte: moment().subtract(24, 'month').format('YYYY-MM-DD') } }),
  [CHART_PERIODS.ALL]: (base) => ({ base, type: 'dailyData' }),
};

const sliceStartAndEnd = (arr, startCount, endCount) => {
  const startElements = arr.slice(0, startCount);
  const endElements = arr.slice(arr.length - endCount, arr.length);
  return { startElements, endElements };
};

const countAvgRate = (collection) => {
  const HIVE = _.meanBy(collection, (el) => el.rates?.HIVE);
  const USD = _.meanBy(collection, (el) => el.rates?.USD);

  return { HIVE, USD };
};

const START_END_BY_PERIOD = {
  [CHART_PERIODS.ONE_DAY]: { startCount: 12, endCount: 12 },
  [CHART_PERIODS.WEEK]: { startCount: 36, endCount: 36 },
  [CHART_PERIODS.MONTH]: { startCount: 3, endCount: 3 },
  [CHART_PERIODS.THREE_MONTH]: { startCount: 3, endCount: 3 },
  [CHART_PERIODS.SIX_MONTH]: { startCount: 3, endCount: 3 },
  [CHART_PERIODS.ONE_YEAR]: { startCount: 3, endCount: 3 },
  [CHART_PERIODS.TWO_YEARS]: { startCount: 3, endCount: 3 },
  [CHART_PERIODS.ALL]: { startCount: 3, endCount: 3 },
};

const getChangeByPeriod = ({ collection, period }) => {
  const { startCount, endCount } = START_END_BY_PERIOD[period];
  const { startElements, endElements } = sliceStartAndEnd(collection, startCount, endCount);
  const current = countAvgRate(startElements);
  const previous = period === CHART_PERIODS.ALL
    ? { HIVE: START_PRICE_WAIV_HIVE, USD: START_PRICE_WAIV_USD }
    : countAvgRate(endElements);
  return currencyHelper.getEngine24hChange({ current, previous });
};

const getChart = async ({ period, base }) => {
  const condition = (MATCH_CONDITION_BY_PERIOD[period]
      || MATCH_CONDITION_BY_PERIOD[CHART_PERIODS.MONTH])(base);

  const { result } = await hiveEngineRateModel.find({
    condition,
    projection: { type: 0 },
    sort: { dateString: -1 },
  });

  const change = getChangeByPeriod({ collection: result, period });

  const lowUSD = CHART_PERIODS.ALL ? START_PRICE_WAIV_USD : _.minBy(result, (el) => el?.rates?.USD);
  const highUSD = _.maxBy(result, (el) => el?.rates?.USD);

  return {
    result: result || [],
    change,
    lowUSD,
    highUSD,
  };
};

const getTokenPairArr = (symbols) => _.reduce(symbols, (acc, el) => {
  const pair = SYMBOL_TO_TOKEN_PAIR[el];
  if (pair) acc.push(pair);
  return acc;
}, []);

const getEnginePoolsRate = async ({ symbols }) => {
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

module.exports = {
  getEngineRates,
  getEngineCurrent,
  getEnginePoolsRate,
  getChart,
  CHART_PERIODS,
};
