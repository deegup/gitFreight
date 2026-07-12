type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
export function allowRequest(key: string, limit = 120, windowMs = 60_000) {
  const now = Date.now(); const previous = buckets.get(key);
  const bucket = !previous || previous.resetAt < now ? { count: 0, resetAt: now + windowMs } : previous;
  bucket.count += 1; buckets.set(key, bucket);
  return { allowed: bucket.count <= limit, remaining: Math.max(0, limit - bucket.count), resetAt: bucket.resetAt };
}
