import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';
import { Slot } from '../utils/Slot';

export type ButtonGroupOrientation = 'horizontal' | 'vertical';

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Split-button style — a primary action plus an attached caret/menu button. */
  split?: boolean;
  /** Stack the buttons instead of laying them out in a row. @default 'horizontal' */
  orientation?: ButtonGroupOrientation;
  /** Accessible label for the group, e.g. "Export options". */
  'aria-label'?: string;
  children?: ReactNode;
}

/**
 * ButtonGroup — a segmented row (or column) of attached buttons: toolbars,
 * split buttons, view switchers.
 *
 * The attached look — shared outer border, zeroed inner radii, hairline
 * dividers — lives in `.btn-group` (styles/display.css), not in inline styles,
 * so `className` can override it. `split` additionally emits `.btn-split`, the
 * class the shipped component CSS already styles (primary action + caret with
 * a translucent divider).
 *
 * Accessibility:
 *   - Renders `role="group"`; pass `aria-label` to name it.
 *   - Children remain ordinary buttons/links — Tab moves between them.
 *
 * @example
 * ```tsx
 * <ButtonGroup aria-label="Export options">
 *   <button className="btn btn-secondary">Export</button>
 *   <ButtonGroupSeparator />
 *   <button className="btn btn-secondary btn-icon" aria-label="More"><Caret /></button>
 * </ButtonGroup>
 * ```
 */
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
  { split, orientation = 'horizontal', className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      role="group"
      // `split` keeps its historical class *and* picks up `.btn-split`, which
      // is the name the shipped CSS actually styles.
      className={cn('btn-group', split && 'split', split && 'btn-split', className)}
      data-slot="button-group"
      data-orientation={orientation}
      {...rest}
    >
      {children}
    </div>
  );
});

export interface ButtonGroupTextProps extends HTMLAttributes<HTMLSpanElement> {
  /** Render the label styles onto the supplied child, Radix Slot-style. */
  asChild?: boolean;
  children?: ReactNode;
}

/**
 * ButtonGroupText — a non-interactive label segment inside a ButtonGroup
 * (units, prefixes, counts). Use `asChild` to project the styles onto a
 * `<label>` or a framework link instead of the default `<span>`.
 */
export const ButtonGroupText = forwardRef<HTMLSpanElement, ButtonGroupTextProps>(
  function ButtonGroupText({ asChild, className, children, ...rest }, ref) {
    const props = {
      ref: ref as React.Ref<HTMLElement>,
      className: cn('btn-group-text', className),
      'data-slot': 'button-group-text',
      ...rest,
    };

    if (asChild) {
      return <Slot {...props}>{children as React.ReactElement}</Slot>;
    }

    return <span {...props}>{children}</span>;
  },
);

export type ButtonGroupSeparatorProps = HTMLAttributes<HTMLDivElement>;

/**
 * ButtonGroupSeparator — an explicit hairline between two segments. Purely
 * decorative (`role="none"`); the buttons either side carry the meaning.
 */
export const ButtonGroupSeparator = forwardRef<HTMLDivElement, ButtonGroupSeparatorProps>(
  function ButtonGroupSeparator({ className, ...rest }, ref) {
    return (
      <div
        ref={ref}
        role="none"
        className={cn('btn-group-separator', className)}
        data-slot="button-group-separator"
        {...rest}
      />
    );
  },
);
