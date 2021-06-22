const { CurrenciesRateSchema } = require('database').models;

exports.updateOne = async (filter, updateData) => {
  try {
    return {
      result: await CurrenciesRateSchema.updateOne(
        filter,
        updateData,
        { upsert: true },
      ),
    };
  } catch (error) {
    return { error };
  }
};

exports.findOne = async ({ condition, select, sort }) => {
  try {
    return {
      result: await CurrenciesRateSchema.findOne(condition, select).sort(sort).lean(),
    };
  } catch (error) {
    return { error };
  }
};
