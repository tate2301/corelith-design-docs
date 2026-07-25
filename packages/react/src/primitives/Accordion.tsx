"use client";

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';

interface AccordionContextValue {
  isOpen: (value: string) => boolean;
  toggle: (value: string) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);
const useAccordion = () => {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error('Accordion primitive: Accordion.Item must be inside <Accordion>.');
  return ctx;
};

interface ItemContextValue {
  open: boolean;
  toggle: () => void;
  triggerId: string;
  contentId: string;
}

const ItemContext = createContext<ItemContextValue | null>(null);
const useItem = () => {
  const ctx = useContext(ItemContext);
  if (!ctx) throw new Error('Accordion primitive: Trigger/Content must be inside <Accordion.Item>.');
  return ctx;
};

export interface AccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Allow several items open at once. @default false (single open). */
  multiple?: boolean;
  /** Controlled open value(s). String for single, string[] for multiple. */
  value?: string | string[];
  /** Uncontrolled initial open value(s). */
  defaultValue?: string | string[];
  /** Fires when the open set changes. */
  onValueChange?: (value: string | string[]) => void;
  children?: ReactNode;
}

/**
 * Accordion — disclosure rows that reveal more content on click.
 * Maps to `.accordion` / `.acc-body` in components.css (composed onto
 * native `<details>`/`<summary>` for free keyboard + AT behaviour).
 *
 * Accessibility:
 *   - Each row is a native `<details>` disclosure: the `<summary>` Trigger is
 *     focusable, toggles on Enter/Space, and exposes expanded state to AT.
 *   - Trigger carries `aria-expanded` + `aria-controls`; Content is
 *     `role="region"` labelled by its Trigger.
 *   - In single mode, opening one row closes the others.
 */
export function Accordion({
  multiple = false,
  value: controlled,
  defaultValue,
  onValueChange,
  className,
  children,
  ...rest
}: AccordionProps) {
  const normalize = (v: string | string[] | undefined): string[] =>
    v === undefined ? [] : Array.isArray(v) ? v : [v];

  const [uncontrolled, setUncontrolled] = useState<string[]>(() => normalize(defaultValue));
  const isControlled = controlled !== undefined;
  const openValues = isControlled ? normalize(controlled) : uncontrolled;

  const isOpen = useCallback((value: string) => openValues.includes(value), [openValues]);

  const toggle = useCallback(
    (value: string) => {
      const currentlyOpen = openValues.includes(value);
      let next: string[];
      if (multiple) {
        next = currentlyOpen ? openValues.filter((v) => v !== value) : [...openValues, value];
      } else {
        next = currentlyOpen ? [] : [value];
      }
      if (!isControlled) setUncontrolled(next);
      onValueChange?.(multiple ? next : (next[0] ?? ''));
    },
    [openValues, multiple, isControlled, onValueChange],
  );

  return (
    <AccordionContext.Provider value={{ isOpen, toggle }}>
      <div className={cn('accordion', className)} {...rest}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export interface AccordionItemProps extends HTMLAttributes<HTMLDetailsElement> {
  /** Unique value identifying this row. */
  value: string;
  children?: ReactNode;
}

const AccordionItem = forwardRef<HTMLDetailsElement, AccordionItemProps>(function AccordionItem(
  { value, className, children, ...rest },
  ref,
) {
  const ctx = useAccordion();
  const baseId = useId();
  const open = ctx.isOpen(value);
  const itemCtx: ItemContextValue = {
    open,
    toggle: () => ctx.toggle(value),
    triggerId: `${baseId}-trigger`,
    contentId: `${baseId}-content`,
  };
  return (
    <ItemContext.Provider value={itemCtx}>
      <details
        ref={ref}
        open={open}
        className={cn(className)}
        // Prevent native toggle fighting controlled state; we drive it ourselves.
        onToggle={(e) => e.preventDefault()}
        {...rest}
      >
        {children}
      </details>
    </ItemContext.Provider>
  );
});

export interface AccordionTriggerProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

const AccordionTrigger = forwardRef<HTMLElement, AccordionTriggerProps>(function AccordionTrigger(
  { className, children, onClick, ...rest },
  ref,
) {
  const item = useItem();
  return (
    <summary
      ref={ref as React.Ref<HTMLElement>}
      id={item.triggerId}
      className={cn(className)}
      aria-expanded={item.open}
      aria-controls={item.contentId}
      onClick={(e) => {
        e.preventDefault();
        item.toggle();
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </summary>
  );
});

export interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(function AccordionContent(
  { className, children, ...rest },
  ref,
) {
  const item = useItem();
  return (
    <div
      ref={ref}
      id={item.contentId}
      role="region"
      aria-labelledby={item.triggerId}
      className={cn('acc-body', className)}
      {...rest}
    >
      {children}
    </div>
  );
});

(Accordion as unknown as Record<string, unknown>).Item = AccordionItem;
(Accordion as unknown as Record<string, unknown>).Trigger = AccordionTrigger;
(Accordion as unknown as Record<string, unknown>).Content = AccordionContent;

export type AccordionComponent = typeof Accordion & {
  Item: typeof AccordionItem;
  Trigger: typeof AccordionTrigger;
  Content: typeof AccordionContent;
};

export { AccordionItem, AccordionTrigger, AccordionContent };
