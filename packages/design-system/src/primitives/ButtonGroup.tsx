import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Split-button style — a primary action plus an attached caret/menu button. */
  split?: boolean;
  /** Accessible label for the group, e.g. "Export options". */
  'aria-label'?: string;
  children?: ReactNode;
}

/**
 * ButtonGroup — a segmented row of attached buttons (toolbars, split buttons).
 * The docs (`p-button-group`) reference `.btn-group` / `.btn-group.split`, but
 * no rule for them exists in components.css yet, so the attached look (shared
 * border, zeroed inner radii, hairline dividers) is provided as a token-driven
 * inline fallback. Child `.btn` classes still come from CSS.
 *
 * Accessibility:
 *   - Renders `role="group"`; pass `aria-label` to name it.
 *   - Children remain ordinary buttons/links — Tab moves between them.
 */
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
  { split, className, style, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      role="group"
      // CSS-class fallback: no `.btn-group` rule in components.css — attach
      // buttons via flex + a wrapping border, clipping inner radii.
      className={cn('btn-group', split && 'split', className)}
      style={{
        display: 'inline-flex',
        borderRadius: 8,
        overflow: 'clip',
        border: '1px solid var(--border-strong)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
});
