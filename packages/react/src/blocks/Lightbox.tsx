"use client";

import { useEffect, forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../utils/cn';

export interface LightboxImage {
  src: string;
  alt?: string;
  caption?: ReactNode;
}

export interface LightboxProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
  images: LightboxImage[];
  index?: number;
  onIndexChange?: (index: number) => void;
}

export const Lightbox = forwardRef<HTMLDivElement, LightboxProps>(function Lightbox(
  { open, onClose, images = [], index = 0, onIndexChange, className, ...props },
  ref,
) {
  const currentImage = images[index];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        if (index < images.length - 1) onIndexChange?.(index + 1);
      } else if (e.key === 'ArrowLeft') {
        if (index > 0) onIndexChange?.(index - 1);
      }
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, index, images.length, onClose, onIndexChange]);

  if (!open || !currentImage) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={ref}
      className={cn('b-lightbox', className)}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      {...props}
    >
      <button
        type="button"
        aria-label="Close image viewer"
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 16,
          right: 20,
          background: 'none',
          border: 'none',
          color: '#ffffff',
          fontSize: 28,
          cursor: 'pointer',
          zIndex: 1201,
        }}
      >
        ×
      </button>

      {index > 0 && (
        <button
          type="button"
          aria-label="Previous image"
          onClick={() => onIndexChange?.(index - 1)}
          style={{
            position: 'absolute',
            left: 20,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: '#ffffff',
            fontSize: 24,
            width: 44,
            height: 44,
            borderRadius: '50%',
            cursor: 'pointer',
            zIndex: 1201,
          }}
        >
          ‹
        </button>
      )}

      {index < images.length - 1 && (
        <button
          type="button"
          aria-label="Next image"
          onClick={() => onIndexChange?.(index + 1)}
          style={{
            position: 'absolute',
            right: 20,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: '#ffffff',
            fontSize: 24,
            width: 44,
            height: 44,
            borderRadius: '50%',
            cursor: 'pointer',
            zIndex: 1201,
          }}
        >
          ›
        </button>
      )}

      <img
        src={currentImage.src}
        alt={currentImage.alt || `Image ${index + 1}`}
        style={{
          maxWidth: '90vw',
          maxHeight: '80vh',
          objectFit: 'contain',
          borderRadius: 8,
        }}
      />

      {currentImage.caption && (
        <div style={{ marginTop: 16, color: '#ffffff', font: 'var(--type-body-sm)', textAlign: 'center' }}>
          {currentImage.caption}
        </div>
      )}
    </div>,
    document.body,
  );
});
