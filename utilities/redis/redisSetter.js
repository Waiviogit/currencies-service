const { lastBlockClient, mainFeedCacheClient } = require('./redis');

exports.hmsetAsync = async ({ key, data, client = lastBlockClient }) => {
  try {
    return { result: await client.hmsetAsync(key, data) };
  } catch (error) {
    return { error };
  }
};

exports.setAsync = async ({ key, data, client = mainFeedCacheClient }) => {
  try {
    return { result: await client.setAsync(key, data) };
  } catch (error) {
    return { error };
  }
};

exports.expireAsync = async ({ key, ttl, client = mainFeedCacheClient }) => {
  try {
    return { result: await client.expireAsync(key, ttl) };
  } catch (error) {
    return { error };
  }
};
