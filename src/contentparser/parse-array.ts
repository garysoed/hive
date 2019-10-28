export function parseArray(str: string): unknown[] {
  const obj = JSON.parse(str);
  if (!(obj instanceof Array)) {
    return [obj];
  }

  return obj;
}
