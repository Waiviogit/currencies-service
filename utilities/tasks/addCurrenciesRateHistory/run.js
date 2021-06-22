const addHistory = require('./addHistory');

(async () => {
  await addHistory({
    date: process.argv[2],
    base: process.argv[3],
    symbols: process.argv[4],
  });
  process.exit();
})();
