export function objectToMap<T>(obj: {[key: string]: T}): ReadonlyMap<string, T> {
  const map = new Map<string, T>();
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) {
      continue;
    }

    map.set(key, obj[key]);
  }

  return map;
}
