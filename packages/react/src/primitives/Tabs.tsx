"use client";

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';
import { Slot } from '../utils/Slot';

export type TabsVariant = 'underline' | 'segmented' | 'pill' | 'vertical';
export type TabsOrientation = 'horizontal' | 'vertical';

interface TabsContextValue {
  value: string;
  setValue: (v: string) => void;
  baseId: string;
  variant: TabsVariant;
  orientation: TabsOrientation;
  registerTrigger: (value: string, el: HTMLButtonElement | null) => void;
  focusByOffset: (currentValue: string, offset: number) => void;
  focusEdge: (which: 'first' | 'last') => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);
const useTabs = () => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs primitive: TabsTrigger/TabsContent must be inside <Tabs>.');
  return ctx;
};

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Controlled active tab value. */
  value?: string;
  /** Uncontrolled initial active tab. */
  defaultValue?: string;
  /** Fires when active tab changes (controlled or uncontrolled). */
  onValueChange?: (value: string) => void;
  /** Visual style of TabsList. @default 'underline' */
  variant?: TabsVariant;
  /** Tablist orientation. Vertical = up/down arrow nav. @default 'horizontal' */
  orientation?: TabsOrientation;
  children?: ReactNode;
}

/**
 * Tabs — ARIA-compliant tab control. Maps to `.utabs / .stabs / .ptabs / .vtabs`
 * in the docs (the doc CSS lives in `system/p-tabs.html`; we compose those
 * class names where present, otherwise the segmented/pill stand-ins fall back
 * to inline styling).
 *
 * Accessibility:
 *   - TabsList carries `role="tablist"`, each Trigger `role="tab"`, each Content
 *     `role="tabpanel"`. ARIA `aria-controls`/`aria-labelledby` wire them up.
 *   - Roving tabindex — only the active trigger is focusable.
 *   - Arrow keys cycle (Left/Right horizontally, Up/Down vertically), Home/End
 *     jump to first/last. Activation is automatic on focus (most common pattern).
 */
export function Tabs({
  value: controlled,
  defaultValue,
  onValueChange,
  variant = 'underline',
  orientation = variant === 'vertical' ? 'vertical' : 'horizontal',
  className,
  children,
  ...rest
}: TabsProps) {
  const [uncontrolled, setUncontrolled] = useState<string>(defaultValue ?? '');
  const isControlled = controlled !== undefined;
  const value = isControlled ? controlled! : uncontrolled;
  const baseId = useId();
  const triggers = useRef(new Map<string, HTMLButtonElement>());
  const order = useRef<string[]>([]);

  const setValue = useCallback(
    (v: string) => {
      if (!isControlled) setUncontrolled(v);
      onValueChange?.(v);
    },
    [isControlled, onValueChange],
  );

  const registerTrigger = useCallback((v: string, el: HTMLButtonElement | null) => {
    if (el) {
      triggers.current.set(v, el);
      if (!order.current.includes(v)) order.current.push(v);
    } else {
      triggers.current.delete(v);
      order.current = order.current.filter((x) => x !== v);
    }
  }, []);

  const focusByOffset = useCallback(
    (current: string, offset: number) => {
      const list = order.current;
      if (list.length === 0) return;
      const idx = list.indexOf(current);
      if (idx < 0) return;
      const next = list[(idx + offset + list.length) % list.length];
      const el = triggers.current.get(next);
      if (el) {
        el.focus();
        setValue(next);
      }
    },
    [setValue],
  );

  const focusEdge = useCallback(
    (which: 'first' | 'last') => {
      const list = order.current;
      if (list.length === 0) return;
      const v = which === 'first' ? list[0] : list[list.length - 1];
      const el = triggers.current.get(v);
      if (el) {
        el.focus();
        setValue(v);
      }
    },
    [setValue],
  );

  return (
    <TabsContext.Provider
      value={{
        value,
        setValue,
        baseId,
        variant,
        orientation,
        registerTrigger,
        focusByOffset,
        focusEdge,
      }}
    >
      <div className={cn(className)} {...rest}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
  /** Accessible label, e.g. "Settings sections". */
  'aria-label'?: string;
}

const VARIANT_CLASS: Record<TabsVariant, string> = {
  underline: 'utabs',
  segmented: 'stabs',
  pill: 'ptabs',
  vertical: 'vtabs',
};

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(function TabsList(
  { className, children, ...rest },
  ref,
) {
  const { variant, orientation } = useTabs();
  return (
    <div
      ref={ref}
      role="tablist"
      aria-orientation={orientation}
      className={cn(VARIANT_CLASS[variant], className)}
      {...rest}
    >
      {children}
    </div>
  );
});

export interface TabsTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  /** Render the tab trigger styles onto the supplied child, Radix Slot-style. */
  asChild?: boolean;
}

