import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';

export interface ExportBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Optional leading icon, rendered in a rounded tile. */
  icon?: ReactNode;
  /** Primary line — usually the file name ("Receipts-jun-2026.csv ready"). */
  title: ReactNode;
  /** Mono sub-line — row count · timestamp · size. */
  meta?: ReactNode;
  /** Right-aligned action (Download). */
  action?: ReactNode;
}

/**
 * ExportBar — a compact bar announcing a ready export with a download action.
 * Never auto-downloads; always offers a button. Maps to `system/b-export-bar.html`.
 *
 * @example
 * ```tsx
 * <ExportBar
 *   icon={<FileIcon />}
 *   title="Receipts-jun-2026.csv ready"
 *   meta="7,418 rows · generated 09:14 · 1.2 MB"
 *   action={<Button variant="secondary" size="sm" startIcon={<DownloadIcon />}>Download</Button>}
 * />
 * ```
 */
export const ExportBar = forwardRef<HTMLDivElement, ExportBarProps>(function ExportBar(
  { icon, title, meta, action, className, style, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      role="status"
      className={cn('export-bar', className)}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        ...style,
      }}
      {...rest}
    >
      {icon ? (
        <span
          aria-hidden="true"
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'var(--brand-soft)',
            color: 'var(--brand-strong)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          {icon}
        </span>
      ) : null}
      <div style={{ flex: 1 }}>
        <div style={{ font: '500 13px/1.3 var(--font-sans)', color: 'var(--text-strong)' }}>{title}</div>
        {meta != null ? (
          <div style={{ font: '12px/1.3 var(--font-mono)', color: 'var(--text-muted)', marginTop: 2 }}>{meta}</div>
        ) : null}
      </div>
      {action ? <div style={{ flex: 'none' }}>{action}</div> : null}
    </div>
  );
});
