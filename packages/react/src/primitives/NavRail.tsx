"use client";

import {
  forwardRef,
  isValidElement,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { cn } from '../utils/cn';
import { Slot } from '../utils/Slot';

export type NavRailOrientation = 'vertical' | 'responsive';

export interface NavRailProps extends Omit<HTMLAttributes<HTMLElement>, 'aria-label'> {
  /** Accessible name for the rail, e.g. "Accounting category navigation". */
  label: string;
  /**
   * `responsive` collapses the rail into a horizontally scrolling strip below
   * 1024px instead of stacking full height on small screens. @default 'vertical'
   */
  orientation?: NavRailOrientation;
}

/**
 * NavRail — the quiet vertical secondary navigation every module shares.
 * Maps to `.nav-rail` in nav.css (aliased by the older `.settings-rail`): a
 * list of labels with a soft fill for hover and active, no outline, no shadow,
 * no link colour and no underline.
 *
 * Compose with `<NavRailGroup>` and `<NavRailItem>`. Items are real buttons by
 * default; pass `asChild` with a router link when the item navigates, so the
 * package never has to know about your router.
 *
 * @example
 * ```tsx
 * <NavRail label="Accounting sections" orientation="responsive">
 *   <NavRailGroup label="Ledger">
 *     <NavRailItem active icon={<BookIcon />} count={12}>Journals</NavRailItem>
 *     <NavRailItem asChild>
 *       <a href="/accounting/accounts">Chart of accounts</a>
 *     </NavRailItem>
 *   </NavRailGroup>
 * </NavRail>
 * ```
 */
export const NavRail = forwardRef<HTMLElement, NavRailProps>(function NavRail(
  { label, orientation = 'vertical', className, children, ...rest },
  ref,
) {
  return (
    <nav
      ref={ref}
      aria-label={label}
      data-orientation={orientation}
      className={cn('nav-rail', className)}
      {...rest}
    >
      {children}
    </nav>
  );
});

export interface NavRailGroupProps {
  /** Omit for an ungrouped rail — the label row is skipped entirely. */
  label?: ReactNode;
  children?: ReactNode;
}

/**
 * NavRailGroup — an optional small label above a run of items.
 *
 * Renders a fragment, not a wrapper: the label and the items are siblings
 * inside `.nav-rail`, which is what the flex column in nav.css expects. Adding
 * a wrapper element here would break the rail's gap rhythm.
 */
export function NavRailGroup({ label, children }: NavRailGroupProps) {
  return (
    <>
      {label ? <div className="group-label">{label}</div> : null}
      {children}
    </>
  );
}
NavRailGroup.displayName = 'NavRailGroup';

export interface NavRailItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Marks the current section. Sets `aria-current` and the soft active fill. */
  active?: boolean;
  /** Optional leading icon. Rendered `aria-hidden`. */
  icon?: ReactNode;
  /** Right-aligned count. Rendered muted and tabular, never as a badge. */
  count?: number;
  /**
   * Right-aligned slot for the rare item that needs more than a count — a
   * severity badge, say. Prefer `count`; a rail of badges is a rail of noise.
   */
  trailing?: ReactNode;
  /**
   * Render the rail-item styles onto the supplied child (a router `<Link>`, an
   * `<a>`) instead of a `<button>`. The child's own children become the label.
   */
  asChild?: boolean;
}

/**
 * NavRailItem — one row in a `<NavRail>`.
 *
 * Renders `<button type="button">` by default, because client-side view
 * switchers should not be links. For real navigation pass `asChild` and supply
 * the anchor yourself — the package stays framework-free.
 *
 * @example
 * ```tsx
 * <NavRailItem asChild active={pathname === '/inbox'} count={unread}>
 *   <Link href="/inbox">Inbox</Link>
 * </NavRailItem>
 * ```
 */
export const NavRailItem = forwardRef<HTMLButtonElement, NavRailItemProps>(function NavRailItem(
  { active, icon, count, trailing, asChild, disabled, className, children, ...rest },
  ref,
) {
  const classes = cn('rail-item', active && 'active', className);

  const renderInner = (label: ReactNode) => (
    <>
      {icon ? (
        <span className="rail-item-icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="rail-item-label">{label}</span>
      {typeof count === 'number' ? <span className="rail-item-count">{count}</span> : null}
      {trailing ? <span className="rail-item-trailing">{trailing}</span> : null}
    </>
  );

  if (asChild) {
    if (!isValidElement(children)) {
      throw new Error('NavRailItem: `asChild` expects a single valid React element child.');
    }
    const child = children as ReactElement<{ children?: ReactNode }>;
    return (
      <Slot
        ref={ref as Ref<HTMLElement>}
        className={classes}
        aria-current={active ? 'page' : undefined}
        aria-disabled={disabled || undefined}
        data-disabled={disabled ? '' : undefined}
        slottedChildren={renderInner(child.props.children)}
        {...(rest as HTMLAttributes<HTMLElement>)}
      >
        {child}
      </Slot>
    );
  }

  return (
    <button
      ref={ref}
      type="button"
      className={classes}
      disabled={disabled}
      aria-current={active ? 'true' : undefined}
      {...rest}
    >
      {renderInner(children)}
    </button>
  );
});

/** Alias — huchu's `settings-rail.tsx` imports this name. */
export const NavGroup = NavRailGroup;
/** Alias — huchu's `settings-rail.tsx` imports this name. */
export const NavItem = NavRailItem;

export type NavGroupProps = NavRailGroupProps;
export type NavItemProps = NavRailItemProps;
