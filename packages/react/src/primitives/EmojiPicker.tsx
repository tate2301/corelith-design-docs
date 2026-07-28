"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';
import { Popover, PopoverContent, PopoverTrigger } from './Popover';
import { Emoji, useEmojiConfig, type EmojiSet } from './Emoji';
import {
  EMOJI,
  EMOJI_CATEGORIES,
  SKIN_TONES,
  applySkinTone,
  emojiFromChar,
  searchEmoji,
  type EmojiCategory,
  type EmojiCategoryId,
  type EmojiEntry,
  type SkinToneId,
} from '../utils/emoji';

/* ── Recents ──────────────────────────────────────────────── */

const RECENT_KEY = 'corelith:emoji:recent';
const RECENT_MAX = 24;

export interface UseRecentEmojiResult {
  /** Most recently used glyphs, newest first. */
  recent: string[];
  /** Record a use — moves the glyph to the front. */
  push: (glyph: string) => void;
  /** Forget everything. */
  clear: () => void;
}

/**
 * useRecentEmoji — a small localStorage-backed MRU list for the picker.
 *
 * Reads lazily on mount rather than during render so the hook is safe under
 * SSR and hydration: the server and the first client render agree on an empty
 * list, then the stored list arrives.
 *
 * @param key storage key, if you want per-surface recents. @default 'corelith:emoji:recent'
 */
