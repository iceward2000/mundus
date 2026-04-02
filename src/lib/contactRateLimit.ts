/**
 * In-memory sliding-window rate limit for POST /api/contact.
 * Best for single-instance / long-lived Node. On multi-instance serverless, use Redis/KV (e.g. Upstash).
 */

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 5;
const PRUNE_EVERY = 200;

let requestCount = 0;
const buckets = new Map<string, number[]>();

function pruneStale(now: number) {
  for (const [ip, stamps] of buckets) {
    const fresh = stamps.filter((t) => now - t < WINDOW_MS);
    if (fresh.length === 0) buckets.delete(ip);
    else buckets.set(ip, fresh);
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real;
  return "unknown";
}

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSec: number };

export function checkContactRateLimit(ip: string): RateLimitResult {
  const now = Date.now();

  requestCount++;
  if (requestCount % PRUNE_EVERY === 0) pruneStale(now);

  const prev = buckets.get(ip) ?? [];
  const stamps = prev.filter((t) => now - t < WINDOW_MS);

  if (stamps.length >= MAX_REQUESTS) {
    const oldest = stamps[0]!;
    const retryAfterMs = WINDOW_MS - (now - oldest);
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
  }

  stamps.push(now);
  buckets.set(ip, stamps);
  return { allowed: true };
}
