import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';

export interface BottomTabItem<T extends string = string> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  href?: string;
  disabled?: boolean;
}

export interface BottomTabsProps<T extends string = string>
  extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  value: T;
  onChange?: (value: T) => void;
  items: BottomTabItem<T>[];
  ariaLabel?: string;
}

function BottomTabsInner<T extends string>(
  { value, onChange, items, ariaLabel = 'Bottom navigation', className, ...rest }: BottomTabsProps<T>,
  ref: React.Ref<HTMLElement>,
) {
  return (
    <nav
      ref={ref}
      aria-label={ariaLabel}
      className={cx('b-bottom-tabs', className)}
      {...rest}
    >
      {items.map((it) => {
        const active = it.value === value;
        const inner = (
          <>
            {it.icon ? <span className="b-bt-ic" aria-hidden="true">{it.icon}</span> : null}
            <span className="b-bt-label">{it.label}</span>
            {it.badge != null ? (
              <span className="b-bt-badge" aria-label={`${it.badge} unread`}>{it.badge}</span>
            ) : null}
          </>
        );
        if (it.href) {
          return (
            <a
              key={it.value}
              href={it.href}
              aria-current={active ? 'page' : undefined}
              className={cx(active && 'active')}
            >
              {inner}
            </a>
          );
        }
        return (
          <button
            key={it.value}
            type="button"
            aria-current={active ? 'page' : undefined}
            disabled={it.disabled}
            className={cx(active && 'active')}
            onClick={() => onChange?.(it.value)}
          >
            {inner}
          </button>
        );
      })}
    </nav>
  );
}

export const BottomTabs = forwardRef(BottomTabsInner) as <T extends string = string>(
  props: BottomTabsProps<T> & { ref?: React.Ref<HTMLElement> },
) => React.ReactElement;
