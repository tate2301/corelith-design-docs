import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../utils/cn';
import { usePosition, type Align, type Side } from '../utils/usePosition';

export interface ComboboxOption {
  /** Value emitted on select. */
  value: string;
  /** Visible label (also used for filtering). */
  label: string;
  /** Optional leading node (avatar/icon). */
  leading?: ReactNode;
  disabled?: boolean;
}

export interface ComboboxProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Selectable options. */
  options: ComboboxOption[];
  /** Controlled selected value. */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Fires when an option is chosen. */
  onValueChange?: (value: string) => void;
  /** Search input placeholder. */
  placeholder?: string;
  /** Optional footer hint shown under the list. */
  footer?: ReactNode;
  /** Override the filter predicate. @default case-insensitive substring on label. */
  filter?: (option: ComboboxOption, query: string) => boolean;
  side?: Side;
  align?: Align;
}

/**
 * Combobox — a trigger that opens a filterable listbox popover.
 * Maps to `.combobox`, `.cb-search`, `.cb-body`, `.cb-label`, `.cb-item`
 * (+ `.active` / `.selected`), `.cb-foot` in components.css. The popover is
 * positioned with the shared `usePosition` helper.
 *
 * Accessibility:
 *   - Trigger is `role="combobox"` with `aria-expanded` / `aria-controls`.
 *   - The search input owns `aria-activedescendant`; the list is `role="listbox"`
 *     and each row `role="option"` with `aria-selected`.
 *   - Up/Down move the active option (wrapping), Enter selects it, Escape closes
 *     and returns focus to the trigger. Typing filters the list.
 */
export const Combobox = forwardRef<HTMLDivElement, ComboboxProps>(function Combobox(
  {
    options,
    value: controlled,
    defaultValue,
    onValueChange,
    placeholder = 'Search…',
    footer,
    filter,
    side = 'bottom',
    align = 'start',
    className,
    ...rest
  },
  ref,
) {
  const baseId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [uncontrolled, setUncontrolled] = useState<string>(defaultValue ?? '');
  const isControlled = controlled !== undefined;
  const value = isControlled ? controlled! : uncontrolled;

  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const pos = usePosition(anchorRef, popoverRef, open, { side, align, sideOffset: 6 });

  const match = filter ?? ((o, q) => o.label.toLowerCase().includes(q.toLowerCase()));
  const filtered = useMemo(
    () => (query ? options.filter((o) => match(o, query)) : options),
    [options, query, match],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDocPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (popoverRef.current?.contains(t) || anchorRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', onDocPointer, true);
    return () => document.removeEventListener('pointerdown', onDocPointer, true);
  }, [open]);

  const selectIndex = (i: number) => {
    const opt = filtered[i];
    if (!opt || opt.disabled) return;
    if (!isControlled) setUncontrolled(opt.value);
    onValueChange?.(opt.value);
    setOpen(false);
    setQuery('');
    anchorRef.current?.focus();
  };

  const selectedLabel = options.find((o) => o.value === value)?.label;
  const listId = `${baseId}-list`;
  const optionId = (i: number) => `${baseId}-opt-${i}`;

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (filtered.length ? (i + 1) % filtered.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (filtered.length ? (i - 1 + filtered.length) % filtered.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      selectIndex(activeIndex);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      anchorRef.current?.focus();
    }
  };

  const portalTarget = typeof document !== 'undefined' ? document.body : null;

  return (
    <div ref={ref} className={cn(className)} {...rest}>
      <button
        ref={anchorRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        className="input"
        style={{ textAlign: 'left', cursor: 'pointer' }}
        onClick={() => setOpen((o) => !o)}
      >
        {selectedLabel ?? placeholder}
      </button>

      {open && portalTarget
        ? createPortal(
            <div
              ref={popoverRef}
              className={cn('combobox')}
              style={{
                position: 'absolute',
                top: pos?.top ?? -9999,
                left: pos?.left ?? -9999,
                width: anchorRef.current?.offsetWidth,
                zIndex: 1000,
              }}
            >
              <div className="cb-search">
                <span className="ic" aria-hidden="true" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  placeholder={placeholder}
                  role="searchbox"
                  aria-controls={listId}
                  aria-activedescendant={filtered.length ? optionId(activeIndex) : undefined}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onInputKey}
                />
              </div>
              <div className="cb-body" role="listbox" id={listId} tabIndex={-1}>
                {filtered.length === 0 ? (
                  <div className="cb-label" role="presentation">
                    No results
                  </div>
                ) : (
                  filtered.map((opt, i) => {
                    const selected = opt.value === value;
                    return (
                      <div
                        key={opt.value}
                        id={optionId(i)}
                        role="option"
                        aria-selected={selected}
                        aria-disabled={opt.disabled || undefined}
                        className={cn(
                          'cb-item',
                          i === activeIndex && 'active',
                          selected && 'selected',
                        )}
                        onMouseEnter={() => setActiveIndex(i)}
                        onClick={() => selectIndex(i)}
                      >
                        {opt.leading ? <span className="av">{opt.leading}</span> : <span />}
                        <span>{opt.label}</span>
                        <span className="check-ic" aria-hidden="true">
                          ✓
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
              {footer ? <div className="cb-foot">{footer}</div> : null}
            </div>,
            portalTarget,
          )
        : null}
    </div>
  );
});
