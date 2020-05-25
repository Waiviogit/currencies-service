const { CronJob } = require('cron');
const { currencyHelper } = require('utilities/helpers');

exports.ordinaryStatisticsJob = new CronJob('*/5 * * * *', async () => {
  // add new currency statistic every 5 minutes
  await currencyHelper.collectStatistics('ordinaryData', 'coingecko');
}, null, true, null, null, false);

exports.dailyStatisticsJob = new CronJob('0 0 * * * ', async () => {
  // add new currency statistic every 1 day
  await currencyHelper.getDailyCurrency();
}, null, true, null, null, false);
