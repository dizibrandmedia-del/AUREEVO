interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const memoryStore: RateLimitStore = {};

// Clean up expired buckets every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const key in memoryStore) {
      if (memoryStore[key].resetTime < now) {
        delete memoryStore[key];
      }
    }
  }, 300000);
}

export interface RateLimitOptions {
  windowMs: number; // Duration in milliseconds
  max: number; // Max requests in window
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export async function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { windowMs: 60000, max: 100 }
): Promise<RateLimitResult> {
  const now = Date.now();
  const bucket = memoryStore[identifier];

  if (!bucket || bucket.resetTime < now) {
    memoryStore[identifier] = {
      count: 1,
      resetTime: now + options.windowMs,
    };
    return {
      success: true,
      limit: options.max,
      remaining: options.max - 1,
      reset: Math.ceil((now + options.windowMs) / 1000),
    };
  }

  bucket.count += 1;

  if (bucket.count > options.max) {
    return {
      success: false,
      limit: options.max,
      remaining: 0,
      reset: Math.ceil(bucket.resetTime / 1000),
    };
  }

  return {
    success: true,
    limit: options.max,
    remaining: Math.max(0, options.max - bucket.count),
    reset: Math.ceil(bucket.resetTime / 1000),
  };
}
