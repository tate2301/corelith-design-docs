"use client";

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../utils/cn';
import { Button } from './Button';

interface AlertDialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  titleId: string;
  descId: string;
}

const AlertDialogContext = createContext<AlertDialogContextValue | null>(null);
const useAD = () => {
  const ctx = useContext(AlertDialogContext);
  if (!ctx) throw new Error('AlertDialog primitive: child must be inside <AlertDialog>.');
  return ctx;
};

export interface AlertDialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

/**
 * AlertDialog — blocking confirmation modal. Composes `.modal-scrim` /
 * `.modal-card` shells from components.css with `role="alertdialog"`.
 *
 * Accessibility:
 *   - `role="alertdialog"` with `aria-labelledby` (Title) and `aria-describedby`
 *     (Description) — both required for screen readers.
 *   - Focus is moved into the dialog on open and trapped within (tab cycles
 *     through dialog focusables). Cancel is auto-focused as the safe default
 *     — never Action.
 *   - Escape triggers cancel. Click-outside is INTENTIONALLY disabled (an
 *     alert dialog must be answered explicitly).
 *   - On close, focus returns to the previously focused element.
 */
export function AlertDialog({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  children,
}: AlertDialogProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp! : uncontrolled;
  const baseId = useId();

  const setOpen = useCallback(
    (v: boolean) => {
      if (!isControlled) setUncontrolled(v);
      onOpenChange?.(v);
    },
    [isControlled, onOpenChange],
  );

  const ctx = useMemo<AlertDialogContextValue>(
    () => ({ open, setOpen, titleId: `${baseId}-title`, descId: `${baseId}-desc` }),
    [open, setOpen, baseId],
  );

  return <AlertDialogContext.Provider value={ctx}>{children}</AlertDialogContext.Provider>;
}

export interface AlertDialogContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Use destructive styling (delete-style action). @default false */
  destructive?: boolean;
}

const AlertDialogContent = forwardRef<HTMLDivElement, AlertDialogContentProps>(
  function AlertDialogContent({ destructive, className, children, ...rest }, ref) {
    const ctx = useAD();
    const cardRef = useRef<HTMLDivElement | null>(null);
    const previouslyFocused = useRef<HTMLElement | null>(null);

    const setRefs = (node: HTMLDivElement | null) => {
      cardRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    };

    useEffect(() => {
      if (!ctx.open) return;
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      // Focus cancel first (safe default), else first focusable, else dialog.
      requestAnimationFrame(() => {
        const cancelBtn = cardRef.current?.querySelector<HTMLElement>('[data-ad-cancel]');
        if (cancelBtn) cancelBtn.focus();
        else {
          const focusable = cardRef.current?.querySelector<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          );
          (focusable ?? cardRef.current)?.focus();
        }
      });
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          ctx.setOpen(false);
        } else if (e.key === 'Tab') {
          // Trap focus.
          const focusables = Array.from(
            cardRef.current?.querySelectorAll<HTMLElement>(
              'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
            ) ?? [],
          );
          if (focusables.length === 0) return;
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };
      document.addEventListener('keydown', onKey);
      // Lock body scroll while open.
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', onKey);
        document.body.style.overflow = prevOverflow;
        previouslyFocused.current?.focus?.();
      };
    }, [ctx]);

    if (!ctx.open) return null;
    const portalTarget = typeof document !== 'undefined' ? document.body : null;
    if (!portalTarget) return null;

    return createPortal(
      <div
        className="modal-scrim"
        style={{ position: 'fixed', inset: 0, zIndex: 1100 }}
        aria-hidden="false"
      >
        <div
          ref={setRefs}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby={ctx.titleId}
          aria-describedby={ctx.descId}
          tabIndex={-1}
          data-destructive={destructive || undefined}
          className={cn('modal-card', className)}
          {...rest}
        >
          {children}
        </div>
      </div>,
      portalTarget,
    );
  },
);

const AlertDialogTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  function AlertDialogTitle({ className, children, ...rest }, ref) {
    const ctx = useAD();
    return (
      <div className="modal-h">
        <h2 ref={ref} id={ctx.titleId} className={cn('t', className)} style={{ font: 'var(--type-section-title)', color: 'var(--text-strong)', margin: 0 }} {...rest}>
          {children}
        </h2>
      </div>
    );
  },
);

const AlertDialogDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  function AlertDialogDescription({ className, children, ...rest }, ref) {
    const ctx = useAD();
    return (
      <div className="modal-b">
        <p ref={ref} id={ctx.descId} className={className} style={{ color: 'var(--text-muted)', margin: 0, font: 'var(--type-body)' }} {...rest}>
          {children}
        </p>
      </div>
    );
  },
);

const AlertDialogFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function AlertDialogFooter({ className, children, ...rest }, ref) {
    return (
      <div ref={ref} className={cn('modal-f', className)} {...rest}>
        {children}
      </div>
    );
  },
);

export interface AlertDialogCancelProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Render the cancel styles onto the supplied child, Radix Slot-style. */
  asChild?: boolean;
}

const AlertDialogCancel = forwardRef<HTMLButtonElement, AlertDialogCancelProps>(
  function AlertDialogCancel({ className, children = 'Cancel', onClick, ...rest }, ref) {
    const ctx = useAD();
    return (
      <Button
        ref={ref}
        type="button"
        data-ad-cancel="true"
        variant="ghost"
        className={className}
        onClick={(e) => {
          onClick?.(e);
          ctx.setOpen(false);
        }}
        {...rest}
      >
        {children}
      </Button>
    );
  },
);

export interface AlertDialogActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Use the danger button variant. */
  destructive?: boolean;
  /** Render the action styles onto the supplied child, Radix Slot-style. */
  asChild?: boolean;
}

const AlertDialogAction = forwardRef<HTMLButtonElement, AlertDialogActionProps>(
  function AlertDialogAction({ className, children, destructive, onClick, ...rest }, ref) {
    const ctx = useAD();
    return (
      <Button
        ref={ref}
        type="button"
        variant={destructive ? 'destructive' : 'primary'}
        className={className}
        onClick={(e) => {
          onClick?.(e);
          ctx.setOpen(false);
        }}
        {...rest}
      >
        {children}
      </Button>
    );
  },
);

(AlertDialog as unknown as Record<string, unknown>).Content = AlertDialogContent;
(AlertDialog as unknown as Record<string, unknown>).Title = AlertDialogTitle;
(AlertDialog as unknown as Record<string, unknown>).Description = AlertDialogDescription;
(AlertDialog as unknown as Record<string, unknown>).Footer = AlertDialogFooter;
(AlertDialog as unknown as Record<string, unknown>).Cancel = AlertDialogCancel;
(AlertDialog as unknown as Record<string, unknown>).Action = AlertDialogAction;

export type AlertDialogComponent = typeof AlertDialog & {
  Content: typeof AlertDialogContent;
  Title: typeof AlertDialogTitle;
  Description: typeof AlertDialogDescription;
  Footer: typeof AlertDialogFooter;
  Cancel: typeof AlertDialogCancel;
  Action: typeof AlertDialogAction;
};

export {
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
};
