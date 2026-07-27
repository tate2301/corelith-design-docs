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
export type TabsActivationMode = 'automatic' | 'manual';

interface TabsContextValue {
  value: string;
  setValue: (v: string) => void;
  baseId: string;
  variant: TabsVariant;
  orientation: TabsOrientation;
  activationMode: TabsActivationMode;
  /** Trigger that currently owns the roving tab stop under `manual`. */
  focusedValue: string | null;
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
  /**
   * `automatic` selects the tab as soon as arrow keys move focus onto it (the
   * historical behaviour). `manual` moves focus only — Enter or Space selects.
   * Prefer `manual` when switching a tab is expensive (a fetch, a route change).
   * @default 'automatic'
   */
  activationMode?: TabsActivationMode;
  children?: ReactNode;
}

/**
 * Tabs — ARIA-compliant tab control. Maps to `.utabs / .stabs / .ptabs / .vtabs`
 * (+ `.utab / .stab / .ptab / .vtab` on triggers, `.current` when selected) in
 * `styles/display.css`. `underline` mirrors the shipped `.under-tabs` look and
 * `segmented` mirrors `.seg-tabs`; `pill` and `vertical` are derived from them.
 *
 * Accessibility:
 *   - TabsList carries `role="tablist"`, each Trigger `role="tab"`, each Content
 *     `role="tabpanel"`. ARIA `aria-controls`/`aria-labelledby` wire them up.
 *   - Roving tabindex — only one trigger is in the tab order at a time.
 *   - Arrow keys cycle (Left/Right horizontally, Up/Down vertically), Home/End
 *     jump to first/last. `activationMode` decides whether moving focus also
 *     selects.
 *
 * @example
 * ```tsx
 * <Tabs defaultValue="overview" variant="underline" activationMode="manual">
 *   <TabsList aria-label="Account sections">
 *     <TabsTrigger value="overview">Overview</TabsTrigger>
 *     <TabsTrigger value="billing">Billing</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="overview">…</TabsContent>
 *   <TabsContent value="billing">…</TabsContent>
 * </Tabs>
 * ```
 */
export function Tabs({
  value: controlled,
  defaultValue,
  onValueChange,
  variant = 'underline',
  orientation = variant === 'vertical' ? 'vertical' : 'horizontal',
  activationMode = 'automatic',
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
  // Only consulted under `manual`; `automatic` keeps the tab stop on the
  // selected trigger exactly as before.
  const [focusedValue, setFocusedValue] = useState<string | null>(null);

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

  const moveTo = useCallback(
    (next: string) => {
      const el = triggers.current.get(next);
      if (!el) return;
      el.focus();
      if (activationMode === 'manual') setFocusedValue(next);
      else setValue(next);
    },
    [activationMode, setValue],
  );

  const focusByOffset = useCallback(
    (current: string, offset: number) => {
      const list = order.current;
      if (list.length === 0) return;
      const idx = list.indexOf(current);
      if (idx < 0) return;
      moveTo(list[(idx + offset + list.length) % list.length]);
    },
    [moveTo],
  );

  const focusEdge = useCallback(
    (which: 'first' | 'last') => {
      const list = order.current;
      if (list.length === 0) return;
      moveTo(which === 'first' ? list[0] : list[list.length - 1]);
    },
    [moveTo],
  );

  return (
    <TabsContext.Provider
      value={{
        value,
        setValue,
        baseId,
        variant,
        orientation,
        activationMode,
        focusedValue,
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
  // Roving tabindex. Under `manual` the tab stop follows arrow-key focus so a
  // focused-but-unselected trigger stays reachable; `automatic` is unchanged.
  const tabStop =
    ctx.activationMode === 'manual' && ctx.focusedValue !== null
      ? ctx.focusedValue === value
      : selected;
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
    } else if (ctx.activationMode === 'manual' && (e.key === 'Enter' || e.key === ' ')) {
      // Manual activation: focus alone never selects, so commit explicitly.
      // preventDefault also suppresses the synthesised click on native buttons
      // so `onValueChange` fires exactly once.
      e.preventDefault();
      ctx.setValue(value);
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
        tabIndex={tabStop ? 0 : -1}
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
      tabIndex={tabStop ? 0 : -1}
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
