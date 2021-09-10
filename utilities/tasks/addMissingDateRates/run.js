const addRatesByDate = require('./addRates');

(async () => {
  await addRatesByDate({
    date: process.argv[2],
  });
  process.exit();
})();
