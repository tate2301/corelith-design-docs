import {
  forwardRef,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';

export type CardTone = 'default' | 'soft' | 'brand' | 'success' | 'warn' | 'danger';

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Optional header title. Renders inside `.card-head`. */
  title?: ReactNode;
  /** Optional subtitle, shown below the title. */
  subtitle?: ReactNode;
  /** Right-side actions inside the header (links, filter chips, buttons). */
  actions?: ReactNode;
  /** Optional footer slot with a top border. */
  footer?: ReactNode;
  /** Tonal variant. @default 'default' */
  tone?: CardTone;
  /** When true, the header has a bottom hairline border. @default true if subtitle or actions */
  borderedHead?: boolean;
  /** Remove the default body padding (use for tables that already pad). */
  flush?: boolean;
  /** Polymorphic root element. @default 'section' */
  as?: ElementType;
}

const TONE_CLASS: Record<CardTone, string> = {
  default: '',
  soft: 'card-soft',
  brand: 'card-tone-brand',
  success: 'card-tone-success',
  warn: 'card-tone-warn',
  danger: 'card-tone-danger',
};

/**
 * Card — a general-purpose container with a hairline border.
 * Maps to `.card` family in components.css.
 *
 * @example
 * ```tsx
 * <Card title="Sales by hour" subtitle="Tuesday 3 June" actions={<Button variant="link">View all</Button>}>
 *   <Chart />
 * </Card>
 * ```
 */
export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  {
    title,
    subtitle,
    actions,
    footer,
    tone = 'default',
    borderedHead,
    flush,
    as,
    className,
    children,
    ...rest
  },
  ref,
) {
  const Comp = (as ?? 'section') as ElementType;
  const hasHead = Boolean(title || subtitle || actions);
  const headBorder = borderedHead ?? hasHead;

  return (
    <Comp ref={ref} className={cn('card', TONE_CLASS[tone], className)} {...rest}>
      {hasHead ? (
        <div className={cn('card-head', headBorder && 'bordered')}>
          <div>
            {title ? <div className="card-title">{title}</div> : null}
            {subtitle ? <div className="card-sub">{subtitle}</div> : null}
          </div>
          {actions ? <div className="card-actions">{actions}</div> : null}
        </div>
      ) : null}
      {children != null ? (
        <div className={flush ? '' : 'card-body'}>{children}</div>
      ) : null}
      {footer ? <div className="card-foot">{footer}</div> : null}
    </Comp>
  );
});
