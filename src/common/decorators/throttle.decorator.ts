import { SetMetadata } from '@nestjs/common';

/**
 * Throttle Decorator
 * Used to apply rate limiting to specific endpoints
 */
export const THROTTLE_KEY = 'throttle';
export const Throttle = (limit: number, ttl: number) =>
  SetMetadata(THROTTLE_KEY, { limit, ttl });

/**
 * Skip Throttle Decorator
 * Used to skip rate limiting for specific endpoints
 */
export const SKIP_THROTTLE_KEY = 'skipThrottle';
export const SkipThrottle = () => SetMetadata(SKIP_THROTTLE_KEY, true);
