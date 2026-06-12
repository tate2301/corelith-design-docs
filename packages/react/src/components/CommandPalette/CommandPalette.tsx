import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../utils/cx';
import './CommandPalette.css';

export interface CommandItem {
  id: string;
  label: ReactNode;
  /** Searchable text — falls back to the string form of `label`. */
  search?: string;
  group?: string;
  icon?: ReactNode;
  shortcut?: ReactNode;
  onSelect?: () => void;
}

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  items: CommandItem[];
  placeholder?: string;
  emptyMessage?: ReactNode;
  footer?: ReactNode;
  container?: HTMLElement | null;
  className?: string;
}

/**
 * CommandPalette — ⌘K-style modal launcher.
 *
 * @example
 * ```tsx
 * <CommandPalette />
 * ```
 */
export function CommandPalette({
  open,
  onClose,
  items,
  placeholder = 'Type a command or search…',
  emptyMessage = 'No results',
  footer,
  container,
  className,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const flat = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      if (!q) return true;
      return (it.search ?? String(it.label)).toLowerCase().includes(q);
    });
  }, [items, query]);

  const groups = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    for (const it of flat) {
      const g = it.group ?? '';
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(it);
    }
    return Array.from(map.entries());
  }, [flat]);

  useEffect(() => {
    setActive(0);
  }, [query, open]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      setQuery('');
    }
  }, [open]);

  const runItem = useCallback(
    (item: CommandItem) => {
      item.onSelect?.();
      onClose();
    },
    [onClose],
  );

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(flat.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      const item = flat[active];
      if (item) {
        e.preventDefault();
        runItem(item);
      }
    }
  };

  if (!open) return null;
  const target = container ?? (typeof document !== 'undefined' ? document.body : null);
  if (!target) return null;

  let flatIndex = -1;
  return createPortal(
    <div className="x-cmdk-overlay" role="presentation" onClick={onClose}>
      <div
        className={cx('cmdk', className)}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="cmdk-input">
          <span className="ic" aria-hidden="true">⌕</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            placeholder={placeholder}
            aria-controls={listboxId}
            aria-activedescendant={
              flat[active] ? `huchu-cmdk-item-${flat[active]!.id}` : undefined
            }
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="esc">esc</span>
        </div>
        <div id={listboxId} role="listbox" className="cmdk-body">
          {flat.length === 0 ? (
            <div className="cmdk-empty" role="status">{emptyMessage}</div>
          ) : (
            groups.map(([group, list]) => (
              <div key={group || 'default'} className="cmdk-section">
                {group ? <div className="cmdk-label">{group}</div> : null}
                {list.map((it) => {
                  flatIndex += 1;
                  const isActive = flatIndex === active;
                  return (
                    <div
                      key={it.id}
                      id={`huchu-cmdk-item-${it.id}`}
                      role="option"
                      aria-selected={isActive}
                      className={cx('cmdk-item', isActive && 'active')}
                      onMouseEnter={() => setActive(flat.indexOf(it))}
                      onClick={() => runItem(it)}
                    >
                      <span className="ic" aria-hidden="true">{it.icon}</span>
                      <span>{it.label}</span>
                      {it.shortcut ? <span className="sh">{it.shortcut}</span> : null}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
        {footer ? <div className="cmdk-foot">{footer}</div> : null}
      </div>
    </div>,
    target,
  );
}
