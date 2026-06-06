import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../utils/cx';
import './Drawer.css';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  /** Which edge of the viewport. */
  side?: 'right' | 'left';
  /** Click backdrop dismisses (default true). */
  dismissOnBackdrop?: boolean;
  /** Escape closes (default true). */
  dismissOnEscape?: boolean;
  /** Portal container. Defaults to document.body. */
  container?: HTMLElement | null;
  className?: string;
}

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  footer,
  children,
  side = 'right',
  dismissOnBackdrop = true,
  dismissOnEscape = true,
  container,
  className,
}: DrawerProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    lastFocus.current = (document.activeElement as HTMLElement | null) ?? null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissOnEscape) {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      lastFocus.current?.focus?.();
    };
  }, [open, onClose, dismissOnEscape]);

  if (!open) return null;
  const target = container ?? (typeof document !== 'undefined' ? document.body : null);
  if (!target) return null;

  return createPortal(
    <>
      <div
        className="x-drawer-overlay"
        onClick={() => dismissOnBackdrop && onClose()}
        aria-hidden="true"
      />
      <div
        ref={ref}
        className={cx('drawer', `x-drawer-${side}`, className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
      >
        {title || subtitle ? (
          <header className="drawer-h">
            <div>
              {title ? <div id={titleId} className="ti">{title}</div> : null}
              {subtitle ? <div className="sub">{subtitle}</div> : null}
            </div>
            <button type="button" className="x" aria-label="Close" onClick={onClose}>×</button>
          </header>
        ) : null}
        <div className="drawer-body">{children}</div>
        {footer ? <footer className="drawer-foot">{footer}</footer> : null}
      </div>
    </>,
    target,
  );
}
