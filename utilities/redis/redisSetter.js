const { lastBlockClient } = require('./redis');

exports.hmsetAsync = async ({ key, data, client = lastBlockClient }) => {
  try {
    return { result: await client.hmsetAsync(key, data) };
  } catch (error) {
    return { error };
  }
};
