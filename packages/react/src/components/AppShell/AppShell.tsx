import {
  forwardRef,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../utils/cx';

export interface AppShellProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** When true, the contained sidebar collapses to an icon-rail. */
  collapsed?: boolean;
}

const AppShellRoot = forwardRef<HTMLDivElement, AppShellProps>(function AppShell(
  { className, children, collapsed, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx('app-shell', className)}
      data-collapsed={collapsed ? 'true' : undefined}
      {...rest}
    >
      {children}
    </div>
  );
});

export interface AppShellSidebarProps extends HTMLAttributes<HTMLElement> {
  /** Adds a toggle button at the top of the sidebar that calls `onToggle`. */
  collapsible?: boolean;
  /** Invoked when the collapsible toggle is clicked. */
  onToggle?: () => void;
}

function AppShellSidebar({
  className,
  children,
  collapsible,
  onToggle,
  ...rest
}: AppShellSidebarProps) {
  return (
    <aside className={cx('sidebar', className)} {...rest}>
      {collapsible ? (
        <div className="sidebar-head">
          <button
            type="button"
            className="sidebar-toggle"
            onClick={onToggle}
            aria-label="Toggle sidebar"
          >
            <span aria-hidden="true">☰</span>
          </button>
        </div>
      ) : null}
      <nav className="sidebar-nav">{children}</nav>
    </aside>
  );
}

export interface AppShellMainProps extends HTMLAttributes<HTMLDivElement> {}

function AppShellMain({ className, children, ...rest }: AppShellMainProps) {
  return (
    <div className={cx('app-content', className)} {...rest}>
      {children}
    </div>
  );
}

export interface AppShellTopBarProps extends HTMLAttributes<HTMLElement> {}

function AppShellTopBar({ className, children, ...rest }: AppShellTopBarProps) {
  return (
    <header className={cx('page-header', className)} {...rest}>
      {children}
    </header>
  );
}

export interface AppShellBrandProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Optional brand mark (icon, logo, monogram) rendered before the label. */
  mark?: ReactNode;
}

function AppShellBrand({ className, children, mark, href = '#', ...rest }: AppShellBrandProps) {
  return (
    <a href={href} className={cx('sidebar-brand', className)} {...rest}>
      {mark ? (
        <span className="sidebar-brand-mark" aria-hidden="true">
          {mark}
        </span>
      ) : null}
      <span className="sidebar-brand-name">{children}</span>
    </a>
  );
}

type AppShellComponent = typeof AppShellRoot & {
  Sidebar: typeof AppShellSidebar;
  Main: typeof AppShellMain;
  TopBar: typeof AppShellTopBar;
  /** Alias for `TopBar` — recipes use the lowercase-b spelling. */
  Topbar: typeof AppShellTopBar;
  Brand: typeof AppShellBrand;
};

export const AppShell = AppShellRoot as AppShellComponent;
AppShell.Sidebar = AppShellSidebar;
AppShell.Main = AppShellMain;
AppShell.TopBar = AppShellTopBar;
AppShell.Topbar = AppShellTopBar;
AppShell.Brand = AppShellBrand;
