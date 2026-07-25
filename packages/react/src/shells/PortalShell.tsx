import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface PortalShellProps extends HTMLAttributes<HTMLDivElement> {
  /** Top app bar (back/menu button, title, right-aligned controls). */
  appBar?: ReactNode;
  /** Bottom tab bar (`<PortalShell.Tab>` children, typically). */
  bottomTabs?: ReactNode;
  /** iOS-style status bar (time, signal/wifi/battery). */
  statusBar?: ReactNode;
  /** Optional pinned bottom action bar (e.g. "Pay" button) above the tab bar. */
  bottomBar?: ReactNode;
}

/**
 * PortalShell — the mobile portal chrome (status bar + app bar + scrollable
 * body + bottom action bar + bottom tab bar). Maps to the `.ps-*` classes
 * in portal-shell.css.
 *
 * @example
 * ```tsx
 * <PortalShell
 *   statusBar={<StatusBar />}
 *   appBar={<><BackButton /><h1>Today</h1></>}
 *   bottomTabs={<><Tab active>Home</Tab><Tab>Sale</Tab></>}
 * >
 *   <Greeting />
 *   <KpiGrid items={...} />
 * </PortalShell>
 * ```
 */
export const PortalShell = forwardRef<HTMLDivElement, PortalShellProps>(function PortalShell(
  { appBar, bottomTabs, statusBar, bottomBar, className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cn('ps-screen portal-shell', className)} {...rest}>
      {statusBar ? <div className="ps-statusbar">{statusBar}</div> : null}
      {appBar ? <header className="ps-appbar">{appBar}</header> : null}
      <div className="ps-scroll ps-content portal-shell-body">{children}</div>
      {bottomBar ? <div className="ps-bottombar">{bottomBar}</div> : null}
      {bottomTabs ? <nav className="ps-tabbar" aria-label="Primary">{bottomTabs}</nav> : null}
    </div>
  );
});
