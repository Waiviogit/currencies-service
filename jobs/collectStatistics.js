const { CronJob } = require('cron');
const { currencyHelper } = require('utilities/helpers');

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

exports.checkCurrenciesRateForPreviousMonth = new CronJob('0 0 1 * *', async () => {
  // check currencies rates previous month if there was missing data and collecting missing data
  await currencyHelper.getPeriodDates();
}, null, true, null, null, false);
