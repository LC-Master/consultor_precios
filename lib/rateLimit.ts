const rateLimit = new Map<string, { count: number; windowStart: number }>();
const MAX_TRACKED_IPS = 5000;
const PRUNE_INTERVAL_MS = 60_000;
let lastPruneAt = 0;

function pruneRateLimitMap(currentTime: number, interval: number) {
  if (currentTime - lastPruneAt < PRUNE_INTERVAL_MS && rateLimit.size < MAX_TRACKED_IPS) {
    return;
  }

  for (const [ip, record] of rateLimit.entries()) {
    if (currentTime - record.windowStart > interval * 2) {
      rateLimit.delete(ip);
    }
  }

  if (rateLimit.size > MAX_TRACKED_IPS) {
    const entriesByAge = Array.from(rateLimit.entries()).sort((a, b) => a[1].windowStart - b[1].windowStart);
    const removeCount = rateLimit.size - MAX_TRACKED_IPS;
    for (let index = 0; index < removeCount; index += 1) {
      const entry = entriesByAge[index];
      if (entry) rateLimit.delete(entry[0]);
    }
  }

  lastPruneAt = currentTime;
}

export default function isRateLimited(
  ip: string,
  limit: number,
  interval: number 
): boolean {
  const currentTime = Date.now();
  pruneRateLimitMap(currentTime, interval);
  const record = rateLimit.get(ip);

  if (!record || (currentTime - record.windowStart) > interval) {
    rateLimit.set(ip, { count: 1, windowStart: currentTime });
    return false;
  }

  record.count += 1;

  if (record.count > limit) {
    return true; 
  }

  return false;
}