// Utility for deep comparison
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2 || typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;
  if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }
  return true;
}
