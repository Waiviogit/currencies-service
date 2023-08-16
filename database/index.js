const mongoose = require('mongoose');
const config = require('config');

const URI = process.env.MONGO_URI_CURRENCIES
  ? process.env.MONGO_URI_CURRENCIES
  : `mongodb://${config.db.host}:${config.db.port}/${config.db.database}`;

mongoose.connect(URI, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })
  .then(() => console.log('connection successful!'))
  .catch((error) => console.log(error));

mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

mongoose.Promise = global.Promise;
mongoose.set('debug', process.env.NODE_ENV === 'development');

module.exports = {
  Mongoose: mongoose,
  models: {
    CurrenciesRateSchema: require('./schemas/currenciesRateSchema'),
    CurrenciesSchema: require('./schemas/currenciesStatisticSchema'),
    ReservationCurrenciesSchema: require('./schemas/reservationCurrenciesSchema'),
    HiveEngineRateSchema: require('./schemas/hiveEngineRateSchema'),
  },
};
