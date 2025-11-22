import { Redis } from 'ioredis';
import "dotenv/config";

const redis = new Redis(process.env.REDIS_URL || '');

redis.on('error', (err) => {
  console.log('Redis connection error:', err.message);
});

redis.on('connect', () => {
  console.log('Redis connected successfully');
});

export default redis;