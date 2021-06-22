const axios = require('axios');

exports.getRates = async ({ url, params, callback }) => {
  try {
    const result = await axios.get(url, { params });
    return { rates: callback(result) };
  } catch (error) {
    return { error };
  }
};
