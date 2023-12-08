const { HiveEngineRateSchema } = require('database').models;

const addDateTime = async () => {
  const rates = HiveEngineRateSchema.find({});

  for await (const rate of rates) {
    const timestamp = rate._id.getTimestamp(); // Extract timestamp from ObjectId
    const dateTime = new Date(timestamp);

    await HiveEngineRateSchema.updateOne(
      { _id: rate._id },
      { $set: { dateTime } },
    );
  }

  console.log('task finished');
};

module.exports = addDateTime;
