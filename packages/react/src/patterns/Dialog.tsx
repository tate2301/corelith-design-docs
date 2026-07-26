"use client";

import { forwardRef, type ReactNode } from 'react';
import { Modal, type ModalProps } from './Modal';
import { Button } from '../primitives/Button';

export interface DialogProps extends Omit<ModalProps, 'footer'> {
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  tone?: 'default' | 'danger' | 'warn' | 'success';
  loading?: boolean;
  children?: ReactNode;
}

export const Dialog = forwardRef<HTMLDivElement, DialogProps>(function Dialog(
  {
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
    tone = 'default',
    loading = false,
    onClose,
    children,
    ...props
  },
  ref,
) {
  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  const footer = (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', width: '100%' }}>
      <Button variant="secondary" onClick={handleCancel} disabled={loading}>
        {cancelLabel}
      </Button>
      <Button
        variant={tone === 'danger' ? 'danger' : 'primary'}
        onClick={onConfirm}
        loading={loading}
      >
        {confirmLabel}
      </Button>
    </div>
  );

  return (
    <Modal ref={ref} onClose={onClose} footer={footer} {...props}>
      {children}
    </Modal>
  );
});
