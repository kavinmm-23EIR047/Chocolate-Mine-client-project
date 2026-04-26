const redis = require('../config/redis');
const logger = require('../utils/logger');

const cacheService = {
  get: async (key) => {
    try {
      return await redis.get(key);
    } catch (err) {
      logger.error(`Redis Get Error [${key}]:`, err);
      return null;
    }
  },

  set: async (key, value, ttl = 300) => {
    try {
      await redis.set(key, value, { ex: ttl });
    } catch (err) {
      logger.error(`Redis Set Error [${key}]:`, err);
    }
  },

  del: async (key) => {
    try {
      await redis.del(key);
    } catch (err) {
      logger.error(`Redis Del Error [${key}]:`, err);
    }
  },
};

module.exports = cacheService;
