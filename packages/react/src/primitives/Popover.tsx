"use client";

import {
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../utils/cn';
import { usePosition, type Align, type Side } from '../utils/usePosition';

interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  anchorRef: React.MutableRefObject<HTMLElement | null>;
  contentId: string;
  triggerId: string;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);
const usePopover = () => {
  const ctx = useContext(PopoverContext);
  if (!ctx) throw new Error('Popover primitive: child must be inside <Popover>.');
  return ctx;
};

export interface PopoverProps {
  /** Controlled open state. */
  open?: boolean;
  /** Open state change handler. */
  onOpenChange?: (open: boolean) => void;
  /** Uncontrolled initial open. @default false */
  defaultOpen?: boolean;
  /** Trigger + Content children. */
  children?: ReactNode;
}

/**
 * Popover — click-anchored floating container. Maps to `.popover` in
 * components.css.
 *
 * Content is portalled to `document.body` and positioned with simple anchor
 * math (auto-flips on the requested side). Closes on outside click or Escape.
 *
 * Accessibility:
 *   - Trigger gets `aria-haspopup="dialog"` and `aria-expanded`.
 *   - Content carries `role="dialog"` with `aria-labelledby` referencing the
 *     trigger when no explicit label is set.
 *   - Focus is moved to the content on open; Escape returns focus to trigger.
 *
 * Limitations: not a full focus-trap (use AlertDialog for blocking flows).
 */
export function Popover({ open: openProp, defaultOpen = false, onOpenChange, children }: PopoverProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp! : uncontrolled;
  const anchorRef = useRef<HTMLElement | null>(null);
  const baseId = useId();

  const setOpen = useCallback(
    (v: boolean) => {
      if (!isControlled) setUncontrolled(v);
      onOpenChange?.(v);
    },
    [isControlled, onOpenChange],
  );

  const ctx = useMemo<PopoverContextValue>(
    () => ({
      open,
      setOpen,
      anchorRef,
      contentId: `${baseId}-content`,
      triggerId: `${baseId}-trigger`,
    }),
    [open, setOpen, baseId],
  );

  return <PopoverContext.Provider value={ctx}>{children}</PopoverContext.Provider>;
}

export interface PopoverTriggerProps {
  /** Render the popover trigger as the supplied child (must accept ref). */
  asChild?: boolean;
  children: ReactElement;
}

export const PopoverTrigger = forwardRef<HTMLElement, PopoverTriggerProps>(function PopoverTrigger(
  { children },
  ref,
) {
  const ctx = usePopover();
  if (!isValidElement(children)) {
    throw new Error('PopoverTrigger: children must be a single React element.');
  }
  const childProps = children.props as Record<string, unknown> & {
    onClick?: (e: React.MouseEvent) => void;
    ref?: React.Ref<HTMLElement>;
  };

  const setRefs = (node: HTMLElement | null) => {
    ctx.anchorRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref && typeof ref === 'object')
      (ref as React.MutableRefObject<HTMLElement | null>).current = node;
    const r = childProps.ref;
    if (typeof r === 'function') r(node);
    else if (r && typeof r === 'object') (r as React.MutableRefObject<HTMLElement | null>).current = node;
  };

  return cloneElement(children as ReactElement<Record<string, unknown>>, {
    ref: setRefs,
    id: ctx.triggerId,
    'aria-haspopup': 'dialog',
    'aria-expanded': ctx.open,
    'aria-controls': ctx.open ? ctx.contentId : undefined,
    'data-slot': 'popover-trigger',
    'data-state': ctx.open ? 'open' : 'closed',
    onClick: (e: React.MouseEvent) => {
      childProps.onClick?.(e);
      ctx.setOpen(!ctx.open);
    },
  });
});

export interface PopoverContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Preferred placement; auto-flips. @default 'bottom' */
  side?: Side;
  /** Alignment along the cross-axis. @default 'center' */
  align?: Align;
  /** Gap between anchor and content. @default 8 */
  sideOffset?: number;
  /** Cross-axis offset. @default 0 */
  alignOffset?: number;
  /** Skip rendering of `.popover` class (for menu/hover-card reuse). */
  unstyled?: boolean;
}

export const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(function PopoverContent(
  { side = 'bottom', align = 'center', sideOffset = 8, alignOffset = 0, unstyled, className, children, style, onKeyDown, ...rest },
  ref,
) {
  const ctx = usePopover();
  const contentRef = useRef<HTMLDivElement | null>(null);
  const pos = usePosition(ctx.anchorRef, contentRef, ctx.open, { side, align, sideOffset, alignOffset });

  const setRefs = (node: HTMLDivElement | null) => {
    contentRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
  };

  // Outside-click + Escape handling.
  useEffect(() => {
    if (!ctx.open) return;
    const onDocPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (contentRef.current?.contains(t)) return;
      if (ctx.anchorRef.current?.contains(t)) return;
      ctx.setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        ctx.setOpen(false);
        ctx.anchorRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onDocPointer, true);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDocPointer, true);
      document.removeEventListener('keydown', onKey);
    };
  }, [ctx]);

  // Focus on open.
  useEffect(() => {
    if (ctx.open) contentRef.current?.focus();
  }, [ctx.open]);

  if (!ctx.open) return null;
  const portalTarget = typeof document !== 'undefined' ? document.body : null;
  if (!portalTarget) return null;

  return createPortal(
    <div
      ref={setRefs}
      id={ctx.contentId}
      role="dialog"
      tabIndex={-1}
      aria-labelledby={rest['aria-labelledby'] ?? ctx.triggerId}
      className={cn(!unstyled && 'popover', className)}
      style={{
        position: 'absolute',
        top: pos?.top ?? -9999,
        left: pos?.left ?? -9999,
        zIndex: 1000,
        ...style,
      }}
      onKeyDown={onKeyDown}
      {...rest}
    >
      {children}
    </div>,
    portalTarget,
  );
});
