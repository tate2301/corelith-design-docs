import { forwardRef, type ReactNode } from 'react';
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
 * Dialog — opinionated wrapper around `Modal` with confirm/cancel slots.
 *
 * Forwarded ref points at the underlying Modal's dialog element.
 *
 * @example
 * ```tsx
 * <Dialog
 *   open={open}
 *   onClose={close}
 *   onConfirm={save}
 *   title="Delete?"
 *   confirmLabel="Delete"
 *   cancelLabel="Cancel"
 *   destructive
 * >
 *   This cannot be undone.
 * </Dialog>
 * ```
 */
export const Dialog = forwardRef<HTMLDivElement, DialogProps>(function Dialog(
  {
    confirmLabel,
    cancelLabel,
    onConfirm,
    confirmDisabled,
    destructive,
    footer,
    onClose,
    children,
    ...rest
  },
  ref,
) {
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
    <Modal ref={ref} {...rest} onClose={onClose} footer={resolvedFooter}>
      {children}
    </Modal>
  );
});
