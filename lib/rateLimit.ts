const rateLimit = new Map<string, { count: number; windowStart: number }>();

export default function isRateLimited(
  ip: string,
  limit: number,
  interval: number 
): boolean {
  const currentTime = Date.now();
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