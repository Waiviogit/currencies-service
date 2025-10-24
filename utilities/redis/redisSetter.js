const { lastBlockClient, mainFeedCacheClient } = require('./redis');

exports.hmsetAsync = async ({ key, data, client = lastBlockClient }) => {
  try {
    return { result: await client.hmset(key, data) };
  } catch (error) {
    return { error };
  }
};

exports.setAsync = async ({ key, data, client = mainFeedCacheClient }) => {
  try {
    return { result: await client.set(key, data) };
  } catch (error) {
    return { error };
  }
};

exports.expireAsync = async ({ key, ttl, client = mainFeedCacheClient }) => {
  try {
    return { result: await client.expire(key, ttl) };
  } catch (error) {
    return { error };
  }
};
