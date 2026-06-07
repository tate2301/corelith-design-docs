import { useState, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Modal } from '../Modal/Modal';
import { cx } from '../../utils/cx';
import './AlertDialog.css';

export type AlertDialogVariant = 'default' | 'danger' | 'warning';

export interface AlertDialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  /** Accent for confirm button + leading icon slot. `danger` uses the destructive button. */
  variant?: AlertDialogVariant;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  /** Called when the user confirms. May be async; the confirm button shows a loading state until it resolves. */
  onConfirm?: () => void | Promise<void>;
  /** Optional icon slot rendered before the title (e.g. an SVG warning glyph). */
  icon?: ReactNode;
  className?: string;
}

/**
 * `AlertDialog` is an opinionated confirm/cancel/destructive dialog built on
 * top of `Modal`. Use the named export for in-tree usage, or
 * `AlertDialog.confirm()` for an imperative one-shot prompt.
 */
export function AlertDialog({
  open,
  onClose,
  title,
  description,
  variant = 'default',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  icon,
  className,
}: AlertDialogProps) {
  const [pending, setPending] = useState(false);

  const confirmCls =
    variant === 'danger'
      ? 'btn btn-danger btn-md'
      : 'btn btn-primary btn-md';

  const handleConfirm = async () => {
    if (!onConfirm) {
      onClose();
      return;
    }
    try {
      const result = onConfirm();
      if (result && typeof (result as Promise<void>).then === 'function') {
        setPending(true);
        await result;
      }
      onClose();
    } finally {
      setPending(false);
    }
  };

  const footer = (
    <div className="alert-dialog-actions">
      <button type="button" className="btn btn-ghost btn-md" onClick={onClose} disabled={pending}>
        {cancelLabel}
      </button>
      <button
        type="button"
        className={confirmCls}
        onClick={handleConfirm}
        disabled={pending}
        aria-busy={pending || undefined}
      >
        {pending ? 'Working…' : confirmLabel}
      </button>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      className={cx('alert-dialog', `alert-dialog-${variant}`, className)}
      footer={footer}
      title={
        <span className="alert-dialog-title">
          {icon ? <span className="alert-dialog-icon" aria-hidden="true">{icon}</span> : null}
          <span>{title}</span>
        </span>
      }
    >
      {description ? <div className="alert-dialog-desc">{description}</div> : null}
    </Modal>
  );
}

// ── Imperative API ──────────────────────────────────────────────
// `AlertDialog.confirm({...})` mounts a singleton portal root on first call,
// renders an `AlertDialog`, and returns `Promise<boolean>`.

export interface AlertDialogConfirmOptions {
  title: ReactNode;
  description?: ReactNode;
  variant?: AlertDialogVariant;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  icon?: ReactNode;
}

let imperativeRoot: Root | null = null;
let imperativeHost: HTMLDivElement | null = null;

function ensureHost(): Root {
  if (imperativeRoot && imperativeHost) return imperativeRoot;
  if (typeof document === 'undefined') {
    throw new Error('AlertDialog.confirm() requires a browser document.');
  }
  imperativeHost = document.createElement('div');
  imperativeHost.setAttribute('data-alert-dialog-root', '');
  document.body.appendChild(imperativeHost);
  imperativeRoot = createRoot(imperativeHost);
  return imperativeRoot;
}

function teardownHost() {
  if (imperativeRoot) {
    try {
      imperativeRoot.unmount();
    } catch {
      /* ignore */
    }
    imperativeRoot = null;
  }
  if (imperativeHost && imperativeHost.parentNode) {
    imperativeHost.parentNode.removeChild(imperativeHost);
  }
  imperativeHost = null;
}

function confirm(options: AlertDialogConfirmOptions): Promise<boolean> {
  const root = ensureHost();
  return new Promise<boolean>((resolve) => {
    const dismiss = (value: boolean) => {
      // Re-render with open=false so the modal can run its unmount hooks,
      // then tear down on the next tick.
      root.render(
        <AlertDialog
          {...options}
          open={false}
          onClose={() => {
            /* noop — already dismissing */
          }}
        />,
      );
      setTimeout(() => {
        teardownHost();
        resolve(value);
      }, 0);
    };
    root.render(
      <AlertDialog
        {...options}
        open
        onClose={() => dismiss(false)}
        onConfirm={() => dismiss(true)}
      />,
    );
  });
}

// Static assignment — matches the pattern used elsewhere (Menu.Item, etc).
AlertDialog.confirm = confirm;
