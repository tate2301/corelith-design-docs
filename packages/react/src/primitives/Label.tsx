"use client";

import { forwardRef, type LabelHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Appends the required marker after the text. @default false */
  required?: boolean;
  children?: ReactNode;
}

/**
 * Label — a standalone form label. Maps to `.field-label` in components.css.
 *
 * Distinct from `FieldLabel`, which is the same visual but reads `htmlFor` and
 * `required` from the surrounding `Field` context. Use `Label` when the control
 * is wired up by hand and there is no `Field` wrapper.
 *
 * @example
 * ```tsx
 * <Label htmlFor="supplier">Supplier</Label>
 * <Input id="supplier" />
 * ```
 */
export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { className, required = false, children, ...props },
  ref,
) {
  return (
    <label ref={ref} className={cn('field-label', className)} {...props}>
      {children}
      {required ? (
        <span aria-hidden="true" style={{ color: 'var(--tone-danger)', marginLeft: 4 }}>
          *
        </span>
      ) : null}
    </label>
  );
});
