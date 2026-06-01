import {
  forwardRef,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';

export interface SegmentedOption {
  /** Stable value emitted on select. */
  value: string;
  /** Visible label. */
  label: ReactNode;
  /** Optional leading icon. */
  icon?: ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Options to render as segments. */
  options: SegmentedOption[];
  /** Controlled selected value. */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Fires when the selection changes. */
  onValueChange?: (value: string) => void;
  /** Accessible label for the group, e.g. "View mode". */
  'aria-label'?: string;
}

/**
 * SegmentedControl — single-select segmented toggle (Day/Week/Month, view
 * switchers). Maps to `.segmented` + `.segmented-item` (+ `.active`) in
 * components.css.
 *
 * Accessibility:
 *   - Container is `role="radiogroup"`; each segment `role="radio"` with
 *     `aria-checked`.
 *   - Roving tabindex — only the selected segment is in the tab order; Left/Up
 *     and Right/Down arrows move (and select) between segments, Home/End jump to
 *     the ends.
 */
export const SegmentedControl = forwardRef<HTMLDivElement, SegmentedControlProps>(
  function SegmentedControl(
    { options, value: controlled, defaultValue, onValueChange, className, ...rest },
    ref,
  ) {
    const baseId = useId();
    const [uncontrolled, setUncontrolled] = useState<string>(
      defaultValue ?? options[0]?.value ?? '',
    );
    const isControlled = controlled !== undefined;
    const value = isControlled ? controlled! : uncontrolled;
    const btns = useRef<(HTMLButtonElement | null)[]>([]);

    const select = (v: string) => {
      if (!isControlled) setUncontrolled(v);
      onValueChange?.(v);
    };

    const focusable = options.filter((o) => !o.disabled);

    const moveTo = (targetValue: string) => {
      const idx = options.findIndex((o) => o.value === targetValue);
      btns.current[idx]?.focus();
      select(targetValue);
    };

    const onKey = (e: React.KeyboardEvent, current: string) => {
      const list = focusable;
      const idx = list.findIndex((o) => o.value === current);
      if (idx < 0) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        moveTo(list[(idx + 1) % list.length].value);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        moveTo(list[(idx - 1 + list.length) % list.length].value);
      } else if (e.key === 'Home') {
        e.preventDefault();
        moveTo(list[0].value);
      } else if (e.key === 'End') {
        e.preventDefault();
        moveTo(list[list.length - 1].value);
      }
    };

    return (
      <div ref={ref} role="radiogroup" className={cn('segmented', className)} {...rest}>
        {options.map((opt, i) => {
          const selected = opt.value === value;
          return (
            <button
              key={opt.value}
              ref={(el) => {
                btns.current[i] = el;
              }}
              type="button"
              role="radio"
              id={`${baseId}-${opt.value}`}
              aria-checked={selected}
              disabled={opt.disabled}
              tabIndex={selected ? 0 : -1}
              className={cn('segmented-item', selected && 'active')}
              onClick={() => select(opt.value)}
              onKeyDown={(e) => onKey(e, opt.value)}
            >
              {opt.icon ? (
                <span className="icon" aria-hidden="true">
                  {opt.icon}
                </span>
              ) : null}
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  },
);
