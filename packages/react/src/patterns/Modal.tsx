"use client";

import {
  useEffect,
  useId,
  useRef,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../utils/cn';
import { Button } from '../primitives/Button';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

const SIZE_WIDTH: Record<ModalSize, number | string> = {
  sm: 420,
  md: 560,
  lg: 760,
  xl: 1000,
  full: 'calc(100vw - 64px)',
};

export interface ModalProps {
  /** Controlled open state. */
  open: boolean;
  /** Fires when the modal requests to close (Esc, backdrop, close button). */
  onOpenChange: (open: boolean) => void;
  /** Width preset. @default 'md' */
  size?: ModalSize;
  /** Title rendered in the header. Omit for a chromeless modal. */
  title?: ReactNode;
  /** Optional sub-title under the title. */
  description?: ReactNode;
  /** Footer node — typically the action buttons. Rendered in `.modal-f`. */
  footer?: ReactNode;
  /** Allow closing by clicking the scrim. @default true */
  closeOnBackdrop?: boolean;
  /** Allow closing with the Escape key. @default true */
  closeOnEsc?: boolean;
  /** Show the × close button in the header. @default true */
  showClose?: boolean;
  /** Extra className on the modal card. */
  className?: string;
  /** Body content. */
  children?: ReactNode;
}

/**
 * Modal — accessible dialog assembly. Composes the `.modal-scrim` / `.modal-card`
 * shells from components.css with focus-trap, scroll-lock, ESC, configurable
 * backdrop dismiss and a portal to `document.body`.
 *
 * Accessibility:
 *   - `role="dialog"` + `aria-modal="true"`, labelled by the title and described
 *     by the description when present.
 *   - On open, focus moves into the card; Tab is trapped; on close focus returns
 *     to the previously focused element.
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 * <Modal
 *   open={open}
 *   onOpenChange={setOpen}
 *   size="md"
 *   title="Archive supplier"
 *   description="Mukamba Group will be hidden from active lists."
 *   footer={<>
 *     <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
 *     <Button variant="primary" onClick={confirm}>Archive</Button>
 *   </>}
 * >
 *   <p>You can restore the supplier from the archive at any time.</p>
 * </Modal>
 * ```
 */
export function Modal({
  open,
  onOpenChange,
  size = 'md',
  title,
  description,
  footer,
  closeOnBackdrop = true,
  closeOnEsc = true,
  showClose = true,
  className,
  children,
}: ModalProps) {
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const descId = `${baseId}-desc`;

  return (
    <Overlay
      open={open}
      onOpenChange={onOpenChange}
      closeOnBackdrop={closeOnBackdrop}
      closeOnEsc={closeOnEsc}
      labelledBy={title ? titleId : undefined}
      describedBy={description ? descId : undefined}
      placement="center"
      cardClassName={cn('modal-card', className)}
      cardStyle={{ width: '100%', maxWidth: SIZE_WIDTH[size] }}
    >
      {(title || showClose) && (
        <div className="modal-h" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            {title ? <h2 id={titleId} className="t">{title}</h2> : null}
            {description ? <p id={descId} className="s">{description}</p> : null}
          </div>
          {showClose ? (
            <Button type="button" variant="quiet" size="sm" iconOnly aria-label="Close dialog" onClick={() => onOpenChange(false)} style={CLOSE_BTN_STYLE}>
              ×
            </Button>
          ) : null}
        </div>
      )}
      {children ? <div className="modal-b">{children}</div> : null}
      {footer ? <div className="modal-f">{footer}</div> : null}
    </Overlay>
  );
}

export type SheetSide = 'left' | 'right' | 'top' | 'bottom';

export interface SheetProps extends Omit<ModalProps, 'size'> {
  /** Edge the sheet slides in from. @default 'right' */
  side?: SheetSide;
  /** Sheet size along its main axis (width for left/right, height for top/bottom). @default 420 */
  sizePx?: number;
}

/**
 * Sheet — a Modal that slides in from a screen edge (a.k.a. drawer / side panel).
 * Reuses the same focus-trap + scroll-lock + portal machinery and the `.drawer`
 * styling from components.css.
 *
 * @example
 * ```tsx
 * <Sheet open={open} onOpenChange={setOpen} side="right" title="Filter invoices">
 *   <FilterForm />
 * </Sheet>
 * ```
 */
export function Sheet({
  open,
  onOpenChange,
  side = 'right',
  sizePx = 420,
  title,
  description,
  footer,
  closeOnBackdrop = true,
  closeOnEsc = true,
  showClose = true,
  className,
  children,
}: SheetProps) {
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const descId = `${baseId}-desc`;

  const horizontal = side === 'left' || side === 'right';
  const cardStyle: CSSProperties = horizontal
    ? { width: sizePx, maxWidth: 'calc(100vw - 32px)', height: '100%', borderLeft: side === 'right' ? undefined : 'none' }
    : { height: sizePx, maxHeight: 'calc(100vh - 32px)', width: '100%' };

  return (
    <Overlay
      open={open}
      onOpenChange={onOpenChange}
      closeOnBackdrop={closeOnBackdrop}
      closeOnEsc={closeOnEsc}
      labelledBy={title ? titleId : undefined}
      describedBy={description ? descId : undefined}
      placement={side}
      cardClassName={cn('drawer', className)}
      cardStyle={cardStyle}
    >
      {(title || showClose) && (
        <div className="drawer-h">
          <div>
            {title ? <div id={titleId} className="ti">{title}</div> : null}
            {description ? <div id={descId} className="sub">{description}</div> : null}
          </div>
          {showClose ? (
            <Button type="button" variant="quiet" size="sm" iconOnly aria-label="Close panel" onClick={() => onOpenChange(false)}>
              ×
            </Button>
          ) : null}
        </div>
      )}
      <div className="drawer-body">{children}</div>
      {footer ? <div className="drawer-foot">{footer}</div> : null}
    </Overlay>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Shared overlay engine — focus trap, scroll lock, ESC, backdrop, portal.
// ──────────────────────────────────────────────────────────────────────────
interface OverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  closeOnBackdrop: boolean;
  closeOnEsc: boolean;
  labelledBy?: string;
  describedBy?: string;
  placement: 'center' | SheetSide;
  cardClassName?: string;
  cardStyle?: CSSProperties;
  children?: ReactNode;
}

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const CLOSE_BTN_STYLE: CSSProperties = {
  color: 'var(--text-muted)',
  fontSize: 20,
};

function Overlay({
  open,
  onOpenChange,
  closeOnBackdrop,
  closeOnEsc,
  labelledBy,
  describedBy,
  placement,
  cardClassName,
  cardStyle,
  children,
}: OverlayProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    requestAnimationFrame(() => {
      const focusable = cardRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      (focusable ?? cardRef.current)?.focus();
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEsc) {
        e.preventDefault();
        onOpenChange(false);
        return;
      }
      if (e.key === 'Tab') {
        const focusables = Array.from(cardRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }
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
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [open, closeOnEsc, onOpenChange]);

  if (!open) return null;
  const portalTarget = typeof document !== 'undefined' ? document.body : null;
  if (!portalTarget) return null;

  const scrimStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(42,38,34,0.32)',
    display: 'flex',
    zIndex: 1100,
    ...placementToScrim(placement),
  };

  return createPortal(
    <div
      className="modal-scrim"
      style={scrimStyle}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget && closeOnBackdrop) onOpenChange(false);
      }}
    >
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        className={cardClassName}
        style={cardStyle}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    portalTarget,
  );
}

function placementToScrim(placement: 'center' | SheetSide): CSSProperties {
  switch (placement) {
    case 'center':
      return { alignItems: 'center', justifyContent: 'center', padding: 32 };
    case 'left':
      return { alignItems: 'stretch', justifyContent: 'flex-start' };
    case 'right':
      return { alignItems: 'stretch', justifyContent: 'flex-end' };
    case 'top':
      return { alignItems: 'flex-start', justifyContent: 'stretch', flexDirection: 'column' };
    case 'bottom':
      return { alignItems: 'flex-end', justifyContent: 'stretch', flexDirection: 'column' };
  }
}
