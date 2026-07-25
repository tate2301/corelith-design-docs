/**
 * Lightweight className combiner. Avoids pulling in clsx/classnames so the
 * package has zero runtime dependencies.
 *
 * Accepts strings, falsy values (skipped), and { [class]: boolean } maps.
 */
export type ClassValue = string | number | false | null | undefined | { [key: string]: unknown };

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  for (const v of inputs) {
    if (!v) continue;
    if (typeof v === 'string' || typeof v === 'number') {
      out.push(String(v));
    } else if (typeof v === 'object') {
      for (const k in v) if (v[k]) out.push(k);
    }
  }
  return out.join(' ');
}
