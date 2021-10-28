const {
  BASE_CURRENCIES_HIVE_ENGINE, RATE_HIVE_ENGINE, SUPPORTED_CURRENCIES, STATISTIC_RECORD_TYPES,
} = require('constants/serviceData');
const mongoose = require('mongoose');
const _ = require('lodash');

const rates = () => _.reduce(
  RATE_HIVE_ENGINE,
  (acc, el) => {
    acc.rates[el] = { type: Number, required: true };
    return acc;
  },
  {
    dateString: { type: String, index: true },
    base: {
      type: String, default: SUPPORTED_CURRENCIES.USD, valid: BASE_CURRENCIES_HIVE_ENGINE,
    },
    type: {
      type: String,
      default: STATISTIC_RECORD_TYPES.ORDINARY,
      valid: Object.values(STATISTIC_RECORD_TYPES),
      index: true,
    },
    rates: {},
  },
);
const HiveEngineRateSchema = new mongoose.Schema(rates(), { versionKey: false });

const HiveEngineRateModel = mongoose.model('hive-engine-rate', HiveEngineRateSchema);

module.exports = HiveEngineRateModel;
