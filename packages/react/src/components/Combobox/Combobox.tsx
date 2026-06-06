import {
  forwardRef,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../utils/cx';

export interface ComboboxItem {
  value: string;
  label: ReactNode;
  /** Optional searchable text — falls back to the string form of `label`. */
  search?: string;
  group?: string;
  disabled?: boolean;
}

export interface ComboboxProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: ComboboxItem[];
  value?: string;
  onChange?: (value: string, item: ComboboxItem) => void;
  placeholder?: string;
  emptyMessage?: ReactNode;
  /** Initial query text. */
  defaultQuery?: string;
  footer?: ReactNode;
}

export const Combobox = forwardRef<HTMLDivElement, ComboboxProps>(function Combobox(
  {
    items,
    value,
    onChange,
    placeholder = 'Search…',
    emptyMessage = 'No results',
    defaultQuery = '',
    footer,
    className,
    ...rest
  },
  ref,
) {
  const [query, setQuery] = useState(defaultQuery);
  const listId = useId();
  const inputId = `huchu-cb-${listId}`;
  const inputRef = useRef<HTMLInputElement | null>(null);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = items.filter((it) => {
      if (it.disabled) return false;
      if (!q) return true;
      const haystack = (it.search ?? String(it.label)).toLowerCase();
      return haystack.includes(q);
    });
    const map = new Map<string, ComboboxItem[]>();
    for (const it of filtered) {
      const g = it.group ?? '';
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(it);
    }
    return Array.from(map.entries());
  }, [items, query]);

  return (
    <div ref={ref} className={cx('combobox', className)} {...rest}>
      <div className="cb-search">
        <span className="ic" aria-hidden="true">⌕</span>
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          autoComplete="off"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div id={listId} role="listbox" className="cb-body">
        {groups.length === 0 ? (
          <div className="cb-empty" role="status">{emptyMessage}</div>
        ) : (
          groups.map(([group, list]) => (
            <div key={group || 'default'}>
              {group ? <div className="cb-label">{group}</div> : null}
              {list.map((it) => {
                const selected = it.value === value;
                return (
                  <button
                    key={it.value}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={cx('cb-item', selected && 'selected')}
                    onClick={() => onChange?.(it.value, it)}
                  >
                    <span className="cb-item-label">{it.label}</span>
                    <span className="check-ic" aria-hidden="true">✓</span>
                  </button>
                );
              })}
            </div>
          ))
        )}
      </div>
      {footer ? <div className="cb-foot">{footer}</div> : null}
    </div>
  );
});
