"use client";

import { toast, Toaster, type ToastOptions } from '../primitives/Toast';
import type { ReactNode } from 'react';

export function useToast() {
  return {
    show: (title: ReactNode, opts?: ToastOptions) => toast(title, opts),
    success: (title: ReactNode, opts?: ToastOptions) => toast.success(title, opts),
    error: (title: ReactNode, opts?: ToastOptions) => toast.error(title, opts),
    warn: (title: ReactNode, opts?: ToastOptions) => toast.warn(title, opts),
    dismiss: (id?: string) => toast.dismiss(id),
  };
}

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
