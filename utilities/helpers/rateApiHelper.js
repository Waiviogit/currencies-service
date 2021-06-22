const axios = require('axios');
const _ = require('lodash');

exports.getRates = async ({ url, params }) => {
  try {
    const result = await axios.get(url, { params });
    return { rates: _.get(result, 'data.rates') };
  } catch (error) {
    return { error };
  }
};
