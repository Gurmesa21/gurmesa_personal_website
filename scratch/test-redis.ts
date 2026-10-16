import { ContactRateLimiter, RedisStore } from '../lib/rate-limit/index.js';
import Redis from 'ioredis';

async function run() {
  const redis = new Redis('redis://localhost:6379');
  await redis.flushdb();
  const store = new RedisStore('redis://localhost:6379');
  const limiter = new ContactRateLimiter(store);
  
  for (let i=0; i<4; i++) {
    const res = await limiter.check('1.2.3.4', 'test@test.com');
    console.log(`Req ${i+1}: allowed=${res.allowed}`);
  }
  await redis.quit();
}
run().catch(console.error);
