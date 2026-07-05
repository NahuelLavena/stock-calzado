const windowMs = 60 * 1000;
const isTesting = process.env.TESTING === "true";
const maxRequests = isTesting ? 1000 : 30;

const hits = new Map<string, { count: number; resetAt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of hits) {
    if (now > value.resetAt) {
      hits.delete(key);
    }
  }
}, windowMs);

export function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count };
}

export function checkAuthRateLimit(key: string): { allowed: boolean; remaining: number } {
  const authMax = isTesting ? 1000 : 5;
  const now = Date.now();
  const entry = hits.get(`auth:${key}`);

  if (!entry || now > entry.resetAt) {
    hits.set(`auth:${key}`, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: authMax - 1 };
  }

  if (entry.count >= authMax) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: authMax - entry.count };
}
