const currencyHelper = require('utilities/helpers/currencyHelper');
const { DIESEL_POOLS } = require('constants/serviceData');
const { hiveEngineRateModel } = require('models');
const moment = require('moment');
const _ = require('lodash');

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
