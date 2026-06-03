// Tiny classname joiner. No deps.
export type ClassValue = string | number | bigint | boolean | null | undefined;

export function cx(...values: ClassValue[]): string {
  let out = '';
  for (const v of values) {
    if (v === false || v === null || v === undefined || v === '') continue;
    if (out) out += ' ';
    out += String(v);
  }
  return out;
}
