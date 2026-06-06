import type { ReactNode } from 'react';
import { Modal, type ModalProps } from '../Modal/Modal';

export interface DialogProps extends ModalProps {
  /** Convenience: render a footer with confirm/cancel buttons. */
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  onConfirm?: () => void;
  confirmDisabled?: boolean;
  destructive?: boolean;
}

/**
 * `Dialog` is a thin opinionated wrapper around `Modal` that lays out the
 * common title/body/footer slots and (optionally) renders the confirm/cancel
 * action buttons for you.
 */
export function Dialog({
  confirmLabel,
  cancelLabel,
  onConfirm,
  confirmDisabled,
  destructive,
  footer,
  onClose,
  children,
  ...rest
}: DialogProps) {
  const resolvedFooter =
    footer ??
    (confirmLabel || cancelLabel ? (
      <>
        {cancelLabel ? (
          <button type="button" className="btn btn-ghost btn-md" onClick={onClose}>
            {cancelLabel}
          </button>
        ) : null}
        {confirmLabel ? (
          <button
            type="button"
            className={destructive ? 'btn btn-danger btn-md' : 'btn btn-primary btn-md'}
            onClick={onConfirm}
            disabled={confirmDisabled}
          >
            {confirmLabel}
          </button>
        ) : null}
      </>
    ) : null);

  return (
    <Modal {...rest} onClose={onClose} footer={resolvedFooter}>
      {children}
    </Modal>
  );
}
