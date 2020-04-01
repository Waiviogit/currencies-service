const axios = require('axios');
const _ = require('lodash');

const getCurrenciesFromRequest = async ({ ids, currencies }) => {
  try {
    const result = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids.toString()}&vs_currencies=${currencies.toString()}&include_24hr_change=true`,
    );
    return { result: result.data };
  } catch (error) {
    return { error: { message: error.message, status: _.get(error, 'response.status', 403) } };
  }
};

module.exports = { getCurrenciesFromRequest };
