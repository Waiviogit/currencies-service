const { Router } = require('express');
const { currencyController } = require('controllers');

const currencyRoute = new Router();
currencyRoute.use('/currencies-api', currencyRoute);

currencyRoute.route('/marketInfo')
  .get(currencyController.show);

currencyRoute.route('/engine-rates')
  .get(currencyController.engineCurrencies);

currencyRoute.route('/engine-chart/waiv')
  .get(currencyController.engineWaivChart);

currencyRoute.route('/engine-current')
  .get(currencyController.engineCurrent);

currencyRoute.route('/engine-pools-rate')
  .get(currencyController.enginePoolsRate);

currencyRoute.route('/reservationCurrency')
  .get(currencyController.currenciesForReserve);

currencyRoute.route('/rate/latest')
  .get(currencyController.currencyRateLatest);
currencyRoute.route('/rate/available')
  .get(currencyController.currencyAvailable);

module.exports = currencyRoute;
