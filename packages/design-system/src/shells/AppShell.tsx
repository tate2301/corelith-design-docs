import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface AppShellProps extends HTMLAttributes<HTMLDivElement> {
  /** Left sidebar content (org switcher, nav, etc). */
  sidebar?: ReactNode;
  /** Top breadcrumb/search/notification bar. */
  topbar?: ReactNode;
  /** Optional footer slot pinned under the main column. */
  footer?: ReactNode;
  /** When true, the main column scrolls instead of the page. @default true */
  scrollMain?: boolean;
}

/**
 * AppShell — the desktop chrome: sidebar + topbar + main content.
 * Maps to `.dash-app` / `.dash-side` / `.dash-topbar` in dash.css.
 *
 * @example
 * ```tsx
 * <AppShell
 *   sidebar={<Sidebar>...</Sidebar>}
 *   topbar={<Crumbs /> <Search /> <Bell />}
 * >
 *   <PageHeader title="Park Centre · today" />
 *   <KpiGrid items={...} />
 * </AppShell>
 * ```
 */
export const AppShell = forwardRef<HTMLDivElement, AppShellProps>(function AppShell(
  { sidebar, topbar, footer, scrollMain = true, className, children, style, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('dash-app app-shell', className)}
      style={{
        display: 'grid',
        gridTemplateColumns: sidebar ? '252px 1fr' : '1fr',
        minHeight: '100vh',
        background: 'var(--canvas)',
        ...style,
      }}
      {...rest}
    >
      {sidebar ? <aside className="dash-side app-shell-side">{sidebar}</aside> : null}
      <main
        className="dash-main app-shell-main"
        style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}
      >
        {topbar ? <header className="dash-topbar app-shell-topbar">{topbar}</header> : null}
        <div
          className="dash-page app-shell-content"
          style={
            scrollMain
              ? { flex: 1, overflowY: 'auto', padding: '28px 32px', display: 'grid', gap: 22 }
              : { padding: '28px 32px', display: 'grid', gap: 22 }
          }
        >
          {children}
        </div>
        {footer ? <footer className="app-shell-footer">{footer}</footer> : null}
      </main>
    </div>
  );
});
