import {
  cloneElement,
  forwardRef,
  isValidElement,
  useId,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../utils/cn';
import { usePosition, type Side } from '../utils/usePosition';

export interface TooltipProps {
  /** Tooltip body content. */
  content: ReactNode;
  /** Preferred placement; auto-flips when out of viewport. @default 'top' */
  side?: Side;
  /** Delay before showing on hover/focus, in ms. @default 200 */
  openDelay?: number;
  /** Delay before hiding when pointer leaves, in ms. @default 100 */
  closeDelay?: number;
  /** Controlled open state. */
  open?: boolean;
  /** Open state change handler. */
  onOpenChange?: (open: boolean) => void;
  /** A single trigger element. Must accept ref + standard event handlers. */
  children: ReactElement;
}

/**
 * Tooltip — short text hint anchored to a trigger. Maps to `.tooltip` in
 * components.css.
 *
 * Rendered into `document.body` via React portal. Positioning is best-effort
 * (anchor rect + bounding rect + auto-flip); not a full Floating UI.
 *
 * Accessibility:
 *   - Shown on `pointerenter` / `focus`, hidden on `pointerleave` / `blur` and
 *     when Escape is pressed.
 *   - Trigger gets `aria-describedby` pointing to the tooltip while open.
 *   - The tooltip carries `role="tooltip"`.
 *   - Tooltips are supplemental only — never put critical info or controls
 *     inside (touch users can't trigger them reliably).
 */
export function Tooltip({
  content,
  side = 'top',
  openDelay = 200,
  closeDelay = 100,
  open: openProp,
  onOpenChange,
  children,
}: TooltipProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp! : uncontrolledOpen;
  const setOpen = (v: boolean) => {
    if (!isControlled) setUncontrolledOpen(v);
    onOpenChange?.(v);
  };

  const id = useId();
  const anchorRef = useRef<HTMLElement | null>(null);
  const floatingRef = useRef<HTMLDivElement | null>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pos = usePosition(anchorRef, floatingRef, open, { side, sideOffset: 8 });

  const cancelTimers = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = null;
    closeTimer.current = null;
  };
  const scheduleOpen = () => {
    cancelTimers();
    openTimer.current = setTimeout(() => setOpen(true), openDelay);
  };
  const scheduleClose = () => {
    cancelTimers();
    closeTimer.current = setTimeout(() => setOpen(false), closeDelay);
  };

  if (!isValidElement(children)) {
    throw new Error('Tooltip: children must be a single React element.');
  }

  const childProps = children.props as Record<string, unknown> & {
    onPointerEnter?: (e: React.PointerEvent) => void;
    onPointerLeave?: (e: React.PointerEvent) => void;
    onFocus?: (e: React.FocusEvent) => void;
    onBlur?: (e: React.FocusEvent) => void;
    onKeyDown?: (e: React.KeyboardEvent) => void;
    ref?: React.Ref<HTMLElement>;
  };

  const setRefs = (node: HTMLElement | null) => {
    anchorRef.current = node;
    const r = childProps.ref;
    if (typeof r === 'function') r(node);
    else if (r && typeof r === 'object') (r as React.MutableRefObject<HTMLElement | null>).current = node;
  };

  const trigger = cloneElement(children, {
    ref: setRefs,
    'aria-describedby': open ? id : childProps['aria-describedby'],
    onPointerEnter: (e: React.PointerEvent) => {
      childProps.onPointerEnter?.(e);
      scheduleOpen();
    },
    onPointerLeave: (e: React.PointerEvent) => {
      childProps.onPointerLeave?.(e);
      scheduleClose();
    },
    onFocus: (e: React.FocusEvent) => {
      childProps.onFocus?.(e);
      scheduleOpen();
    },
    onBlur: (e: React.FocusEvent) => {
      childProps.onBlur?.(e);
      scheduleClose();
    },
    onKeyDown: (e: React.KeyboardEvent) => {
      childProps.onKeyDown?.(e);
      if (e.key === 'Escape') {
        cancelTimers();
        setOpen(false);
      }
    },
  } as Partial<React.ComponentProps<typeof children.type>>);

  const portalTarget = typeof document !== 'undefined' ? document.body : null;

  return (
    <>
      {trigger}
      {open && portalTarget
        ? createPortal(
            <div
              ref={floatingRef}
              role="tooltip"
              id={id}
              className={cn('tooltip')}
              onPointerEnter={cancelTimers}
              onPointerLeave={scheduleClose}
              style={{
                position: 'absolute',
                top: pos?.top ?? -9999,
                left: pos?.left ?? -9999,
                zIndex: 1000,
                pointerEvents: 'none',
              }}
            >
              {content}
            </div>,
            portalTarget,
          )
        : null}
    </>
  );
}

/** Convenience: a tooltip-trigger wrapper for spans/text that don't expose ref. */
export const TooltipTrigger = forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  function TooltipTrigger(props, ref) {
    return <span ref={ref} tabIndex={0} {...props} />;
  },
);
