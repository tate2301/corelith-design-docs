"use client";

import {
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../utils/cn';
import { Slot } from '../utils/Slot';
import { usePosition, type Align, type Side } from '../utils/usePosition';

export type { Align as TooltipAlign, Side as TooltipSide };

interface TooltipConfig {
  /** Default `openDelay` for descendant tooltips, in ms. */
  delayDuration?: number;
}

const TooltipConfigContext = createContext<TooltipConfig>({});

export interface TooltipProviderProps extends TooltipConfig {
  children?: ReactNode;
}

/**
 * TooltipProvider — supplies a shared default `openDelay` to every descendant
 * `Tooltip`. Optional: tooltips work standalone and an explicit `openDelay`
 * prop on a Tooltip always wins.
 *
 * @example
 * ```tsx
 * <TooltipProvider delayDuration={0}>
 *   <Toolbar />
 * </TooltipProvider>
 * ```
 */
export function TooltipProvider({ delayDuration, children }: TooltipProviderProps) {
  const value = useMemo(() => ({ delayDuration }), [delayDuration]);
  return <TooltipConfigContext.Provider value={value}>{children}</TooltipConfigContext.Provider>;
}

export interface TooltipProps {
  /** Tooltip body content. */
  content: ReactNode;
  /** Preferred placement; auto-flips when out of viewport. @default 'top' */
  side?: Side;
  /** Alignment along the cross-axis of `side`. @default 'center' */
  align?: Align;
  /** Gap between trigger and tooltip, in px. @default 8 */
  sideOffset?: number;
  /**
   * Delay before showing on hover/focus, in ms. Falls back to the nearest
   * `TooltipProvider`'s `delayDuration`, then to 200.
   */
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
 *
 * @example
 * ```tsx
 * <Tooltip content="Copy to clipboard" side="bottom" align="start" sideOffset={4}>
 *   <button className="btn btn-icon" aria-label="Copy"><CopyIcon /></button>
 * </Tooltip>
 * ```
 */
export function Tooltip({
  content,
  side = 'top',
  align = 'center',
  sideOffset = 8,
  openDelay: openDelayProp,
  closeDelay = 100,
  open: openProp,
  onOpenChange,
  children,
}: TooltipProps) {
  const config = useContext(TooltipConfigContext);
  const openDelay = openDelayProp ?? config.delayDuration ?? 200;
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

  const pos = usePosition(anchorRef, floatingRef, open, { side, align, sideOffset });

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

  const trigger = cloneElement(children as ReactElement<Record<string, unknown>>, {
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
  });

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
              data-side={pos?.side ?? side}
              data-align={align}
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

export interface TooltipTriggerProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Project the trigger props onto a single child element instead of wrapping
   * it in a `<span>` — use this when the child is already focusable (a button,
   * a link) so the tooltip doesn't add a redundant tab stop.
   */
  asChild?: boolean;
}

/**
 * Convenience: a tooltip-trigger wrapper for spans/text that don't expose a ref.
 * Focusable by default (`tabIndex={0}`) so keyboard users can reach the hint;
 * with `asChild` the child keeps its own tabIndex if it declares one.
 *
 * @example
 * ```tsx
 * <Tooltip content="Retries left">
 *   <TooltipTrigger asChild>
 *     <button className="btn btn-quiet">3</button>
 *   </TooltipTrigger>
 * </Tooltip>
 * ```
 */
export const TooltipTrigger = forwardRef<HTMLSpanElement, TooltipTriggerProps>(
  function TooltipTrigger({ asChild, children, ...props }, ref) {
    if (asChild) {
      return (
        <Slot ref={ref as React.Ref<HTMLElement>} tabIndex={0} {...props}>
          {children as ReactElement}
        </Slot>
      );
    }
    return (
      <span ref={ref} tabIndex={0} {...props}>
        {children}
      </span>
    );
  },
);
