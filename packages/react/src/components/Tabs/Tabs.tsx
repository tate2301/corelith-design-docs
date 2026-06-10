import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cx } from '../../utils/cx';

interface TabsContextValue {
  value: string;
  onValueChange: (v: string) => void;
  baseId: string;
  registerTab: (value: string, el: HTMLButtonElement | null) => void;
  focusTab: (direction: 'next' | 'prev' | 'first' | 'last', from: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(name: string) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error(`${name} must be used inside <Tabs>.`);
  return ctx;
}

/**
 * Props for the `Tabs` compound root.
 *
 * Supports controlled (`value` + `onValueChange`) and uncontrolled
 * (`defaultValue`) usage. If neither is provided, the first tab's value is
 * selected on first render.
 */
export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  /** Selected tab value (controlled). */
  value?: string;
  /** Called with the new tab value when the user picks a tab. */
  onValueChange?: (value: string) => void;
  /** Initial selected tab value (uncontrolled). Ignored if `value` is set. */
  defaultValue?: string;
  children?: ReactNode;
}

/**
 * Tabs — keyboard-navigable WAI-ARIA tablist.
 *
 * Compound API: `<Tabs><Tabs.List/><Tabs.Tab/><Tabs.Panel/></Tabs>`.
 *
 * @example
 * ```tsx
 * <Tabs defaultValue="overview">
 *   <Tabs.List>
 *     <Tabs.Tab value="overview">Overview</Tabs.Tab>
 *     <Tabs.Tab value="activity">Activity</Tabs.Tab>
 *   </Tabs.List>
 *   <Tabs.Panel value="overview">…</Tabs.Panel>
 *   <Tabs.Panel value="activity">…</Tabs.Panel>
 * </Tabs>
 * ```
 */
const TabsRoot = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { value, onValueChange, defaultValue, className, children, ...rest },
  ref,
) {
  const baseId = useId();
  const [internal, setInternal] = useState<string | undefined>(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal ?? '';
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());

  const change = useCallback(
    (next: string) => {
      if (!isControlled) setInternal(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const registerTab = useCallback((v: string, el: HTMLButtonElement | null) => {
    if (el) tabRefs.current.set(v, el);
    else tabRefs.current.delete(v);
  }, []);

  const focusTab = useCallback(
    (direction: 'next' | 'prev' | 'first' | 'last', from: string) => {
      const entries = Array.from(tabRefs.current.entries());
      if (entries.length === 0) return;
      const idx = entries.findIndex(([v]) => v === from);
      let nextIdx = idx;
      if (direction === 'first') nextIdx = 0;
      else if (direction === 'last') nextIdx = entries.length - 1;
      else if (direction === 'next') nextIdx = idx < entries.length - 1 ? idx + 1 : 0;
      else if (direction === 'prev') nextIdx = idx > 0 ? idx - 1 : entries.length - 1;
      const target = entries[nextIdx];
      if (target) {
        const [v, el] = target;
        change(v);
        el.focus();
      }
    },
    [change],
  );

  return (
    <TabsContext.Provider
      value={{ value: current, onValueChange: change, baseId, registerTab, focusTab }}
    >
      <div ref={ref} className={cx('tabs-root', className)} {...rest}>{children}</div>
    </TabsContext.Provider>
  );
});

export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
  ariaLabel?: string;
}

function TabsList({ ariaLabel, className, children, ...rest }: TabsListProps) {
  return (
    <div role="tablist" aria-label={ariaLabel} className={cx('tabs', className)} {...rest}>
      {children}
    </div>
  );
}

export interface TabsTabProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  value: string;
}

function TabsTab({ value, className, children, onClick, onKeyDown, ...rest }: TabsTabProps) {
  const ctx = useTabsContext('<Tabs.Tab>');
  const selected = ctx.value === value;
  const tabId = `${ctx.baseId}-tab-${value}`;
  const panelId = `${ctx.baseId}-panel-${value}`;
  return (
    <button
      type="button"
      role="tab"
      id={tabId}
      aria-controls={panelId}
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      ref={(el) => ctx.registerTab(value, el)}
      className={cx(selected && 'active', className)}
      onClick={(e) => {
        ctx.onValueChange(value);
        onClick?.(e);
      }}
      onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          ctx.focusTab('next', value);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          ctx.focusTab('prev', value);
        } else if (e.key === 'Home') {
          e.preventDefault();
          ctx.focusTab('first', value);
        } else if (e.key === 'End') {
          e.preventDefault();
          ctx.focusTab('last', value);
        }
        onKeyDown?.(e);
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

export interface TabsPanelProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

function TabsPanel({ value, className, children, ...rest }: TabsPanelProps) {
  const ctx = useTabsContext('<Tabs.Panel>');
  const selected = ctx.value === value;
  const tabId = `${ctx.baseId}-tab-${value}`;
  const panelId = `${ctx.baseId}-panel-${value}`;
  if (!selected) return null;
  return (
    <div
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      className={cx('tabs-panel', className)}
      {...rest}
    >
      {children}
    </div>
  );
}

type TabsComponent = typeof TabsRoot & {
  List: typeof TabsList;
  Tab: typeof TabsTab;
  Panel: typeof TabsPanel;
};

export const Tabs = TabsRoot as TabsComponent;
Tabs.List = TabsList;
Tabs.Tab = TabsTab;
Tabs.Panel = TabsPanel;
