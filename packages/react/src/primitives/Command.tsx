"use client";

import {
  forwardRef,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';

export interface CommandItem {
  /** Stable id emitted on select. */
  id: string;
  /** Visible label (matched against the query). */
  label: string;
  /** Optional secondary line. */
  description?: string;
  /** Optional leading icon. */
  icon?: ReactNode;
  /** Optional trailing shortcut hint. */
  shortcut?: ReactNode;
  /** Group heading this item belongs to. */
  group?: string;
  /** Extra keywords to match besides the label. */
  keywords?: string[];
  disabled?: boolean;
}

export interface CommandProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** All available commands. */
  items: CommandItem[];
  /** Search input placeholder. */
  placeholder?: string;
  /** Fires when an item is chosen. */
  onSelect?: (item: CommandItem) => void;
  /** Override the fuzzy matcher. @default subsequence match on label + keywords. */
  filter?: (item: CommandItem, query: string) => boolean;
  /** Shown when nothing matches. */
  emptyMessage?: ReactNode;
}

/** Loose subsequence fuzzy match: every query char appears in order. */
function fuzzy(haystack: string, query: string): boolean {
  const h = haystack.toLowerCase();
  const q = query.toLowerCase();
  let i = 0;
  for (const ch of h) {
    if (ch === q[i]) i++;
    if (i === q.length) return true;
  }
  return q.length === 0;
}

/**
 * Command — the inner command-palette list (search input + grouped, keyboard
 * navigable results). The modal/dialog chrome is composed separately.
 *
 * The docs (`p-command`) render this with inline token styling (no dedicated
 * `.command` rule exists in components.css), so structure is provided with a
 * `.command` class hook plus token-driven inline fallbacks.
 *
 * Accessibility:
 *   - The input is `role="combobox"` controlling a `role="listbox"`; rows are
 *     `role="option"`. The active row is tracked via `aria-activedescendant`.
 *   - Up/Down move the active item across groups (wrapping), Enter selects it.
 *   - Group headings are decorative (`aria-hidden`) — they do not break option
 *     navigation.
 */
export const Command = forwardRef<HTMLDivElement, CommandProps>(function Command(
  { items, placeholder = 'Type a command or search…', onSelect, filter, emptyMessage = 'No results', className, style, ...rest },
  ref,
) {
  const baseId = useId();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement | null>(null);

  const match = filter ?? ((item, q) => fuzzy([item.label, ...(item.keywords ?? [])].join(' '), q));
  const filtered = useMemo(
    () => (query ? items.filter((it) => match(it, query)) : items),
    [items, query, match],
  );

  // Group preserving first-seen order; ungrouped items go in a leading null group.
  const groups = useMemo(() => {
    const map = new Map<string | undefined, CommandItem[]>();
    for (const it of filtered) {
      const key = it.group;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(it);
    }
    return Array.from(map.entries());
  }, [filtered]);

  // Flat order matches visual order, for arrow navigation.
  const flat = useMemo(() => groups.flatMap(([, list]) => list), [groups]);

  const optionId = (id: string) => `${baseId}-opt-${id}`;

  const choose = (item: CommandItem | undefined) => {
    if (!item || item.disabled) return;
    onSelect?.(item);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (flat.length ? (i + 1) % flat.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (flat.length ? (i - 1 + flat.length) % flat.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      choose(flat[activeIndex]);
    }
  };

  const activeId = flat[activeIndex]?.id;

  // Token-driven inline fallback: no `.command` rule in components.css.
  return (
    <div
      ref={ref}
      className={cn('command', className)}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        boxShadow: 'var(--shadow-modal)',
        overflow: 'clip',
        ...style,
      }}
      {...rest}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '14px 18px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <span data-icon="search" aria-hidden="true" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          role="combobox"
          aria-expanded
          aria-controls={`${baseId}-list`}
          aria-activedescendant={activeId ? optionId(activeId) : undefined}
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={onKey}
          style={{
            border: 0,
            outline: 0,
            flex: 1,
            background: 'transparent',
            font: '15px/1 var(--font-sans)',
            color: 'var(--text-body)',
          }}
        />
      </div>
      <div
        ref={listRef}
        id={`${baseId}-list`}
        role="listbox"
        style={{ padding: 6, maxHeight: 360, overflowY: 'auto' }}
      >
        {flat.length === 0 ? (
          <div style={{ padding: '12px', color: 'var(--text-muted)', font: 'var(--type-body-sm)' }}>
            {emptyMessage}
          </div>
        ) : (
          groups.map(([group, list]) => (
            <div key={group ?? '__ungrouped'} role="group">
              {group ? (
                <div
                  aria-hidden="true"
                  style={{
                    font: '500 11px/1 var(--font-sans)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--text-subtle)',
                    padding: '10px 12px 4px',
                  }}
                >
                  {group}
                </div>
              ) : null}
              {list.map((item) => {
                const idx = flat.indexOf(item);
                const active = idx === activeIndex;
                return (
                  <div
                    key={item.id}
                    id={optionId(item.id)}
                    role="option"
                    aria-selected={active}
                    aria-disabled={item.disabled || undefined}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => choose(item)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '24px 1fr auto',
                      gap: 12,
                      padding: '9px 12px',
                      borderRadius: 7,
                      alignItems: 'center',
                      cursor: 'pointer',
                      background: active ? 'var(--brand-soft)' : 'transparent',
                      color: active ? 'var(--brand-strong)' : 'var(--text-strong)',
                    }}
                  >
                    <span aria-hidden="true" style={{ color: active ? 'var(--brand-strong)' : 'var(--text-muted)' }}>
                      {item.icon}
                    </span>
                    <div>
                      <div style={{ font: '500 14px/1.3 var(--font-sans)' }}>{item.label}</div>
                      {item.description ? (
                        <div style={{ font: '12px/1.3 var(--font-sans)', opacity: 0.85 }}>
                          {item.description}
                        </div>
                      ) : null}
                    </div>
                    {item.shortcut ? (
                      <span
                        style={{
                          padding: '2px 7px',
                          background: 'var(--surface-muted)',
                          borderRadius: 4,
                          font: '500 11px/1 var(--font-mono)',
                          color: 'var(--text-muted)',
                        }}
                      >
                        {item.shortcut}
                      </span>
                    ) : (
                      <span />
                    )}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
});
