const { hiveEngineRateModel } = require('models');

const getDailyChart = async ({ from, to }) => {
  const { result } = await hiveEngineRateModel.aggregate({
    pipeline: [
      {
        $match: {
          base: 'WAIV',
          dateTime: {
            $gte: from,
            $lt: to,
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$dateTime' },
            month: { $month: '$dateTime' },
            day: { $dayOfMonth: '$dateTime' },
            hour: { $hour: '$dateTime' },
          },
          averageRateUSD: { $avg: '$rates.USD' },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.day': 1,
          '_id.hour': 1,
        },
      },
    ],
  });

  return result;
};

const getMonthlyChart = async ({ from, to }) => {
  const { result } = await hiveEngineRateModel.aggregate({
    pipeline: [
      {
        $match: {
          base: 'WAIV',
          dateTime: {
            $gte: from,
            $lt: to,
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$dateTime' },
            month: { $month: '$dateTime' },
            day: { $dayOfMonth: '$dateTime' },
          },
          averageRateUSD: { $avg: '$rates.USD' },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.day': 1,
        },
      },
    ],
  });

  return result;
};

const getYearChart = async ({ from, to }) => {
  const { result } = await hiveEngineRateModel.aggregate({
    pipeline: [
      {
        $match: {
          base: 'WAIV',
          dateTime: {
            $gte: from,
            $lt: to,
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$dateTime' },
            week: { $week: '$dateTime' },
          },
          averageRateUSD: { $avg: '$rates.USD' },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.week': 1,
        },
      },
    ],
  });

  return result;
};

const chartTypeCall = {
  day: getDailyChart,
  sevenDays: getDailyChart,
  month: getMonthlyChart,
  threeMonths: getMonthlyChart,
  sixMonths: getMonthlyChart,
  year: getYearChart,
  twoYears: getYearChart,
  all: getYearChart,
};
const getChart = async ({ type }) => {
  const now = new Date();

  const dateObject = {
    day: new Date(now.getTime() - (1 * 24 * 60 * 60 * 1000)),
    sevenDays: new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)),
    month: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()),
    threeMonths: new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()),
    sixMonths: new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()),
    year: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
    twoYears: new Date(now.getFullYear() - 2, now.getMonth(), now.getDate()),
    all: new Date(2020, 0, 1),
  };

  const result = await chartTypeCall[type]({ from: dateObject[type], to: now });

  return result;
};

module.exports = {
  getChart,
};
