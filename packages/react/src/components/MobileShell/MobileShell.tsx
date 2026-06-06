import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { BottomTabs, type BottomTabsProps } from '../BottomTabs/BottomTabs';
import './MobileShell.css';

export interface MobileShellProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

const MobileShellRoot = forwardRef<HTMLDivElement, MobileShellProps>(function MobileShell(
  { className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx('mobile-shell', className)} {...rest}>
      {children}
    </div>
  );
});

export interface MobileShellHeaderProps extends HTMLAttributes<HTMLElement> {}
function MobileShellHeader({ className, ...rest }: MobileShellHeaderProps) {
  return <header className={cx('mobile-shell-header', className)} {...rest} />;
}

export interface MobileShellBodyProps extends HTMLAttributes<HTMLElement> {}
function MobileShellBody({ className, ...rest }: MobileShellBodyProps) {
  return <main className={cx('mobile-shell-body', className)} {...rest} />;
}

function MobileShellBottomTabs<T extends string>(props: BottomTabsProps<T>) {
  return <BottomTabs {...props} />;
}

/** Convenience alias used by recipes — represents a single tab item shape. */
export interface MobileShellTabProps {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  href?: string;
}
function MobileShellTab(_props: MobileShellTabProps): null {
  // Declarative-only marker: collected by parent BottomTabs in real usage.
  return null;
}

export interface MobileShellNavItemProps extends HTMLAttributes<HTMLAnchorElement> {
  active?: boolean;
  icon?: ReactNode;
  href?: string;
}
function MobileShellNavItem({ active, icon, href, className, children, ...rest }: MobileShellNavItemProps) {
  return (
    <a
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cx('mobile-shell-nav-item', active && 'active', className)}
      {...rest}
    >
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      <span>{children}</span>
    </a>
  );
}

type MobileShellComponent = typeof MobileShellRoot & {
  Header: typeof MobileShellHeader;
  Body: typeof MobileShellBody;
  BottomTabs: typeof MobileShellBottomTabs;
  Tab: typeof MobileShellTab;
  NavItem: typeof MobileShellNavItem;
};

export const MobileShell = MobileShellRoot as MobileShellComponent;
MobileShell.Header = MobileShellHeader;
MobileShell.Body = MobileShellBody;
MobileShell.BottomTabs = MobileShellBottomTabs;
MobileShell.Tab = MobileShellTab;
MobileShell.NavItem = MobileShellNavItem;

// Standalone re-exports for recipes that destructure `Tab` / `NavItem` directly.
export const Tab = MobileShellTab;
export const NavItem = MobileShellNavItem;
