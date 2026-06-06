import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import './Checklist.css';

export interface ChecklistProps extends HTMLAttributes<HTMLUListElement> {
  children?: ReactNode;
}

const ChecklistRoot = forwardRef<HTMLUListElement, ChecklistProps>(function Checklist(
  { className, children, ...rest },
  ref,
) {
  return (
    <ul ref={ref} className={cx('checklist', className)} {...rest}>
      {children}
    </ul>
  );
});

export interface ChecklistItemProps extends Omit<HTMLAttributes<HTMLLIElement>, 'title'> {
  done?: boolean;
  title?: ReactNode;
  subtitle?: ReactNode;
  onToggle?: (done: boolean) => void;
  action?: ReactNode;
}

function ChecklistItem({ done, title, subtitle, onToggle, action, className, children, ...rest }: ChecklistItemProps) {
  return (
    <li className={cx('checklist-item', done && 'done', className)} {...rest}>
      <button
        type="button"
        className="checklist-check"
        aria-pressed={done || undefined}
        aria-label={done ? 'Mark as not done' : 'Mark as done'}
        onClick={() => onToggle?.(!done)}
      >
        <span aria-hidden="true">{done ? '✓' : ''}</span>
      </button>
      <div className="checklist-body">
        {title != null ? <div className="checklist-title">{title}</div> : null}
        {subtitle != null ? <div className="checklist-sub">{subtitle}</div> : null}
        {children}
      </div>
      {action != null ? <div className="checklist-action">{action}</div> : null}
    </li>
  );
}

type ChecklistComponent = typeof ChecklistRoot & {
  Item: typeof ChecklistItem;
};

export const Checklist = ChecklistRoot as ChecklistComponent;
Checklist.Item = ChecklistItem;
