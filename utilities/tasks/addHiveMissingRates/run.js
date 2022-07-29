const { getDailyCurrency } = require('../../helpers/currencyHelper');

(async () => {
  // example 2022-05-06T00:13:00.096+00:00
  await getDailyCurrency(process.argv[2]);
  process.exit();
})();
