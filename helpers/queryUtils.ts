export function getFirstOrValue<T>(value: T | T[]): T | undefined {
  return Array.isArray(value) ? value[0] : value;
}