export function useRecentEmoji(key: string = RECENT_KEY): UseRecentEmojiResult {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) setRecent(parsed.filter((v): v is string => typeof v === 'string'));
      }
    } catch {
      // Private-mode / disabled storage — recents are a nicety, not a feature
      // worth throwing over.
    }
  }, [key]);

  const push = useCallback(
    (glyph: string) => {
      setRecent((prev) => {
        const next = [glyph, ...prev.filter((g) => g !== glyph)].slice(0, RECENT_MAX);
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [key],
  );

  const clear = useCallback(() => {
    setRecent([]);
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }, [key]);

  return { recent, push, clear };
}

/* ── Picker ───────────────────────────────────────────────── */

/** A rendered group: a category heading plus its entries. */
interface EmojiGroup {
  category: EmojiCategory;
  entries: EmojiEntry[];
}

export interface EmojiPickerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /**
   * Fires when a glyph is chosen. `glyph` already has the active skin tone
   * applied — it's what you store or insert.
   */
  onSelect?: (glyph: string, entry: EmojiEntry) => void;
  /** Emoji set to browse. @default the bundled curated set */
  emoji?: readonly EmojiEntry[];
  /** Recently used glyphs, shown in a leading group. */
  recent?: readonly string[];
  /** Controlled skin tone. */
  tone?: SkinToneId;
  /** Initial skin tone when uncontrolled. @default 'default' */
  defaultTone?: SkinToneId;
  /** Fires when the tone changes. */
  onToneChange?: (tone: SkinToneId) => void;
  /** Hide the skin-tone selector. */
  hideToneSelector?: boolean;
  /** Hide the preview/tone footer entirely. */
  hideFooter?: boolean;
  /** Grid columns. Also drives left/right arrow stepping. @default 8 */
  columns?: number;
  /** Search field placeholder. @default 'Search emoji' */
  searchPlaceholder?: string;
  /** Focus the search field on mount. @default true */
  autoFocus?: boolean;
  /** Artwork override, passed through to each glyph. */
  set?: EmojiSet;
  /** Rendered when a search returns nothing. */
  emptyState?: ReactNode;
  /** Extra row pinned to the bottom of the panel, below the preview footer. */
  footer?: ReactNode;
}

type GridCssVars = CSSProperties & { '--emoji-cols'?: string };

/**
 * EmojiPicker — searchable emoji grid with category rail, skin tones and full
 * keyboard navigation. Renders iOS artwork through {@link Emoji}.
 *
 * Keyboard model: the grid is one roving-tabindex widget. Arrows move over the
 * *visible* entries (wrapping row to row), Home/End jump to the ends, Enter or
 * Space selects. Typing anywhere goes to the search field, which stays focused
 * — so search-then-arrow-then-enter works without a single Tab press, which is
 * how people actually use these.
 *
 * @example
 * ```tsx
 * const { recent, push } = useRecentEmoji();
 * <EmojiPicker
 *   recent={recent}
 *   onSelect={(glyph) => { push(glyph); insert(glyph); }}
 * />
 * ```
 */
export const EmojiPicker = forwardRef<HTMLDivElement, EmojiPickerProps>(function EmojiPicker(
  {
    onSelect,
    emoji = EMOJI,
    recent,
    tone: toneProp,
    defaultTone = 'default',
    onToneChange,
    hideToneSelector,
    hideFooter,
    columns = 8,
    searchPlaceholder = 'Search emoji',
    autoFocus = true,
    set,
    emptyState,
    footer,
    className,
    style,
    ...rest
  },
  ref,
) {
  const config = useEmojiConfig();
  const [query, setQuery] = useState('');
  const [uncontrolledTone, setUncontrolledTone] = useState<SkinToneId>(defaultTone);
  const [activeIndex, setActiveIndex] = useState(0);
  const [toneOpen, setToneOpen] = useState(false);

  const tone = toneProp ?? uncontrolledTone;
  const setTone = (next: SkinToneId) => {
    if (toneProp === undefined) setUncontrolledTone(next);
    onToneChange?.(next);
  };

  const bodyRef = useRef<HTMLDivElement | null>(null);
  const groupRefs = useRef(new Map<EmojiCategoryId, HTMLDivElement | null>());
  const searchRef = useRef<HTMLInputElement | null>(null);

  // ── What to render ────────────────────────────────────────
  const groups = useMemo<EmojiGroup[]>(() => {
    const trimmed = query.trim();

    if (trimmed) {
      const results = searchEmoji(trimmed, { emoji, limit: 120 });
      if (results.length === 0) return [];
      return [
        {
          category: { id: 'recent', label: 'Results', glyph: '🔍' },
          entries: results,
        },
      ];
    }

    const out: EmojiGroup[] = [];

    const recentEntries = (recent ?? [])
      .map((glyph) => emojiFromChar(glyph))
      .filter((e): e is EmojiEntry => Boolean(e));
    if (recentEntries.length > 0) {
      out.push({ category: EMOJI_CATEGORIES[0]!, entries: recentEntries });
    }

    for (const category of EMOJI_CATEGORIES) {
      if (category.id === 'recent') continue;
      const entries = emoji.filter((e) => e.category === category.id);
      if (entries.length > 0) out.push({ category, entries });
    }
    return out;
  }, [query, emoji, recent]);

  /** Flat view of everything on screen — the index space the arrows walk. */
  const flat = useMemo(() => groups.flatMap((g) => g.entries), [groups]);

  // A new result set invalidates the old cursor.
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const active = flat[Math.min(activeIndex, flat.length - 1)];

  // ── Category rail ─────────────────────────────────────────
  const railCategories = groups.map((g) => g.category);

  /**
   * Scroll a group to the top of the body.
   *
   * Deliberately not `scrollIntoView` — it scrolls every scrollable ancestor,
   * which yanks the host page around when the picker is in a popover. Setting
   * `scrollTop` moves exactly one element.
   */
  const scrollToCategory = (id: EmojiCategoryId) => {
    const body = bodyRef.current;
    const group = groupRefs.current.get(id);
    if (!body || !group) return;
    body.scrollTop = group.offsetTop - body.offsetTop;
  };

  // ── Keyboard ──────────────────────────────────────────────
  const move = (delta: number) => {
    if (flat.length === 0) return;
    setActiveIndex((i) => Math.max(0, Math.min(flat.length - 1, i + delta)));
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        move(1);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        move(-1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        move(columns);
        break;
      case 'ArrowUp':
        event.preventDefault();
        move(-columns);
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(Math.max(0, flat.length - 1));
        break;
      case 'Enter':
      case ' ':
        // Space has to stay typable in the search field.
        if (event.key === ' ' && document.activeElement === searchRef.current) return;
        event.preventDefault();
        if (active) choose(active);
        break;
      default:
        break;
    }
  };

  // Keep the roving cursor inside the scroll port without touching ancestors.
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const el = body.querySelector<HTMLElement>('[data-active="true"]');
    if (!el) return;
    const top = el.offsetTop - body.offsetTop;
    const bottom = top + el.offsetHeight;
    if (top < body.scrollTop) body.scrollTop = top;
    else if (bottom > body.scrollTop + body.clientHeight) {
      body.scrollTop = bottom - body.clientHeight;
    }
  }, [activeIndex]);

  const choose = (entry: EmojiEntry) => {
    onSelect?.(applySkinTone(entry.char, entry.tone ? tone : 'default'), entry);
  };

  const gridStyle: GridCssVars = { '--emoji-cols': String(columns) };
  const activeTone = SKIN_TONES.find((t) => t.id === tone) ?? SKIN_TONES[0]!;
  const visibleTones = toneOpen ? SKIN_TONES : [activeTone];

  let cursor = 0;

  return (
    <div
      ref={ref}
      className={cn('emoji-picker', className)}
      style={style}
      data-slot="emoji-picker"
      onKeyDown={onKeyDown}
      {...rest}
    >
      <div className="emoji-picker-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        <input
          ref={searchRef}
          type="text"
          value={query}
          autoFocus={autoFocus}
          placeholder={searchPlaceholder}
          onChange={(e) => setQuery(e.target.value)}
          aria-label={searchPlaceholder}
          // The grid is the listbox this field drives.
          role="combobox"
          aria-expanded
          aria-controls="emoji-picker-grid"
          aria-activedescendant={active ? `emoji-opt-${active.shortcode}` : undefined}
        />
      </div>

      {railCategories.length > 1 ? (
        <div className="emoji-picker-rail" role="tablist" aria-label="Emoji categories">
          {railCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              role="tab"
              className="emoji-cat"
              title={category.label}
              aria-label={category.label}
              aria-selected={false}
              onClick={() => scrollToCategory(category.id)}
            >
              <Emoji emoji={category.glyph} set={set} label="" size={15} />
            </button>
          ))}
        </div>
      ) : null}

      <div className="emoji-picker-body" ref={bodyRef}>
        {groups.length === 0 ? (
          <div className="emoji-picker-empty">
            {emptyState ?? `No emoji match "${query.trim()}"`}
          </div>
        ) : (
          groups.map((group) => (
            <div
              key={group.category.id}
              className="emoji-picker-group"
              ref={(node) => {
                groupRefs.current.set(group.category.id, node);
              }}
            >
              <div className="emoji-picker-group-label">{group.category.label}</div>
              <div
                className="emoji-grid"
                style={gridStyle}
                role="listbox"
                id={group.category.id === railCategories[0]?.id ? 'emoji-picker-grid' : undefined}
                aria-label={group.category.label}
              >
                {group.entries.map((entry) => {
                  const index = cursor++;
                  const isActive = index === activeIndex;
                  const glyph = applySkinTone(entry.char, entry.tone ? tone : 'default');
                  return (
                    <button
                      key={`${group.category.id}-${entry.shortcode}-${index}`}
                      type="button"
                      role="option"
                      id={`emoji-opt-${entry.shortcode}`}
                      aria-selected={isActive}
                      data-active={isActive || undefined}
                      className="emoji-btn"
                      title={entry.name}
                      // The search field keeps focus; the grid is driven by
                      // aria-activedescendant, so buttons stay out of the tab ring.
                      tabIndex={-1}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => choose(entry)}
                    >
                      <Emoji emoji={glyph} set={set} label="" size={22} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {hideFooter ? null : (
        <div className="emoji-picker-foot">
          {active ? (
            <>
              <Emoji
                emoji={applySkinTone(active.char, active.tone ? tone : 'default')}
                set={set}
                label=""
                size={20}
                className="emoji-preview"
              />
              <span className="emoji-preview-name">:{active.shortcode}:</span>
            </>
          ) : (
            <span className="emoji-preview-name">Pick an emoji</span>
          )}

          {hideToneSelector ? null : (
            <div
              className="emoji-tone"
              role="group"
              aria-label="Skin tone"
              onMouseEnter={() => setToneOpen(true)}
              onMouseLeave={() => setToneOpen(false)}
            >
              {visibleTones.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className="emoji-tone-swatch"
                  style={{ background: t.swatch }}
                  aria-label={`${t.label} skin tone`}
                  aria-pressed={t.id === tone}
                  tabIndex={-1}
                  onFocus={() => setToneOpen(true)}
                  onClick={() => {
                    setTone(t.id);
                    setToneOpen(false);
                  }}
                />
              ))}
              {!toneOpen ? (
                <button
                  type="button"
                  className="emoji-tone-swatch"
                  style={{ background: 'transparent', boxShadow: 'none', width: 0 }}
                  aria-label="Change skin tone"
                  onClick={() => setToneOpen(true)}
                  onFocus={() => setToneOpen(true)}
                />
              ) : null}
            </div>
          )}
        </div>
      )}

      {footer ? <div className="emoji-picker-extra">{footer}</div> : null}

      {/* Config echo — lets tests and consumers see which artwork is live. */}
      <span hidden data-emoji-set={set ?? config.set} />
    </div>
  );
});

/* ── EmojiSelect ──────────────────────────────────────────── */

export type EmojiSelectSize = 'sm' | 'md' | 'lg';

export interface EmojiSelectProps {
  /** Controlled glyph. */
  value?: string | null;
  /** Initial glyph when uncontrolled. */
  defaultValue?: string | null;
  /** Fires with the chosen glyph, or `null` when cleared. */
  onChange?: (glyph: string | null) => void;
  /** Trigger size. @default 'md' */
  size?: EmojiSelectSize;
  /** Drop the trigger's border until hovered — the Notion page-icon form. */
  ghost?: boolean;
  /** Shown when nothing is selected. @default a slightly-smiling face outline */
  placeholder?: ReactNode;
  /** Accessible label for the trigger. @default 'Pick an emoji' */
  label?: string;
  /** Offer a "Remove" action in the panel footer. @default true when a value is set */
  clearable?: boolean;
  /** Disable the control. */
  disabled?: boolean;
  /** Popover placement. @default 'bottom' */
  side?: 'top' | 'bottom' | 'left' | 'right';
  /** Popover alignment. @default 'start' */
  align?: 'start' | 'center' | 'end';
  /** Track recents in localStorage. @default true */
  rememberRecent?: boolean;
  /** Extra className on the trigger. */
  className?: string;
  /** Props forwarded to the picker. */
  pickerProps?: Omit<EmojiPickerProps, 'onSelect' | 'recent'>;
}

/**
 * EmojiSelect — a trigger button plus an {@link EmojiPicker} in a popover.
 * The "emoji select" you reach for on a page icon, a channel avatar, a status,
 * or a reaction button.
 *
 * @example
 * ```tsx
 * const [icon, setIcon] = useState<string | null>('📊');
 * <EmojiSelect value={icon} onChange={setIcon} ghost size="lg" />
 * ```
 */
export function EmojiSelect({
  value: valueProp,
  defaultValue = null,
  onChange,
  size = 'md',
  ghost,
  placeholder,
  label = 'Pick an emoji',
  clearable,
  disabled,
  side = 'bottom',
  align = 'start',
  rememberRecent = true,
  className,
  pickerProps,
}: EmojiSelectProps) {
  const [uncontrolled, setUncontrolled] = useState<string | null>(defaultValue);
  const [open, setOpen] = useState(false);
  const { recent, push } = useRecentEmoji();

  const isControlled = valueProp !== undefined;
  const value = isControlled ? valueProp : uncontrolled;

  const commit = (next: string | null) => {
    if (!isControlled) setUncontrolled(next);
    onChange?.(next);
  };

  const showClear = clearable ?? Boolean(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <button
          type="button"
          disabled={disabled}
          aria-label={value ? `${label} — currently ${value}` : label}
          className={cn(
            'emoji-select-trigger',
            size === 'sm' && 'emoji-select-sm',
            size === 'lg' && 'emoji-select-lg',
            ghost && 'emoji-select-ghost',
            !value && 'emoji-select-empty',
            className,
          )}
        >
          {value ? (
            <Emoji emoji={value} label="" />
          ) : (
            (placeholder ?? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" width="18" height="18">
                <circle cx="12" cy="12" r="9" />
                <path d="M9 10h.01M15 10h.01M8.5 14.5a4.5 4.5 0 0 0 7 0" strokeLinecap="round" />
              </svg>
            ))
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent unstyled side={side} align={align} sideOffset={6} aria-label={label}>
        <EmojiPicker
          {...pickerProps}
          recent={rememberRecent ? recent : undefined}
          footer={
            showClear ? (
              <button
                type="button"
                className="emoji-picker-clear"
                onClick={() => {
                  commit(null);
                  setOpen(false);
                }}
              >
                Remove emoji
              </button>
            ) : null
          }
          onSelect={(glyph) => {
            if (rememberRecent) push(glyph);
            commit(glyph);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
