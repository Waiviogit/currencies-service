const { ReservationCurrenciesSchema } = require('database').models;


exports.create = async (data) => {
  try {
    const newCurrencies = new ReservationCurrenciesSchema(data);
    return { currencies: await newCurrencies.save() };
  } catch (error) {
    console.error(error.message);
    return { error };
  }
};
