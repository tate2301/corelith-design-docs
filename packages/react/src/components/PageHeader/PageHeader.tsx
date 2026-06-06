import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: ReactNode;
  /** Show a back button on the left. */
  onBack?: () => void;
  backLabel?: string;
  /** Right-side actions (buttons, menus). */
  actions?: ReactNode;
}

export const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(function PageHeader(
  { title, onBack, backLabel = 'Back', actions, className, children, ...rest },
  ref,
) {
  return (
    <header
      ref={ref as React.Ref<HTMLDivElement>}
      className={cx('page-header', className)}
      {...(rest as HTMLAttributes<HTMLDivElement>)}
    >
      {onBack ? (
        <button type="button" className="back" aria-label={backLabel} onClick={onBack}>
          ←
        </button>
      ) : null}
      <h1>{title}</h1>
      {children}
      <span className="spacer" />
      {actions}
    </header>
  );
});
