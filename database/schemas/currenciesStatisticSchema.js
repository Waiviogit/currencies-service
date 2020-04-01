const mongoose = require('mongoose');
const { serviceData } = require('constants/index');

const { Schema } = mongoose;

const currency = () => {
  const data = {};
  for (const curr of serviceData.allowedCurrencies) {
    data[curr] = { type: String, required: true };
    data[`${curr}_24h_change`] = { type: String, required: true };
  }
  return data;
};

const currencySchema = new Schema(currency());

const statistic = () => {
  const data = {};
  for (const id of serviceData.allowedIds) {
    data[id] = { type: currencySchema, required: true };
  }
  return data;
};

const currenciesStatisticSchema = new Schema(statistic());

const currenciesSchema = mongoose.model('currenciesStatistic', currenciesStatisticSchema);

module.exports = currenciesSchema;
