const { mainFeedCacheClient } = require('./redis');

exports.getAsync = async ({ key, client = mainFeedCacheClient }) => {
  try {
    return { result: await client.get(key) };
  } catch (error) {
    return { error };
  }
};
