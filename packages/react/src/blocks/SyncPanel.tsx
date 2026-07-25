import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';

/** Maps to the canonical `.status-dot` modifier classes. */
export type SyncStatus = 'progress' | 'ok' | 'attention' | 'danger';

export type SyncItem = {
  /** Primary label ("R-19281"). */
  label: ReactNode;
  /** Optional secondary inline value ("$ 17.21"). */
  value?: ReactNode;
  /** Right-aligned last-attempt time. */
  time?: ReactNode;
  /** Status dot tone. @default 'progress' */
  status?: SyncStatus;
  /** When set, marks the row as failed: tints it danger and shows a detail + action. */
  failed?: boolean;
  /** Failure detail line (failed rows only). */
  detail?: ReactNode;
  /** Per-row action (Resolve). */
  action?: ReactNode;
};

export type SyncGroup = {
  /** Group heading ("Receipts · 5"). */
  label: ReactNode;
  /** When true, the group heading is tinted danger ("Failed · 1"). */
  danger?: boolean;
  /** Rows in the group. */
  items: SyncItem[];
};

export interface SyncPanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Panel heading ("Sync queue · 7 pending"). */
  title: ReactNode;
  /** Header action (Retry all). */
  action?: ReactNode;
  /** The grouped queue. */
  groups: SyncGroup[];
}

const DOT_CLASS: Record<SyncStatus, string> = {
  progress: 'progress',
  ok: 'ok',
  attention: 'attention',
  danger: 'danger',
};

function SyncRow({ item }: { item: SyncItem }) {
  if (item.failed) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 12,
          padding: '8px 18px',
          alignItems: 'center',
          background: 'var(--tone-danger-bg)',
        }}
      >
        <div>
          <span style={{ font: '500 14px/1.3 var(--font-sans)', color: 'var(--tone-danger)' }}>{item.label}</span>
          {item.detail != null ? (
            <div style={{ font: '11px/1.3 var(--font-sans)', color: 'var(--tone-danger)', opacity: 0.85, marginTop: 2 }}>
              {item.detail}
            </div>
          ) : null}
        </div>
        {item.action ? <div>{item.action}</div> : null}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto auto',
        gap: 12,
        padding: '8px 18px',
        alignItems: 'center',
      }}
    >
      <div>
        <span style={{ font: '500 14px/1.3 var(--font-sans)', color: 'var(--text-strong)' }}>{item.label}</span>
        {item.value != null ? (
          <span style={{ font: '12px/1.3 var(--font-mono)', color: 'var(--text-muted)', marginLeft: 6 }}>{item.value}</span>
        ) : null}
      </div>
      {item.time != null ? (
        <span style={{ font: '11px/1 var(--font-mono)', color: 'var(--text-subtle)' }}>{item.time}</span>
      ) : (
        <span />
      )}
      <span className={cn('status-dot', DOT_CLASS[item.status ?? 'progress'])} aria-hidden="true" />
    </div>
  );
}

/**
 * SyncPanel — a sync-queue status panel. Items grouped by entity; each row
 * carries a status dot and last-attempt time. Failures surface in a danger
 * tone with a resolve action. Maps to `system/b-sync-panel.html`.
 *
 * @example
 * ```tsx
 * <SyncPanel
 *   title="Sync queue · 7 pending"
 *   action={<Button variant="secondary" size="sm">Retry all</Button>}
 *   groups={[
 *     { label: 'Receipts · 5', items: [
 *       { label: 'R-19281', value: '$ 17.21', time: '14:32', status: 'progress' },
 *     ]},
 *     { label: 'Failed · 1', danger: true, items: [
 *       { label: 'Inventory adjustment', failed: true, detail: 'Conflict — server has newer version', action: <Button variant="secondary" size="sm">Resolve</Button> },
 *     ]},
 *   ]}
 * />
 * ```
 */
export const SyncPanel = forwardRef<HTMLDivElement, SyncPanelProps>(function SyncPanel(
  { title, action, groups, className, style, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('sync-panel', className)}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        ...style,
      }}
      {...rest}
    >
      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ font: '600 15px/1.3 var(--font-sans)', color: 'var(--text-strong)', margin: 0, flex: 1 }}>{title}</h2>
        {action}
      </div>
      <div style={{ padding: '6px 0' }}>
        {groups.map((g, gi) => (
          <div key={gi}>
            <div
              style={{
                font: '500 11px/1 var(--font-sans)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: g.danger ? 'var(--tone-danger)' : 'var(--text-subtle)',
                padding: gi === 0 ? '10px 18px 6px' : '14px 18px 6px',
              }}
            >
              {g.label}
            </div>
            {g.items.map((it, ii) => (
              <SyncRow key={ii} item={it} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
});
