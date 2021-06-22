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
