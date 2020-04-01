const { CurrenciesSchema } = require('database').models;

const create = async (data) => {
  try {
    const newCurrencies = new CurrenciesSchema(data);
    return { currencies: await newCurrencies.save() };
  } catch (error) {
    console.error(error.message);
    return { error };
  }
};

const find = async ({
  condition, sort = { createdAt: -1 }, limit = 1, skip = 0,
}) => {
  try {
    return {
      result: await CurrenciesSchema
        .find(condition)
        .sort(sort)
        .skip(skip)
        .limit(limit),
    };
  } catch (error) {
    return { error };
  }
};

module.exports = { find, create };
