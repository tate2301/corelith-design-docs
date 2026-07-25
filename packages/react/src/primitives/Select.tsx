"use client";

import {
  forwardRef,
  useId,
  type SelectHTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Visible label rendered above the select. */
  label?: ReactNode;
  /** Subtle helper text shown below the select. */
  hint?: ReactNode;
  /** Error message — when set, the select is announced as invalid. Overrides `hint`. */
  error?: ReactNode;
  /** Sizing. Matches `Input`. @default 'md' */
  size?: SelectSize;
  /** Optional className applied to the outer wrapper (the `.field` element). */
  wrapperClassName?: string;
}

const SIZE_HEIGHT: Record<SelectSize, number | undefined> = {
  sm: 30,
  md: undefined,
  lg: 44,
};

// Chevron used to indicate "this is a select". Kept inline so the component
// works without depending on the icon system.
const CHEVRON_SVG =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23565C69' stroke-width='2'><path d='m6 9 6 6 6-6'/></svg>\")";

/**
 * Select — native `<select>` styled to match the input surface.
 * Maps to the `.select` class in components.css.
 *
 * Accessibility:
 *  - Native select inherits OS keyboard support (arrow keys, type-ahead).
 *  - `label` is bound via `htmlFor`/`id` (id auto-generated when absent).
 *  - `error` sets `aria-invalid="true"` and wires `aria-describedby`.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    hint,
    error,
    size = 'md',
    wrapperClassName,
    className,
    id,
    style,
    children,
    'aria-invalid': ariaInvalid,
    'aria-describedby': ariaDescribedBy,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const selectId = id ?? `select-${autoId}`;
  const hintId = hint ? `${selectId}-hint` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;
  const describedBy = [ariaDescribedBy, errorId, hintId].filter(Boolean).join(' ') || undefined;

  const selectStyle: React.CSSProperties = {
    appearance: 'none',
    backgroundImage: CHEVRON_SVG,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: 36,
    ...style,
  };
  const sizeHeight = SIZE_HEIGHT[size];
  if (sizeHeight !== undefined) selectStyle.height = sizeHeight;

  const selectEl = (
    <select
      ref={ref}
      id={selectId}
      className={cn('select', className)}
      aria-invalid={ariaInvalid ?? (error ? true : undefined)}
      aria-describedby={describedBy}
      style={selectStyle}
      {...rest}
    >
      {children}
    </select>
  );

  if (!label && !hint && !error) {
    return selectEl;
  }

  return (
    <div className={cn('field', wrapperClassName)}>
      {label ? (
        <label className="field-label" htmlFor={selectId}>
          {label}
        </label>
      ) : null}
      {selectEl}
      {error ? (
        <span className="field-error" id={errorId}>
          {error}
        </span>
      ) : hint ? (
        <span className="field-help" id={hintId}>
          {hint}
        </span>
      ) : null}
    </div>
  );
});
