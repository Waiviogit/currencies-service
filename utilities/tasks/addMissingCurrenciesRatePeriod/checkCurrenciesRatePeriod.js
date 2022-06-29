const { currenciesRateModel } = require('models');
const moment = require('moment');
const _ = require('lodash');
const addRatesByDate = require('../addMissingDateRates/addRates');

exports.checkCurrenciesRatePeriod = async (startDate, endDate) => {
  const { result, error } = await currenciesRateModel.find({
    dateString: {
      $gte: startDate,
      $lte: endDate,
    },
  });
  if (error) {
    console.error(error);
    console.log('task completed!');

    return;
  }

  const missingDates = getMissingDates(result.map((el) => moment(el.dateString)));
  for (const date of missingDates) await addRatesByDate({ date });
  console.log('task completed!');
};

const getMissingDates = (data) => {
  const missingDates = [];
  for (let count = 0; count < data.length - 1; count++) {
    const dayDifference = Math.abs(data[count].diff(data[count + 1], 'days'));
    if (dayDifference > 1) {
      missingDates.push(...collectDatesWithDifference(dayDifference, data[count]));
    }
  }

  return missingDates;
};

const collectDatesWithDifference = (dayDifference, date) => {
  const missingDates = [];
  for (let count = 1; count < dayDifference; count++) {
    const dateToRemember = _.cloneDeep(date);
    missingDates.push(dateToRemember.add(count, 'days').toDate());
  }

  return missingDates;
};
