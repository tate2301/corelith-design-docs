import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';

export interface AppShellProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

const AppShellRoot = forwardRef<HTMLDivElement, AppShellProps>(function AppShell(
  { className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx('app-shell', className)} {...rest}>
      {children}
    </div>
  );
});

export interface AppShellSidebarProps extends HTMLAttributes<HTMLElement> {}

function AppShellSidebar({ className, children, ...rest }: AppShellSidebarProps) {
  return (
    <aside className={cx('sidebar', className)} {...rest}>
      {children}
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

type AppShellComponent = typeof AppShellRoot & {
  Sidebar: typeof AppShellSidebar;
  Main: typeof AppShellMain;
  TopBar: typeof AppShellTopBar;
};

export const AppShell = AppShellRoot as AppShellComponent;
AppShell.Sidebar = AppShellSidebar;
AppShell.Main = AppShellMain;
AppShell.TopBar = AppShellTopBar;
