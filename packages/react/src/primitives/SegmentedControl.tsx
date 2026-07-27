"use client";

import {
  forwardRef,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';

export type SegmentedSize = 'sm' | 'md';
export type SegmentedVariant = 'default' | 'bordered';

export interface SegmentedOption<V extends string = string> {
  /** Stable value emitted on select. */
  value: V;
  /** Visible label. */
  label: ReactNode;
  /** Optional leading icon. */
  icon?: ReactNode;
  /** Trailing count badge. Values above 99 render as "99+". */
  count?: number;
  disabled?: boolean;
}

export interface SegmentedControlProps<V extends string = string>
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Options to render as segments. */
  options: ReadonlyArray<SegmentedOption<V>>;
  /** Controlled selected value. */
  value?: V;
  /** Uncontrolled initial value. */
  defaultValue?: V;
  /** Fires when the selection changes. */
  onValueChange?: (value: V) => void;
  /** Segment density. @default 'md' */
  size?: SegmentedSize;
  /** `bordered` draws the track on the surface colour. @default 'default' */
  variant?: SegmentedVariant;
  /** Stretch the control to fill its container. @default true */
  fullWidth?: boolean;
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
const SegmentedControlInner = forwardRef<HTMLDivElement, SegmentedControlProps>(
  function SegmentedControl(
    {
      options,
      value: controlled,
      defaultValue,
      onValueChange,
      size = 'md',
      variant = 'default',
      fullWidth = true,
      className,
      ...rest
    },
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
      <div
        ref={ref}
        role="radiogroup"
        className={cn(
          'segmented',
          size === 'sm' && 'segmented-sm',
          variant === 'bordered' && 'segmented-bordered',
          !fullWidth && 'segmented-auto',
          className,
        )}
        {...rest}
      >
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
              {opt.count !== undefined ? (
                <span className="segmented-count">{opt.count > 99 ? '99+' : opt.count}</span>
              ) : null}
            </button>
          );
        })}
      </div>
    );
  },
);

/**
 * `forwardRef` erases the generic, so the ref-forwarding implementation is
 * declared against the widened `string` form and re-exported through a callable
 * type that keeps `V`. Callers get `onValueChange: (value: V) => void` rather
 * than a bare `string`.
 */
export const SegmentedControl = SegmentedControlInner as (<V extends string = string>(
  props: SegmentedControlProps<V> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement) & { displayName?: string };

SegmentedControl.displayName = 'SegmentedControl';
