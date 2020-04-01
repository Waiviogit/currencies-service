const { CronJob } = require('cron');
const { currencyHelper } = require('utilities/helpers');

exports.ordinatyStatisticsJob = new CronJob('0 */5  * * * *', async () => {
  // add new currency statistic every 5 minutes
  await currencyHelper.collectStatistics('ordinaryData', 'coingecko');
}, null, true, null, null, false);

exports.dailyStatisticsJob = new CronJob('0 0 0 */1 * *', async () => {
  // add new currency statistic every 1 day
  await currencyHelper.collectStatistics('dailyData', 'coingecko');
}, null, true, null, null, false);
