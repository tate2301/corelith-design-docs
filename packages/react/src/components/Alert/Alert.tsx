import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import './Alert.css';

export type AlertTone = 'info' | 'success' | 'warn' | 'danger';

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: AlertTone;
  title?: ReactNode;
  icon?: ReactNode;
}

/**
 * Alert — inline status banner. Tone drives colour.
 *
 * @example
 * ```tsx
 * <Alert />
 * ```
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { tone = 'info', title, icon, className, children, role, ...rest },
  ref,
) {
  const liveRole = role ?? (tone === 'danger' || tone === 'warn' ? 'alert' : 'status');
  return (
    <div ref={ref} className={cx('alert', tone, className)} role={liveRole} {...rest}>
      {icon ? <span className="alert-icon" aria-hidden="true">{icon}</span> : null}
      <div className="alert-body">
        {title ? <div className="alert-title">{title}</div> : null}
        {children ? <div className="alert-message">{children}</div> : null}
      </div>
    </div>
  );
});
