import {
  createContext,
  forwardRef,
  useContext,
  useId,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../utils/cx';

interface TabsContextValue {
  value: string;
  onValueChange: (v: string) => void;
  baseId: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(name: string) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error(`${name} must be used inside <Tabs>.`);
  return ctx;
}

export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  onValueChange: (value: string) => void;
  children?: ReactNode;
}

const TabsRoot = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { value, onValueChange, className, children, ...rest },
  ref,
) {
  const baseId = useId();
  return (
    <TabsContext.Provider value={{ value, onValueChange, baseId }}>
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

function TabsTab({ value, className, children, onClick, ...rest }: TabsTabProps) {
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
      className={cx(selected && 'active', className)}
      onClick={(e) => {
        ctx.onValueChange(value);
        onClick?.(e);
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
