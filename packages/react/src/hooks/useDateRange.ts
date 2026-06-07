import { useCallback, useMemo, useState } from 'react';

export type DateRangePresetId =
  | 'today'
  | 'yesterday'
  | 'this-week'
  | 'last-week'
  | 'this-month'
  | 'last-month'
  | 'last-7-days'
  | 'last-30-days'
  | 'year-to-date';

export interface DateRangeValue {
  /** ISO date `YYYY-MM-DD` or `null`. */
  from: string | null;
  to: string | null;
}

export interface UseDateRangeResult extends DateRangeValue {
  setRange: (next: Partial<DateRangeValue>) => void;
  preset: (id: DateRangePresetId) => void;
  /** Returns true if the current range matches the given preset (compared by ISO strings). */
  isPreset: (id: DateRangePresetId) => boolean;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function toIso(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function startOfWeek(d: Date, weekStartsOn: 0 | 1 = 1): Date {
  const out = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = out.getDay();
  const offset = (day - weekStartsOn + 7) % 7;
  out.setDate(out.getDate() - offset);
  return out;
}

function endOfWeek(d: Date, weekStartsOn: 0 | 1 = 1): Date {
  const start = startOfWeek(d, weekStartsOn);
  start.setDate(start.getDate() + 6);
  return start;
}

function computeRange(id: DateRangePresetId, now: Date): DateRangeValue {
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();

  switch (id) {
    case 'today': {
      const t = toIso(new Date(y, m, d));
      return { from: t, to: t };
    }
    case 'yesterday': {
      const y1 = new Date(y, m, d - 1);
      const t = toIso(y1);
      return { from: t, to: t };
    }
    case 'this-week':
      return { from: toIso(startOfWeek(now)), to: toIso(endOfWeek(now)) };
    case 'last-week': {
      const prev = new Date(y, m, d - 7);
      return { from: toIso(startOfWeek(prev)), to: toIso(endOfWeek(prev)) };
    }
    case 'this-month':
      return { from: toIso(new Date(y, m, 1)), to: toIso(new Date(y, m + 1, 0)) };
    case 'last-month':
      return { from: toIso(new Date(y, m - 1, 1)), to: toIso(new Date(y, m, 0)) };
    case 'last-7-days':
      return { from: toIso(new Date(y, m, d - 6)), to: toIso(new Date(y, m, d)) };
    case 'last-30-days':
      return { from: toIso(new Date(y, m, d - 29)), to: toIso(new Date(y, m, d)) };
    case 'year-to-date':
      return { from: toIso(new Date(y, 0, 1)), to: toIso(new Date(y, m, d)) };
  }
}

/**
 * Paired date-range hook for the `forms-date-range-picker` recipe. Returns
 * ISO strings (`YYYY-MM-DD`) for `from` and `to`, plus a set of named presets.
 * Swaps `from`/`to` automatically if a custom range is set with `from > to`.
 */
export function useDateRange(initial: DateRangeValue = { from: null, to: null }): UseDateRangeResult {
  const [from, setFrom] = useState<string | null>(initial.from);
  const [to, setTo] = useState<string | null>(initial.to);

  const setRange = useCallback((next: Partial<DateRangeValue>) => {
    const nextFrom = next.from !== undefined ? next.from : from;
    const nextTo = next.to !== undefined ? next.to : to;
    if (nextFrom && nextTo && nextFrom > nextTo) {
      setFrom(nextTo);
      setTo(nextFrom);
    } else {
      if (next.from !== undefined) setFrom(next.from);
      if (next.to !== undefined) setTo(next.to);
    }
  }, [from, to]);

  const preset = useCallback((id: DateRangePresetId) => {
    const r = computeRange(id, new Date());
    setFrom(r.from);
    setTo(r.to);
  }, []);

  const isPreset = useMemo(
    () => (id: DateRangePresetId) => {
      const r = computeRange(id, new Date());
      return r.from === from && r.to === to;
    },
    [from, to],
  );

  return { from, to, setRange, preset, isPreset };
}
