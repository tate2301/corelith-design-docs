/**
 * Accent palette — the TypeScript face of `styles/accents.css`.
 *
 * Two things live here that CSS can't express:
 *
 *  1. The hue list as a value, so pickers, legends and docs can enumerate it
 *     instead of hard-coding thirteen strings.
 *  2. `accentFor(seed)` — a deterministic string → hue hash. This is the part
 *     that actually removes the grayscale feeling from a live app: avatars,
 *     tags, workspaces and channels get stable colour derived from their own
 *     name, with no palette assignment stored anywhere. Same name, same hue,
 *     forever, on every client.
 */

/** The thirteen accent hues, in wheel order (gray first, then red → brown). */
export const ACCENT_HUES = [
  'gray',
  'red',
  'orange',
  'amber',
  'yellow',
  'green',
  'teal',
  'cyan',
  'blue',
  'indigo',
  'violet',
  'pink',
  'brown',
] as const;

export type AccentHue = (typeof ACCENT_HUES)[number];

/** Semantic names that resolve to a hue through the same CSS channel. */
export const ACCENT_ALIASES = [
  'brand',
  'info',
  'success',
  'warn',
  'danger',
  'neutral',
] as const;

export type AccentAlias = (typeof ACCENT_ALIASES)[number];

/**
 * Anything accepted by an `accent` prop or the `data-accent` attribute — a
 * hue or one of the semantic aliases.
 */
export type Accent = AccentHue | AccentAlias;

/** Which hue each alias resolves to. Mirrors the aliases in `accents.css`. */
export const ACCENT_ALIAS_HUE: Record<AccentAlias, AccentHue> = {
  brand: 'blue',
  info: 'blue',
  success: 'green',
  warn: 'amber',
  danger: 'red',
  neutral: 'gray',
};

/**
 * The rotation used for hashing and for chart series. Gray is excluded — a
 * gray "colour" defeats the point — and the order is chosen so that adjacent
 * entries differ in both hue and lightness. Two channels named back to back
 * never come out as two shades of the same thing.
 */
export const ACCENT_CYCLE: readonly AccentHue[] = [
  'blue',
  'teal',
  'violet',
  'amber',
  'pink',
  'green',
  'indigo',
  'orange',
  'cyan',
  'red',
  'brown',
  'yellow',
];

/** Resolve an alias to its hue; hues pass through unchanged. */
export function resolveAccent(accent: Accent): AccentHue {
  return (ACCENT_ALIAS_HUE as Record<string, AccentHue | undefined>)[accent] ?? (accent as AccentHue);
}

/**
 * FNV-1a, 32-bit. Chosen over `String.prototype` arithmetic because it spreads
 * short, similar inputs ("Alicia Reed" / "Alicia Ross") across the range
 * instead of clustering them — which is exactly the failure mode you notice
 * when six people in a list all get the same avatar colour.
 */
function hash32(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    // h *= 16777619, kept in 32-bit range without overflowing the float mantissa.
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Map a stable identifier onto an accent hue.
 *
 * Pass whatever identifies the thing — a name, an id, an email. Case and
 * surrounding whitespace are ignored so "Modal" and "modal " agree.
 *
 * @param seed  the identifier. Empty/undefined returns `'gray'`.
 * @param cycle optional hue list to draw from (defaults to {@link ACCENT_CYCLE}).
 *
 * @example
 * ```tsx
 * <Avatar name="Alicia Reed" accent={accentFor('Alicia Reed')} />
 * ```
 */
export function accentFor(
  seed: string | null | undefined,
  cycle: readonly AccentHue[] = ACCENT_CYCLE,
): AccentHue {
  const key = (seed ?? '').trim().toLowerCase();
  if (!key || cycle.length === 0) return 'gray';
  return cycle[hash32(key) % cycle.length]!;
}

/** The six CSS custom properties a hue exposes. */
export type AccentRole = 'solid' | 'on' | 'fg' | 'bg' | 'bg-hover' | 'bd';

/**
 * `var(--accent-<hue>-<role>)` for a specific hue — for the rare case where a
 * value has to be inlined (an SVG `fill`, a canvas draw call) instead of
 * inherited through `data-accent`.
 *
 * @example accentVar('violet', 'solid') // "var(--accent-violet-solid)"
 */
export function accentVar(accent: Accent, role: AccentRole = 'solid'): string {
  return `var(--accent-${resolveAccent(accent)}-${role})`;
}

/**
 * The chart series palette as CSS variable references, `--chart-1` upward and
 * wrapping. Use this rather than literal hex so a consumer who retokens the
 * palette gets retinted charts for free.
 */
export const CHART_SERIES_COUNT = 10;

export function chartSeriesVar(index: number): string {
  const slot = ((index % CHART_SERIES_COUNT) + CHART_SERIES_COUNT) % CHART_SERIES_COUNT;
  return `var(--chart-${slot + 1})`;
}

/** The full series palette, in order. */
export const CHART_SERIES: readonly string[] = Array.from(
  { length: CHART_SERIES_COUNT },
  (_, i) => chartSeriesVar(i),
);
