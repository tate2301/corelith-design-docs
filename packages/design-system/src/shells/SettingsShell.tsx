import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';

export type SettingsItem = {
  /** Stable id used by `active` / `onActiveChange`. */
  id: string;
  /** Visible label. */
  label: ReactNode;
  /** Optional leading icon. */
  icon?: ReactNode;
  /** Optional href for routed navigation. When omitted, clicking calls onActiveChange. */
  href?: string;
};

export type SettingsSection = {
  /** Group label (small uppercase). Omit for an unlabeled top section. */
  label?: ReactNode;
  /** Items inside the group. */
  items: SettingsItem[];
};

export interface SettingsShellProps extends HTMLAttributes<HTMLDivElement> {
  /** Nested nav structure. */
  sections: SettingsSection[];
  /** The id of the active item. */
  active?: string;
  /** Called when the user clicks a sidebar item (id passed). */
  onActiveChange?: (id: string) => void;
  /** Width of the left nav rail in px. @default 200 */
  navWidth?: number;
}

interface SectionProps extends HTMLAttributes<HTMLDivElement> {
  label?: ReactNode;
}

function SettingsShellSection({ label, className, children, ...rest }: SectionProps) {
  return (
    <div className={cn('settings-shell-section', className)} {...rest}>
      {label ? (
        <div
          className="settings-shell-section-h"
          style={{
            font: '500 11px/1 var(--font-sans)',
            color: 'var(--text-subtle)',
            padding: '4px 10px 6px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </div>
      ) : null}
      {children}
    </div>
  );
}
SettingsShellSection.displayName = 'SettingsShell.Section';

interface ItemProps extends HTMLAttributes<HTMLAnchorElement> {
  active?: boolean;
  icon?: ReactNode;
  href?: string;
}

function SettingsShellItem({
  active,
  icon,
  href,
  className,
  children,
  style,
  ...rest
}: ItemProps) {
  return (
    <a
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn('settings-shell-item', active && 'is-active', className)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 10px',
        borderRadius: 7,
        font: '500 13px/1 var(--font-sans)',
        background: active ? 'var(--surface-muted)' : 'transparent',
        color: active ? 'var(--text-strong)' : 'var(--text-body)',
        textDecoration: 'none',
        cursor: 'pointer',
        ...style,
      }}
      {...rest}
    >
      {icon ? <span aria-hidden="true" style={{ display: 'inline-flex' }}>{icon}</span> : null}
      <span>{children}</span>
    </a>
  );
}
SettingsShellItem.displayName = 'SettingsShell.Item';

type SettingsShellComponent = ReturnType<
  typeof forwardRef<HTMLDivElement, SettingsShellProps>
> & {
  Section: typeof SettingsShellSection;
  Item: typeof SettingsShellItem;
};

/**
 * SettingsShell — a two-column nested settings layout (nav rail + content).
 *
 * Pass the nav structure via `sections`, or compose freely with the
 * `<SettingsShell.Section>` / `<SettingsShell.Item>` compound parts inside
 * children.
 *
 * @example
 * ```tsx
 * <SettingsShell
 *   active="general"
 *   onActiveChange={setActive}
 *   sections={[{
 *     label: 'Workspace',
 *     items: [
 *       { id: 'general', label: 'General' },
 *       { id: 'members', label: 'Members & roles' },
 *       { id: 'billing', label: 'Billing' },
 *     ],
 *   }]}
 * >
 *   <h2>General</h2>
 *   <SettingRow label="Workspace name">...</SettingRow>
 * </SettingsShell>
 * ```
 */
const SettingsShellBase = forwardRef<HTMLDivElement, SettingsShellProps>(function SettingsShell(
  {
    sections,
    active,
    onActiveChange,
    navWidth = 200,
    className,
    children,
    style,
    ...rest
  },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('settings-shell', className)}
      style={{
        display: 'grid',
        gridTemplateColumns: `${navWidth}px 1fr`,
        gap: 32,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 24,
        minHeight: 360,
        ...style,
      }}
      {...rest}
    >
      <aside className="settings-shell-nav" aria-label="Settings sections">
        {sections.map((sec, i) => (
          <SettingsShellSection key={i} label={sec.label}>
            {sec.items.map((it) => (
              <SettingsShellItem
                key={it.id}
                active={active === it.id}
                icon={it.icon}
                href={it.href}
                onClick={(e) => {
                  if (!it.href) e.preventDefault();
                  onActiveChange?.(it.id);
                }}
              >
                {it.label}
              </SettingsShellItem>
            ))}
          </SettingsShellSection>
        ))}
      </aside>
      <div className="settings-shell-body">{children}</div>
    </div>
  );
});

export const SettingsShell = SettingsShellBase as SettingsShellComponent;
SettingsShell.Section = SettingsShellSection;
SettingsShell.Item = SettingsShellItem;
