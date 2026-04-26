const { Redis } = require('@upstash/redis');
const logger = require('../utils/logger');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

(async () => {
  try {
    await redis.set('health_check', 'ok');
    logger.info('Upstash Redis Connected');
  } catch (err) {
    logger.error('Redis Connection Error:', err);
  }
})();

module.exports = redis;
