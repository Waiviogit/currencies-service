const { Router } = require('express');
const { currencyController } = require('controllers');

const currencyRoute = new Router();
currencyRoute.use('/currencies-service', currencyRoute);

currencyRoute.route('/marketInfo')
  .get(currencyController.show);

module.exports = currencyRoute;
