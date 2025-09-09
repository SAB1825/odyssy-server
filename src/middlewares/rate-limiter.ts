import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error';
import { HTTPSTATUS } from '../config/http-codes';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};
const WINDOW_SIZE = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10; // 10 requests per minute per user

export const codeExecutionRateLimit = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.userId as string;
  const now = Date.now();
  
  // Clean up expired entries
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });

  if (!store[userId]) {
    store[userId] = {
      count: 1,
      resetTime: now + WINDOW_SIZE
    };
    return next();
  }

  if (store[userId].resetTime < now) {
    store[userId] = {
      count: 1,
      resetTime: now + WINDOW_SIZE
    };
    return next();
  }

  if (store[userId].count >= MAX_REQUESTS) {
    throw new AppError(
      'Rate limit exceeded. Please try again later.',
      HTTPSTATUS.TOO_MANY_REQUESTS,
      'RATE_LIMIT_EXCEEDED'
    );
  }

  store[userId].count++;
  next();
};
