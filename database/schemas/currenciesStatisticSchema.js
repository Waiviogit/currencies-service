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

const currencySchema = new Schema(currency(), { _id: false });

const statistic = () => {
  const data = {};
  for (const id of serviceData.allowedIds) {
    data[id] = { type: currencySchema, required: true };
  }
  data.type = {
    type: String, default: 'ordinaryData', valid: ['ordinaryData', 'dailyData'], index: true,
  };
  return data;
};

const currenciesStatisticSchema = new Schema(statistic(), { timestamps: true });

currenciesStatisticSchema.index({ createdAt: 1 });

const currenciesSchema = mongoose.model('currencies-statistic', currenciesStatisticSchema);

module.exports = currenciesSchema;
