"use client";

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';
import { Slot } from '../utils/Slot';

interface CollapsibleContextValue {
  open: boolean;
  disabled: boolean;
  toggle: () => void;
  triggerId: string;
  contentId: string;
}

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);
const useCollapsible = () => {
  const ctx = useContext(CollapsibleContext);
  if (!ctx) {
    throw new Error(
      'Collapsible primitive: CollapsibleTrigger/CollapsibleContent must be inside <Collapsible>.',
    );
  }
  return ctx;
};

const stateAttr = (open: boolean) => (open ? 'open' : 'closed');

export interface CollapsibleProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Controlled open state. */
  open?: boolean;
  /** Uncontrolled initial open state. @default false */
  defaultOpen?: boolean;
  /** Fires whenever the open state changes, controlled or not. */
  onOpenChange?: (open: boolean) => void;
  /** Block toggling and mark the trigger disabled. @default false */
  disabled?: boolean;
  children?: ReactNode;
}

/**
 * Collapsible — a single show/hide disclosure. Deliberately *not* built on
 * `Accordion`: that requires a `value` and a surrounding accordion context,
 * whereas a Collapsible is standalone (a "Show advanced options" toggle, a
 * filter drawer, an expandable table row).
 *
 * All three parts emit `data-state="open" | "closed"` so callers can drive
 * chevron rotation and transitions from CSS.
 *
 * Accessibility:
 *   - The trigger is a real `<button>` with `aria-expanded` and `aria-controls`;
 *     Enter/Space toggle natively.
 *   - The content region is labelled by the trigger and is `hidden` while
 *     closed, so collapsed content stays out of the a11y tree and tab order.
 *
 * @example
 * ```tsx
 * <Collapsible defaultOpen>
 *   <CollapsibleTrigger>Advanced options</CollapsibleTrigger>
 *   <CollapsibleContent>
 *     <Field>…</Field>
 *   </CollapsibleContent>
 * </Collapsible>
 * ```
 */
export const Collapsible = forwardRef<HTMLDivElement, CollapsibleProps>(function Collapsible(
  { open: controlled, defaultOpen = false, onOpenChange, disabled = false, className, children, ...rest },
  ref,
) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const isControlled = controlled !== undefined;
  const open = isControlled ? controlled! : uncontrolled;
  const baseId = useId();

  const toggle = useCallback(() => {
    if (disabled) return;
    const next = !open;
    if (!isControlled) setUncontrolled(next);
    onOpenChange?.(next);
  }, [disabled, open, isControlled, onOpenChange]);

  return (
    <CollapsibleContext.Provider
      value={{
        open,
        disabled,
        toggle,
        triggerId: `${baseId}-trigger`,
        contentId: `${baseId}-content`,
      }}
    >
      <div
        ref={ref}
        className={cn('collapsible', className)}
        data-slot="collapsible"
        data-state={stateAttr(open)}
        data-disabled={disabled ? '' : undefined}
        {...rest}
      >
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
});

export interface CollapsibleTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Render the trigger behaviour onto the supplied child, Radix Slot-style. */
  asChild?: boolean;
}

/** CollapsibleTrigger — toggles the disclosure. Renders a `<button>` by default. */
export const CollapsibleTrigger = forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  function CollapsibleTrigger({ asChild, className, children, onClick, disabled, ...rest }, ref) {
    const ctx = useCollapsible();
    const isDisabled = disabled ?? ctx.disabled;

    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
      onClick?.(e as React.MouseEvent<HTMLButtonElement>);
      if (e.defaultPrevented || isDisabled) return;
      ctx.toggle();
    };

    const props = {
      id: ctx.triggerId,
      'aria-expanded': ctx.open,
      'aria-controls': ctx.contentId,
      className: cn('collapsible-trigger', className),
      'data-slot': 'collapsible-trigger',
      'data-state': stateAttr(ctx.open),
      'data-disabled': isDisabled ? '' : undefined,
      onClick: handleClick,
      ...rest,
    };

    if (asChild) {
      return (
        <Slot ref={ref as React.Ref<HTMLElement>} {...props} aria-disabled={isDisabled || undefined}>
          {children as React.ReactElement}
        </Slot>
      );
    }

    return (
      <button ref={ref} type="button" disabled={isDisabled} {...props}>
        {children}
      </button>
    );
  },
);

export interface CollapsibleContentProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Keep the content mounted while closed (it stays `hidden` and
   * `data-state="closed"`). Use for CSS exit transitions or so in-page search
   * can still find the text. @default false
   */
  forceMount?: boolean;
  children?: ReactNode;
}

/** CollapsibleContent — the region revealed by the trigger. */
export const CollapsibleContent = forwardRef<HTMLDivElement, CollapsibleContentProps>(
  function CollapsibleContent({ forceMount, className, children, ...rest }, ref) {
    const ctx = useCollapsible();
    if (!ctx.open && !forceMount) return null;

    return (
      <div
        ref={ref}
        id={ctx.contentId}
        role="region"
        aria-labelledby={ctx.triggerId}
        hidden={!ctx.open}
        className={cn('collapsible-content', className)}
        data-slot="collapsible-content"
        data-state={stateAttr(ctx.open)}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
