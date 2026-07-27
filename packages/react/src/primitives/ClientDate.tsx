"use client";

import { useEffect, useState, type ReactNode } from 'react';

export type ClientDateMode = 'datetime' | 'date';

export interface ClientDateProps {
  /** ISO 8601 timestamp. `null`/`undefined`/unparseable renders `fallback`. */
  value: string | null | undefined;
  /** `date` renders the day only, `datetime` includes the time. @default 'datetime' */
  mode?: ClientDateMode;
  /** Rendered when there is no usable value. @default '—' */
  fallback?: ReactNode;
}

/**
 * ClientDate — renders a timestamp in the *viewer's* locale without tripping
 * React hydration error #418.
 *
 * Two invariants make that work, and both are load-bearing:
 *
 *  1. **It returns a bare fragment, never a wrapper element.** No `<span>`, no
 *     class hook. That is what lets it sit inline inside a table cell, a
 *     sentence, or a `<title>`-like text run without disturbing layout. Wrap it
 *     yourself if you need a styling target.
 *  2. **Before mount it emits a plain string slice of the raw ISO input** —
 *     `value.slice(0, 10)` for `date`, `value.slice(0, 16).replace('T', ' ')`
 *     for `datetime`. Nothing derived from `new Date()` reaches the first
 *     paint, because the server's locale and timezone differ from the browser's
 *     and any `toLocale*` output would mismatch during hydration. Only after
 *     the mount effect does it swap to `toLocaleDateString()` /
 *     `toLocaleString()`.
 *
 * Hooks run before every early return, so hook order stays stable across the
 * fallback, pre-mount, and mounted renders.
 *
 * @example
 * ```tsx
 * <td><ClientDate value={invoice.issuedAt} mode="date" /></td>
 * <span>Updated <ClientDate value={row.updatedAt} fallback="never" /></span>
 * ```
 */
export function ClientDate({ value, mode = 'datetime', fallback = '—' }: ClientDateProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!value) return <>{fallback}</>;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return <>{fallback}</>;

  if (!mounted) {
    // SSR-stable: identical bytes on server and first client render.
    return <>{mode === 'date' ? value.slice(0, 10) : value.slice(0, 16).replace('T', ' ')}</>;
  }

  return <>{mode === 'date' ? d.toLocaleDateString() : d.toLocaleString()}</>;
}
