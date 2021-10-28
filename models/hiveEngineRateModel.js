const { HiveEngineRateSchema } = require('database').models;

exports.create = async (data) => {
  try {
    const newRates = new HiveEngineRateSchema(data);
    return { result: await newRates.save() };
  } catch (error) {
    return { error };
  }
};

exports.aggregate = async (pipeline) => {
  try {
    return { result: await HiveEngineRateSchema.aggregate(pipeline) };
  } catch (error) {
    return { error };
  }
};
