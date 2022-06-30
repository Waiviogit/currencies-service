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

exports.find = async ({
  condition, projection, sort = {}, limit, skip = 0,
}) => {
  try {
    return {
      result: await HiveEngineRateSchema
        .find(condition, projection)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
    };
  } catch (error) {
    return { error };
  }
};

exports.findOne = async ({
  condition, projection, sort = {}
}) => {
  try {
    return {
      result: await HiveEngineRateSchema
        .findOne(condition, projection)
        .sort(sort)
        .lean(),
    };
  } catch (error) {
    return { error };
  }
};
