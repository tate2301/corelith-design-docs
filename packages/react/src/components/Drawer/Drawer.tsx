import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../utils/cx';
import { isTop, popOverlay, pushOverlay } from '../../utils/overlayStack';
import './Drawer.css';

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

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

/**
 * Drawer — side-anchored sheet rendered in a portal.
 *
 * Participates in the overlay stack — Escape closes the topmost overlay first
 * (e.g. a Modal opened inside a Drawer closes ahead of the Drawer). Forwarded
 * ref points at the drawer's `role="dialog"` element.
 *
 * @example
 * ```tsx
 * <Drawer open={open} onClose={close} side="right" title="Settings">
 *   body
 * </Drawer>
 * ```
 */
export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(function Drawer(
  {
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
  },
  forwardedRef,
) {
  const ref = useRef<HTMLDivElement | null>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useImperativeHandle(forwardedRef, () => ref.current as HTMLDivElement, []);

  useEffect(() => {
    if (!open) return;
    const token = pushOverlay();
    lastFocus.current = (document.activeElement as HTMLElement | null) ?? null;
    const node = ref.current;
    if (node) {
      const focusable = node.querySelectorAll<HTMLElement>(FOCUSABLE);
      (focusable[0] ?? node).focus();
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissOnEscape) {
        if (!isTop(token)) return;
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === 'Tab' && node) {
        const focusable = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (focusable.length === 0) return;
        const first = focusable[0]!;
        const last = focusable[focusable.length - 1]!;
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      popOverlay(token);
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
});
