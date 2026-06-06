import { useCallback, useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../utils/cx';
import './BottomSheet.css';

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
  /** Click backdrop dismisses (default true). */
  dismissOnBackdrop?: boolean;
  /** Escape closes (default true). */
  dismissOnEscape?: boolean;
  /** Portal target. Defaults to document.body. */
  container?: HTMLElement | null;
}

const FOCUSABLE_SELECTOR =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  className,
  dismissOnBackdrop = true,
  dismissOnEscape = true,
  container,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  // Focus management + escape + simple focus trap.
  useEffect(() => {
    if (!open) return;
    lastFocusRef.current = (document.activeElement as HTMLElement | null) ?? null;
    const node = sheetRef.current;
    if (node) {
      const focusable = node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      (focusable[0] ?? node).focus();
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissOnEscape) {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Tab' && node) {
        const focusable = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
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
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      lastFocusRef.current?.focus?.();
    };
  }, [open, onClose, dismissOnEscape]);

  const handleBackdrop = useCallback(() => {
    if (dismissOnBackdrop) onClose();
  }, [dismissOnBackdrop, onClose]);

  if (!open) return null;
  const target = container ?? (typeof document !== 'undefined' ? document.body : null);
  if (!target) return null;

  return createPortal(
    <>
      <div className="x-bottom-sheet-overlay" onClick={handleBackdrop} aria-hidden="true" />
      <div
        ref={sheetRef}
        className={cx('x-bottom-sheet', className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
      >
        {title ? (
          <header className="x-bottom-sheet-header">
            <h2 id={titleId} className="x-bottom-sheet-title">{title}</h2>
            <button type="button" className="x-bottom-sheet-close" aria-label="Close" onClick={onClose}>×</button>
          </header>
        ) : null}
        <div className="x-bottom-sheet-body">{children}</div>
      </div>
    </>,
    target,
  );
}
