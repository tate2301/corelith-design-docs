import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';

export type ConflictField = {
  /** Field label ("On-hand"). */
  label: ReactNode;
  /** Field value — mono numbers read best. */
  value: ReactNode;
};

export type ConflictSide = {
  /** Column heading ("Your version (local)"). */
  title: ReactNode;
  /** When true, the heading is tinted brand to mark the local/preferred side. */
  highlight?: boolean;
  /** The differing fields shown in this column. */
  fields: ConflictField[];
};

export interface ConflictDialogProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Small tonal pill above the title ("Sync conflict"). */
  eyebrow?: ReactNode;
  /** Record title ("Inventory adjustment SKU-0833"). */
  title: ReactNode;
  /** One-sentence explanation of the conflict. */
  description?: ReactNode;
  /** The "mine" side (left). */
  mine: ConflictSide;
  /** The "theirs" side (right). */
  theirs: ConflictSide;
  /** Footer action buttons (Cancel · Keep server · Keep mine). */
  actions?: ReactNode;
}

function ConflictColumn({ side, rightBorder }: { side: ConflictSide; rightBorder: boolean }) {
  return (
    <div style={{ padding: '16px 20px', borderRight: rightBorder ? '1px solid var(--border)' : undefined }}>
      <div
        style={{
          font: '500 12px/1 var(--font-sans)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: side.highlight ? 'var(--brand-strong)' : 'var(--text-muted)',
          marginBottom: 10,
        }}
      >
        {side.title}
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        {side.fields.map((f, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '6px 0',
              borderBottom: i < side.fields.length - 1 ? '1px solid var(--border-subtle)' : undefined,
              font: 'var(--type-body-sm)',
            }}
          >
            <span style={{ color: 'var(--text-muted)' }}>{f.label}</span>
            <span style={{ color: 'var(--text-strong)' }}>{f.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * ConflictDialog — a merge-conflict resolution card. Shows the local ("mine")
 * and server ("theirs") versions side by side so the operator picks a winner.
 * Maps to the modal in `system/b-conflict-dialog.html`.
 *
 * @example
 * ```tsx
 * <ConflictDialog
 *   eyebrow="● Sync conflict"
 *   title="Inventory adjustment SKU-0833"
 *   description="The server has a newer version. Pick which to keep."
 *   mine={{ title: 'Your version (local)', highlight: true, fields: [{ label: 'On-hand', value: '12' }] }}
 *   theirs={{ title: 'Server version', fields: [{ label: 'On-hand', value: '14' }] }}
 *   actions={<>
 *     <Button variant="ghost">Cancel</Button>
 *     <span style={{ flex: 1 }} />
 *     <Button variant="secondary">Keep server</Button>
 *     <Button variant="primary">Keep my version</Button>
 *   </>}
 * />
 * ```
 */
export const ConflictDialog = forwardRef<HTMLDivElement, ConflictDialogProps>(function ConflictDialog(
  { eyebrow, title, description, mine, theirs, actions, className, style, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      className={cn('conflict-dialog', className)}
      style={{
        background: 'var(--surface)',
        borderRadius: 14,
        boxShadow: 'var(--shadow-modal)',
        overflow: 'clip',
        ...style,
      }}
      {...rest}
    >
      <div style={{ padding: '22px 24px 14px' }}>
        {eyebrow ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 10px',
              background: 'var(--tone-warn-bg)',
              color: 'var(--tone-warn)',
              borderRadius: 9999,
              font: '500 11px/1 var(--font-sans)',
              marginBottom: 12,
            }}
          >
            {eyebrow}
          </div>
        ) : null}
        <h2 style={{ font: '600 18px/1.3 var(--font-sans)', color: 'var(--text-strong)', margin: '0 0 8px' }}>
          {title}
        </h2>
        {description ? (
          <p style={{ font: 'var(--type-body)', color: 'var(--text-muted)', margin: 0 }}>{description}</p>
        ) : null}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          borderTop: '1px solid var(--border)',
        }}
      >
        <ConflictColumn side={mine} rightBorder />
        <ConflictColumn side={theirs} rightBorder={false} />
      </div>
      {actions ? (
        <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
          {actions}
        </div>
      ) : null}
    </div>
  );
});
