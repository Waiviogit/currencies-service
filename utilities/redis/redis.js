const redis = require('redis');
const bluebird = require('bluebird');
const config = require('../../config');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const lastBlockClient = redis.createClient(process.env.REDISCLOUD_URL);

lastBlockClient.select(config.redis.lastBlock);

module.exports = { lastBlockClient };
