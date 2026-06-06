import { forwardRef, type HTMLAttributes, type MouseEventHandler, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import './RowCard.css';

export type RowCardDeltaTone = 'positive' | 'negative' | 'neutral';

export interface RowCardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: ReactNode;
  sub?: ReactNode;
  value?: ReactNode;
  delta?: ReactNode;
  deltaTone?: RowCardDeltaTone;
  meta?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  onClick?: MouseEventHandler<HTMLElement>;
  href?: string;
}

export const RowCard = forwardRef<HTMLElement, RowCardProps>(function RowCard(
  { title, sub, value, delta, deltaTone = 'neutral', meta, leading, trailing, onClick, href, className, ...rest },
  ref,
) {
  const interactive = Boolean(onClick || href);
  const Tag: 'a' | 'button' | 'div' = href ? 'a' : interactive ? 'button' : 'div';
  const interactiveProps: Record<string, unknown> = {};
  if (Tag === 'button') interactiveProps.type = 'button';
  if (Tag === 'a' && href) interactiveProps.href = href;

  return (
    <Tag
      ref={ref as never}
      className={cx('b-row-card', interactive && 'is-interactive', className)}
      onClick={onClick}
      {...interactiveProps}
      {...(rest as HTMLAttributes<HTMLElement>)}
    >
      {leading ? <span className="b-row-card-leading">{leading}</span> : null}
      <span className="b-row-card-main">
        <span className="b-row-card-title">{title}</span>
        {sub ? <span className="b-row-card-sub">{sub}</span> : null}
        {meta ? <span className="b-row-card-meta">{meta}</span> : null}
      </span>
      {value != null || delta != null ? (
        <span className="b-row-card-value">
          {value != null ? <span className="b-row-card-value-num">{value}</span> : null}
          {delta != null ? (
            <span className={cx('b-row-card-delta', `delta-${deltaTone}`)}>{delta}</span>
          ) : null}
        </span>
      ) : null}
      {trailing ? <span className="b-row-card-trailing">{trailing}</span> : null}
    </Tag>
  );
});
