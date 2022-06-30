const { CronJob } = require('cron');
const { currencyHelper } = require('utilities/helpers');
const moment = require('moment');
const { checkRatesPeriod } = require('../utilities/tasks/addMissingCurrenciesRatePeriod/checkCurrenciesRatePeriod');

const getPeriodDates = async () => {
  const previousMonthStart = moment.utc().subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
  const previousMonthEnd = moment.utc().subtract(1, 'month').endOf('month').format('YYYY-MM-DD');
  await checkRatesPeriod(previousMonthStart, previousMonthEnd);
};

exports.ordinaryStatisticsJob = new CronJob('*/5 * * * *', async () => {
  // add new currency statistic every 5 minutes
  await currencyHelper.collectStatistics('ordinaryData', 'coingecko');
}, null, true, null, null, false);

exports.dailyStatisticsJob = new CronJob('13 0 */1 * *', async () => {
  // add new currency statistic every 1 day
  await currencyHelper.getDailyCurrency();
}, null, true, null, null, false);

exports.dailyCurrencyRateJob = new CronJob('00 17 */1 * *', async () => {
  // add new currency rate statistic every 1 day
  await currencyHelper.getDailyCurrenciesRate();
}, null, true, null, null, false);

exports.ordinaryEngineStatisticsJob = new CronJob('*/5 * * * *', async () => {
  // add new currency statistic every 5 minutes
  await currencyHelper.collectEngineStatistics('ordinaryData', 'coingecko');
}, null, true, null, null, false);

exports.dailyHiveEngineRateJob = new CronJob('20 00 */1 * *', async () => {
  // add new currency rate statistic every 1 day
  await currencyHelper.getDailyHiveEngineRate();
}, null, true, null, null, false);

exports.checkCurrenciesRateForPreviousMonth = new CronJob('* * * * *', async () => {
  // check currencies rates previous month if there was missing data and collecting missing data
  await getPeriodDates();
}, null, true, null, null, false);
