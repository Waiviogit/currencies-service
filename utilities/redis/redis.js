const redis = require('ioredis');
const config = require('../../config');

const lastBlockClient = redis.createClient();
const mainFeedCacheClient = redis.createClient();

lastBlockClient.select(config.redis.lastBlock);
mainFeedCacheClient.select(config.redis.mainFeedsCache);

module.exports = { lastBlockClient, mainFeedCacheClient };
