const addRatesByDate = require('./addRates');

(async () => {
  await addRatesByDate({
    start_date: process.argv[2],
    end_date: process.argv[3],
  });
  process.exit();
})();
