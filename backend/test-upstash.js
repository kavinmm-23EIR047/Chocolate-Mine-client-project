const { Redis } = require('@upstash/redis');
require('dotenv').config();

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function test() {
  const start = Date.now();
  await redis.get('test');
  const end = Date.now();
  console.log(`Time taken: ${end - start}ms`);
}

test();
