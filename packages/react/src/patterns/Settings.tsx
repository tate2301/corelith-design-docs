"use client";

import { useState, type ReactNode } from 'react';
import { cn } from '../utils/cn';
import { SettingsShell, type SettingsSection } from '../shells/SettingsShell';

export interface SettingsRowProps {
  /** Field label. */
  label: ReactNode;
  /** Helper text under the label. */
  description?: ReactNode;
  /** The control (input, switch, select…). */
  children: ReactNode;
  /** Extra className. */
  className?: string;
}

/**
 * SettingRow — a label/description column beside a control. Use inside a
 * `Settings` group or any form-shell. Layout: text left, control right.
 */
export function SettingRow({ label, description, children, className }: SettingsRowProps) {
  return (
    <div
      className={cn('setting-row', className)}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr minmax(220px, 40%)',
        gap: 24,
        alignItems: 'start',
        padding: '16px 0',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div>
        <div style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{label}</div>
        {description ? (
          <div style={{ font: 'var(--type-body-sm)', color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5 }}>
            {description}
          </div>
        ) : null}
      </div>
      <div style={{ justifySelf: 'stretch' }}>{children}</div>
    </div>
  );
}

export interface SettingsPanel {
  /** Matches a `SettingsSection` item id. */
  id: string;
  /** Panel heading. */
  title: ReactNode;
  /** Optional sub-heading. */
  description?: ReactNode;
  /** Panel body — typically `SettingRow`s. */
  content: ReactNode;
}

export interface SettingsProps {
  /** Left-nav structure (groups + items) passed to SettingsShell. */
  sections: SettingsSection[];
  /** One panel per nav item id. Only the active panel renders. */
  panels: SettingsPanel[];
  /** Controlled active item id. */
  active?: string;
  /** Uncontrolled initial active id. Defaults to the first item. */
  defaultActive?: string;
  /** Fires when the active item changes. */
  onActiveChange?: (id: string) => void;
  /** Extra className on the shell. */
  className?: string;
}

/**
 * Settings — a settings-page assembly composing `SettingsShell` (nav rail) with
 * prop-driven panels. Each nav item maps to a panel by id; switching the nav
 * swaps the body. Pairs with the `SettingRow` helper for label/control rows.
 *
 * Controlled (`active`) or uncontrolled (`defaultActive`).
 *
 * @example
 * ```tsx
 * <Settings
 *   sections={[{ label: 'Workspace', items: [
 *     { id: 'general', label: 'General' },
 *     { id: 'members', label: 'Members & roles' },
 *     { id: 'billing', label: 'Billing' },
 *   ]}]}
 *   panels={[
 *     { id: 'general', title: 'General', content: (
 *       <>
 *         <SettingRow label="Workspace name" description="Shown on invoices.">
 *           <Input defaultValue="Mukamba Group" />
 *         </SettingRow>
 *         <SettingRow label="Default currency"><Select defaultValue="USD"><option>USD</option><option>ZWL</option></Select></SettingRow>
 *       </>
 *     )},
 *     { id: 'members', title: 'Members & roles', content: <MembersTable /> },
 *     { id: 'billing', title: 'Billing', content: <BillingPanel /> },
 *   ]}
 * />
 * ```
 */
export function Settings({
  sections,
  panels,
  active,
  defaultActive,
  onActiveChange,
  className,
}: SettingsProps) {
  const firstId = sections[0]?.items[0]?.id ?? panels[0]?.id ?? '';
  const [internal, setInternal] = useState(defaultActive ?? firstId);
  const isControlled = active !== undefined;
  const current = isControlled ? active : internal;

  const handleChange = (id: string) => {
    if (!isControlled) setInternal(id);
    onActiveChange?.(id);
  };

  const panel = panels.find((p) => p.id === current);

  return (
    <SettingsShell sections={sections} active={current} onActiveChange={handleChange} className={className}>
      {panel ? (
        <div className="settings-panel">
          <header style={{ marginBottom: 8 }}>
            <h2 style={{ font: 'var(--type-section-title)', color: 'var(--text-strong)', margin: 0 }}>{panel.title}</h2>
            {panel.description ? (
              <p style={{ font: 'var(--type-body-sm)', color: 'var(--text-muted)', marginTop: 4 }}>{panel.description}</p>
            ) : null}
          </header>
          <div>{panel.content}</div>
        </div>
      ) : null}
    </SettingsShell>
  );
}
