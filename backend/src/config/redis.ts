import Redis from 'ioredis';
import { config } from './env';

export const redis = new Redis(config.redis.url, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 100, 3000),
  tls: config.redis.url.startsWith('rediss://') ? {} : undefined,
});

redis.on('connect', () => console.log('✓ Redis connected'));
redis.on('error', (err) => console.error('Redis error:', err.message));

export const CACHE_TTL = {
  SESSION: 60 * 60 * 24 * 7,   // 7 days
  RATE_LIMIT: 60 * 15,          // 15 min
  TRANSLATION: 60 * 60,         // 1 hour
} as const;
