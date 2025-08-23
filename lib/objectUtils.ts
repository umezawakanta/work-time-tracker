export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const out = {} as Pick<T, K>;
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      (out as any)[k] = obj[k];
    }
  }
  return out;
}
