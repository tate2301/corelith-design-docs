"use client";

import { Fragment, forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';
import { Button } from '../primitives/Button';

export interface SelectionAction {
  id: string;
  /** Button label. Hidden on narrow screens, where the icon carries it. */
  label: string;
  /** Leading icon. */
  icon?: ReactNode;
  onSelect?: () => void;
  /** Style as destructive. */
  destructive?: boolean;
  disabled?: boolean;
  /** Insert a divider before this action. */
  dividerBefore?: boolean;
}

export interface SelectionBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** How many records are selected. The bar renders nothing at 0. */
  count: number;
  /** Quick actions. */
  actions?: SelectionAction[];
  /** Arbitrary nodes appended after `actions`. */
  children?: ReactNode;
  /** Overflow ("…") slot — pass a DropdownMenu trigger. */
  overflow?: ReactNode;
  /** Fires when the clear button is pressed. Omit to hide the button. */
  onClear?: () => void;
  /**
   * Stick to the bottom of the scroll port instead of sitting in flow.
   * @default true
   */
  floating?: boolean;
  /** Noun for the count, singular. @default 'selected' */
  label?: string;
}

/**
 * SelectionBar — the quick-actions bar that appears once grid rows are
 * selected: a count, the actions you can take on the whole set, and a way out.
 *
 * It floats over the foot of the table by default, which keeps the actions
 * within a short mouse trip of the checkboxes that produced the selection —
 * a bar pinned to the page footer makes you cross the whole viewport instead.
 *
 * Accessibility: the bar is a `role="toolbar"` labelled by its own count, and
 * it announces politely — so turning a selection from 2 to 3 is spoken without
 * interrupting whatever the user is doing.
 *
 * @example
 * ```tsx
 * <SelectionBar
 *   count={selected.length}
 *   onClear={() => setSelected([])}
 *   actions={[
 *     { id: 'add', label: 'Add to collection', icon: <PlusIcon />, onSelect: addToCollection },
 *     { id: 'new', label: 'Create new collection', icon: <GridIcon />, onSelect: createCollection },
 *     { id: 'email', label: 'Send email', icon: <MailIcon />, onSelect: sendEmail },
 *   ]}
 *   overflow={<Button variant="secondary" size="sm" aria-label="More actions">···</Button>}
 * />
 * ```
 */
export const SelectionBar = forwardRef<HTMLDivElement, SelectionBarProps>(function SelectionBar(
  {
    count,
    actions = [],
    children,
    overflow,
    onClear,
    floating = true,
    label = 'selected',
    className,
    ...rest
  },
  ref,
) {
  // Nothing selected, nothing to act on — render nothing rather than an empty
  // bar, so the table's own bottom edge stays visible.
  if (count <= 0) return null;

  return (
    <div
      ref={ref}
      role="toolbar"
      aria-label={`${count} ${label}`}
      aria-live="polite"
      className={cn('selection-bar', floating && 'selection-bar-floating', className)}
      data-slot="selection-bar"
      {...rest}
    >
      <span className="selection-bar-count">
        <span className="selection-bar-n">{count}</span>
        {label}
      </span>

      <div className="selection-bar-actions">
        {actions.map((action) => (
          <Fragment key={action.id}>
            {action.dividerBefore ? <span className="selection-bar-divider" aria-hidden="true" /> : null}
            <Button
              variant={action.destructive ? 'destructive' : 'secondary'}
              size="sm"
              disabled={action.disabled}
              onClick={action.onSelect}
              // The label is hidden on narrow screens, so the icon-only form
              // still needs an accessible name.
              aria-label={action.label}
            >
              {action.icon ? <span aria-hidden="true">{action.icon}</span> : null}
              <span className="btn-label">{action.label}</span>
            </Button>
          </Fragment>
        ))}
        {children}
        {overflow}
      </div>

      {onClear ? (
        <button
          type="button"
          className="selection-bar-clear"
          aria-label="Clear selection"
          onClick={onClear}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      ) : null}
    </div>
  );
});
