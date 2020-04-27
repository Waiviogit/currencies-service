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
        .limit(limit)
        .lean(),
    };
  } catch (error) {
    return { error };
  }
};

const aggregate = async (pipeline) => {
  try {
    return { result: await CurrenciesSchema.aggregate(pipeline) };
  } catch (error) {
    return { error };
  }
};

module.exports = { find, create, aggregate };
