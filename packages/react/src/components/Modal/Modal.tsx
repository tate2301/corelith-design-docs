import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../utils/cx';
import './Modal.css';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  /** Size hint — adjusts the `max-width` on the dialog. */
  size?: 'sm' | 'md' | 'lg';
  dismissOnBackdrop?: boolean;
  dismissOnEscape?: boolean;
  container?: HTMLElement | null;
  className?: string;
}

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  footer,
  children,
  size = 'md',
  dismissOnBackdrop = true,
  dismissOnEscape = true,
  container,
  className,
}: ModalProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    lastFocus.current = (document.activeElement as HTMLElement | null) ?? null;
    const node = ref.current;
    if (node) {
      const focusable = node.querySelectorAll<HTMLElement>(FOCUSABLE);
      (focusable[0] ?? node).focus();
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissOnEscape) {
        e.preventDefault();
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
      lastFocus.current?.focus?.();
    };
  }, [open, onClose, dismissOnEscape]);

  if (!open) return null;
  const target = container ?? (typeof document !== 'undefined' ? document.body : null);
  if (!target) return null;

  return createPortal(
    <div className="x-modal-overlay" onClick={() => dismissOnBackdrop && onClose()}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={cx('modal-card', `x-modal-${size}`, className)}
        onClick={(e) => e.stopPropagation()}
      >
        {title || subtitle ? (
          <header className="modal-h">
            {title ? <div id={titleId} className="t">{title}</div> : null}
            {subtitle ? <div className="s">{subtitle}</div> : null}
          </header>
        ) : null}
        <div className="modal-b">{children}</div>
        {footer ? <footer className="modal-f">{footer}</footer> : null}
      </div>
    </div>,
    target,
  );
}