const TRIGGER_CLASS: Record<TabsVariant, string> = {
  underline: 'utab',
  segmented: 'stab',
  pill: 'ptab',
  vertical: 'vtab',
};

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(function TabsTrigger(
  { value, asChild, className, children, onClick, onKeyDown, ...rest },
  ref,
) {
  const ctx = useTabs();
  const selected = ctx.value === value;
  const id = `${ctx.baseId}-trigger-${value}`;
  const panelId = `${ctx.baseId}-panel-${value}`;
  const setRef = (node: HTMLButtonElement | null) => {
    ctx.registerTrigger(value, node);
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
  };
  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    ctx.setValue(value);
    onClick?.(e as React.MouseEvent<HTMLButtonElement>);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    const horizontal = ctx.orientation === 'horizontal';
    const next = horizontal ? 'ArrowRight' : 'ArrowDown';
    const prev = horizontal ? 'ArrowLeft' : 'ArrowUp';
    if (e.key === next) {
      e.preventDefault();
      ctx.focusByOffset(value, 1);
    } else if (e.key === prev) {
      e.preventDefault();
      ctx.focusByOffset(value, -1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      ctx.focusEdge('first');
    } else if (e.key === 'End') {
      e.preventDefault();
      ctx.focusEdge('last');
    }
    onKeyDown?.(e as React.KeyboardEvent<HTMLButtonElement>);
  };

  if (asChild) {
    return (
      <Slot
        ref={setRef as React.Ref<HTMLElement>}
        id={id}
        role="tab"
        aria-selected={selected}
        aria-controls={panelId}
        tabIndex={selected ? 0 : -1}
        className={cn(TRIGGER_CLASS[ctx.variant], selected && 'current', className)}
        data-slot="tabs-trigger"
        data-state={selected ? 'active' : 'inactive'}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...(rest as React.HTMLAttributes<HTMLElement>)}
      >
        {children as React.ReactElement}
      </Slot>
    );
  }

  return (
    <button
      ref={setRef}
      id={id}
      type="button"
      role="tab"
      aria-selected={selected}
      aria-controls={panelId}
      tabIndex={selected ? 0 : -1}
      className={cn(TRIGGER_CLASS[ctx.variant], selected && 'current', className)}
      data-slot="tabs-trigger"
      data-state={selected ? 'active' : 'inactive'}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      {children}
    </button>
  );
});

export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  /** Keep mounted but hidden when inactive. @default false */
  forceMount?: boolean;
}

export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(function TabsContent(
  { value, forceMount, className, children, ...rest },
  ref,
) {
  const ctx = useTabs();
  const active = ctx.value === value;
  if (!active && !forceMount) return null;
  const id = `${ctx.baseId}-panel-${value}`;
  const triggerId = `${ctx.baseId}-trigger-${value}`;
  return (
    <div
      ref={ref}
      id={id}
      role="tabpanel"
      aria-labelledby={triggerId}
      hidden={!active}
      tabIndex={0}
      className={cn(className)}
      {...rest}
    >
      {children}
    </div>
  );
});
