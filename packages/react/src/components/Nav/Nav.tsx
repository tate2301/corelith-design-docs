import {
  forwardRef,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../utils/cx';

export interface NavGroupProps extends HTMLAttributes<HTMLElement> {
  /** Optional uppercased label rendered above the group's items. */
  label?: ReactNode;
}

/** Labeled `<nav>` group for sidebar nav items. */
export const NavGroup = forwardRef<HTMLElement, NavGroupProps>(function NavGroup(
  { label, className, children, ...rest },
  ref,
) {
  return (
    <nav ref={ref} className={cx('nav-group', className)} {...rest}>
      {label ? <h6 className="nav-group-label">{label}</h6> : null}
      {children}
    </nav>
  );
});

export interface SidebarNavItemProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Marks this nav item as the active route. */
  active?: boolean;
  /** Route target. Maps to `href` on the underlying `<a>`. */
  to?: string;
  /** Leading icon node (string icon name or React node). */
  icon?: ReactNode;
  /** Optional badge rendered at the trailing edge (count, status). */
  badge?: ReactNode;
}

/**
 * Single sidebar nav item with active state, optional icon + badge.
 *
 * Renders an `<a class="nav-item">` with `aria-current="page"` when `active`.
 */
export const SidebarNavItem = forwardRef<HTMLAnchorElement, SidebarNavItemProps>(
  function NavItem(
    { active, to, href, icon, badge, className, children, ...rest },
    ref,
  ) {
    return (
      <a
        ref={ref}
        href={to ?? href ?? '#'}
        aria-current={active ? 'page' : undefined}
        className={cx('nav-item', active && 'is-active', className)}
        {...rest}
      >
        {icon ? (
          <span className="nav-item-icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <span className="nav-item-label">{children}</span>
        {badge !== undefined && badge !== null ? (
          <span className="nav-item-badge">{badge}</span>
        ) : null}
      </a>
    );
  },
);
