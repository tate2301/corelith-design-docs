import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Optional small icon node, rendered inside the rounded tile. */
  icon?: ReactNode;
  /** The heading — start with the noun ("No receipts yet today"). */
  title: ReactNode;
  /** One-sentence explanation under the title. */
  body?: ReactNode;
  /** Single primary action (button/link). Empty states get at most one. */
  action?: ReactNode;
  /** Optional large illustration node, replaces the small icon when present. */
  illustration?: ReactNode;
}

/**
 * EmptyState — what to show when a list, table, or detail page has no data.
 * Maps to `.empty-state` in components.css.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<ReceiptIcon />}
 *   title="No receipts yet today"
 *   body="Receipts appear here as cashiers ring up sales."
 *   action={<Button variant="primary">Open till</Button>}
 * />
 * ```
 */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
  { icon, title, body, action, illustration, className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cn('empty-state', className)} {...rest}>
      {illustration ? (
        <div className="empty-state-illustration">{illustration}</div>
      ) : icon ? (
        <div className="ic" aria-hidden="true">{icon}</div>
      ) : null}
      <h3>{title}</h3>
      {body ? <p>{body}</p> : null}
      {action ? <div className="empty-state-action" style={{ marginTop: 12 }}>{action}</div> : null}
    </div>
  );
});
