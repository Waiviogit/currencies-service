const { checkCurrenciesRatePeriod } = require('./checkCurrenciesRatePeriod');

(async () => {
  console.log('task started!');
  await checkCurrenciesRatePeriod(process.argv[2], process.argv[3]);
  process.exit();
})();
