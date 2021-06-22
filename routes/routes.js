const { Router } = require('express');
const { currencyController } = require('controllers');

const currencyRoute = new Router();
currencyRoute.use('/currencies-api', currencyRoute);

currencyRoute.route('/marketInfo')
  .get(currencyController.show);

currencyRoute.route('/reservationCurrency')
  .get(currencyController.currenciesForReserve);

currencyRoute.route('/currency-rate/latest')
  .get(currencyController.currencyRateLatest);

module.exports = currencyRoute;
