import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  icon?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  /** `full` (default) renders `.empty-state`. `inline` renders `.p-empty-inline`. */
  variant?: 'full' | 'inline';
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
  { icon, title, description, action, variant = 'full', className, children, ...rest },
  ref,
) {
  if (variant === 'inline') {
    return (
      <div ref={ref} className={cx('p-empty-inline', className)} {...rest}>
        {icon ? <span className="ic" aria-hidden="true">{icon}</span> : null}
        <span className="msg">
          {title ? <strong>{title}</strong> : null}
          {description ? <> {description}</> : null}
          {children}
        </span>
        {action ? <span className="cta">{action}</span> : null}
      </div>
    );
  }
  return (
    <div ref={ref} className={cx('empty-state', className)} {...rest}>
      {icon ? <div className="ic" aria-hidden="true">{icon}</div> : null}
      {title ? <h3>{title}</h3> : null}
      {description ? <p>{description}</p> : null}
      {children}
      {action ? <div className="empty-state-action">{action}</div> : null}
    </div>
  );
});
