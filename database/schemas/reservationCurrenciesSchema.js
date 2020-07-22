const mongoose = require('mongoose');

const { Schema } = mongoose;

const reservationCurrencies = new Schema({
  hiveCurrency: { type: Number, required: true },
}, { timestamps: false });

const currenciesSchema = mongoose.model('reservation-currencies', reservationCurrencies);

module.exports = currenciesSchema;
