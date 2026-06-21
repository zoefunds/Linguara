import rateLimit from 'express-rate-limit';
import { redis } from '../config/redis';

const redisStore = {
  sendCommand: (...args: string[]) => (redis as any).call(...args),
};

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { success: false, message: 'Rate limit exceeded' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const translationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, message: 'Translation rate limit exceeded' },
  standardHeaders: true,
  legacyHeaders: false,
});
