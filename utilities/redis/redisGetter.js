const { mainFeedCacheClient } = require('./redis');

exports.getAsync = async ({ key, client = mainFeedCacheClient }) => {
  try {
    return { result: await client.getAsync(key) };
  } catch (error) {
    return { error };
  }
};
