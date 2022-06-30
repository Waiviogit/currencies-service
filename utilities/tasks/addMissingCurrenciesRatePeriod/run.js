const { checkRatesPeriod } = require('./checkCurrenciesRatePeriod');

(async () => {
  console.log('task started!');
  await checkRatesPeriod(process.argv[2], process.argv[3]);
  process.exit();
})();
