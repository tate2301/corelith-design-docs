import { useState, type ReactNode } from 'react';
import { cn } from '../utils/cn';
import { Tabs, TabsList, TabsTrigger, TabsContent, type TabsVariant } from '../primitives/Tabs';
import { DetailView, type DetailViewHero, type DetailViewFact } from './DetailView';

export interface DetailTab {
  /** Stable value (used by the tab control and as React key). */
  value: string;
  /** Tab label. */
  label: ReactNode;
  /** Panel content. */
  content: ReactNode;
}

export interface DetailTabsProps {
  /** Hero band — same shape as DetailView's hero. */
  hero?: DetailViewHero;
  /** Optional facts grid rendered between the hero and the tabs. */
  facts?: DetailViewFact[];
  /** Heading for the facts card. @default 'Details' */
  factsTitle?: ReactNode;
  /** Tabbed sections. */
  tabs: DetailTab[];
  /** Controlled active tab value. */
  value?: string;
  /** Uncontrolled initial tab. Defaults to the first tab. */
  defaultValue?: string;
  /** Fires when the active tab changes. */
  onValueChange?: (value: string) => void;
  /** Tab visual style. @default 'underline' */
  tabsVariant?: TabsVariant;
  /** Right-rail content. */
  aside?: ReactNode;
  /** Extra className on the root. */
  className?: string;
}

/**
 * DetailTabs — a DetailView whose body is split into tabbed sections. Composes
 * the `DetailView` hero/facts assembly with the ARIA `Tabs` primitive so the
 * heavy sections (Overview / Transactions / Documents …) load behind tabs.
 *
 * Controlled or uncontrolled via `value` / `defaultValue`.
 *
 * @example
 * ```tsx
 * <DetailTabs
 *   hero={{ eyebrow: 'Supplier · SUP-01', title: 'Mukamba Group', mark: 'MG' }}
 *   facts={[{ label: 'Outstanding', value: 'US$48,200', mono: true }]}
 *   tabs={[
 *     { value: 'overview', label: 'Overview', content: <Overview /> },
 *     { value: 'invoices', label: 'Invoices', content: <InvoiceTable /> },
 *     { value: 'documents', label: 'Documents', content: <DocList /> },
 *   ]}
 * />
 * ```
 */
export function DetailTabs({
  hero,
  facts,
  factsTitle,
  tabs,
  value,
  defaultValue,
  onValueChange,
  tabsVariant = 'underline',
  aside,
  className,
}: DetailTabsProps) {
  const initial = defaultValue ?? tabs[0]?.value ?? '';
  const [internal, setInternal] = useState(initial);
  const isControlled = value !== undefined;
  const active = isControlled ? value : internal;

  const handleChange = (v: string) => {
    if (!isControlled) setInternal(v);
    onValueChange?.(v);
  };

  return (
    <DetailView hero={hero} facts={facts} factsTitle={factsTitle} aside={aside} className={cn('detail-tabs', className)}>
      <Tabs value={active} onValueChange={handleChange} variant={tabsVariant}>
        <TabsList aria-label="Record sections" style={{ marginBottom: 16 }}>
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((t) => (
          <TabsContent key={t.value} value={t.value}>
            {t.content}
          </TabsContent>
        ))}
      </Tabs>
    </DetailView>
  );
}
