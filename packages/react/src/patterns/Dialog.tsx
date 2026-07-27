"use client";

import { type ReactNode } from 'react';
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

/**
 * Dialog — a `Modal` with the confirm/cancel footer already built. Reach for it
 * when the point of the surface is a decision; use `Modal` directly when the
 * footer is bespoke.
 *
 * Closing is reported through `onOpenChange(false)`, the same contract as
 * `Modal` — cancel, Escape, backdrop and the × button all route through it.
 */
export function Dialog({
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  tone = 'default',
  loading = false,
  onOpenChange,
  children,
  ...props
}: DialogProps) {
  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
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
    <Modal onOpenChange={onOpenChange} footer={footer} {...props}>
      {children}
    </Modal>
  );
}
