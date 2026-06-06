import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../utils/cx';
import './Lightbox.css';

export interface LightboxImage {
  src: string;
  alt?: string;
  caption?: ReactNode;
}

export interface LightboxProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  images: LightboxImage[];
  /** Index of the currently displayed image. */
  index: number;
  open?: boolean;
  onClose?: () => void;
  onChange?: (index: number) => void;
}

const CloseIcon = (
  <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
    <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);
const PrevIcon = (
  <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
    <path d="M13 4l-6 6 6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const NextIcon = (
  <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
    <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Lightbox = forwardRef<HTMLDivElement, LightboxProps>(function Lightbox(
  { images, index, open = true, onClose, onChange, className, ...rest },
  ref,
) {
  const total = images.length;
  const current = images[index];

  const go = useCallback(
    (delta: number) => {
      if (total <= 1) return;
      const next = (index + delta + total) % total;
      onChange?.(next);
    },
    [index, total, onChange],
  );

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose, go]);

  if (!open || !current) return null;
  if (typeof document === 'undefined') return null;

  const node = (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      className={cx('lightbox-backdrop', className)}
      onClick={onClose}
      {...rest}
    >
      <div className="lightbox-stage" onClick={(e) => e.stopPropagation()}>
        <img src={current.src} alt={current.alt ?? ''} />
        <button type="button" aria-label="Close" className="lightbox-btn close" onClick={onClose}>
          {CloseIcon}
        </button>
        {total > 1 ? (
          <>
            <button type="button" aria-label="Previous" className="lightbox-btn prev" onClick={() => go(-1)}>
              {PrevIcon}
            </button>
            <button type="button" aria-label="Next" className="lightbox-btn next" onClick={() => go(1)}>
              {NextIcon}
            </button>
          </>
        ) : null}
        {current.caption ? <div className="lightbox-caption">{current.caption}</div> : null}
      </div>
    </div>
  );
  return createPortal(node, document.body);
});

export interface UseGalleryResult {
  open: boolean;
  index: number;
  show: (i: number) => void;
  close: () => void;
  next: () => void;
  prev: () => void;
  setIndex: (i: number) => void;
}

/** Tiny controller for `<Lightbox>`. */
export function useGallery(initial = 0, total = 0): UseGalleryResult {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(initial);
  return useMemo<UseGalleryResult>(
    () => ({
      open,
      index,
      show: (i: number) => {
        setIndex(i);
        setOpen(true);
      },
      close: () => setOpen(false),
      next: () => setIndex((cur) => (total > 0 ? (cur + 1) % total : cur + 1)),
      prev: () => setIndex((cur) => (total > 0 ? (cur - 1 + total) % total : cur - 1)),
      setIndex,
    }),
    [open, index, total],
  );
}
