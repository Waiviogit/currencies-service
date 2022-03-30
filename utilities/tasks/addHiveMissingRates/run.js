const { getDailyCurrency } = require('../../helpers/currencyHelper');

(async () => {
  await getDailyCurrency(process.argv[2]);
  process.exit();
})();
