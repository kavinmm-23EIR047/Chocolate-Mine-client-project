const Redis = require('ioredis');
const logger = require('../utils/logger');

let redis;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  // Convert REST URL to TCP Host
  const hostUrl = process.env.UPSTASH_REDIS_REST_URL.replace('https://', '').replace(/\/$/, '');
  
  let host = hostUrl;
  let port = 6379; // Upstash default TLS port
  
  if (hostUrl.includes(':')) {
    const parts = hostUrl.split(':');
    host = parts[0];
    port = parseInt(parts[1], 10);
  }

  redis = new Redis({
    host,
    port,
    password: process.env.UPSTASH_REDIS_REST_TOKEN,
    tls: {} // Required for Upstash
  });

  redis.on('connect', () => {
    logger.info('Upstash Redis Connected (TCP via ioredis)');
  });

  redis.on('error', (err) => {
    logger.error('Redis TCP Connection Error:', err);
  });
} else {
  logger.warn('Redis credentials missing, running without Redis');
}

module.exports = redis;
