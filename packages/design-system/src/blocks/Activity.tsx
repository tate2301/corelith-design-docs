import {
  forwardRef,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';

export type ActivityTone = 'brand' | 'neutral';

export type ActivityEvent = {
  /** Leading icon node, rendered inside a circular badge. */
  icon?: ReactNode;
  /** Who acted (bolded) + what they did. Pass the full sentence as a node. */
  text: ReactNode;
  /** Right-aligned timestamp ("14 min ago" or "14:38"). */
  time?: ReactNode;
  /** Badge tint. Use 'brand' for the actor's own actions, 'neutral' for system. @default 'neutral' */
  tone?: ActivityTone;
};

export interface ActivityProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Optional heading shown above the list ("Activity"). */
  title?: ReactNode;
  /** Inline items API. Mutually exchangeable with <Activity.Item> children. */
  items?: ActivityEvent[];
  /** Polymorphic root element. @default 'div' */
  as?: ElementType;
}

export interface ActivityItemProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'>,
    ActivityEvent {
  /** When false, drop the bottom hairline (use for the last row). @default true */
  bordered?: boolean;
}

// No dedicated CSS class for activity rows — compose tokens inline (mirrors b-activity.html).
const BADGE_TONE: Record<ActivityTone, { bg: string; fg: string }> = {
  brand: { bg: 'var(--brand-soft)', fg: 'var(--brand-strong)' },
  neutral: { bg: 'var(--surface-muted)', fg: 'var(--text-muted)' },
};

/**
 * Activity.Item — a single event row (icon · who/what · when).
 */
function ActivityItem({
  icon,
  text,
  time,
  tone = 'neutral',
  bordered = true,
  className,
  style,
  ...rest
}: ActivityItemProps) {
  const badge = BADGE_TONE[tone];
  return (
    <div
      className={cn('activity-item', className)}
      style={{
        display: 'grid',
        gridTemplateColumns: '28px 1fr auto',
        gap: 12,
        padding: '12px 0',
        borderBottom: bordered ? '1px solid var(--border-subtle)' : undefined,
        alignItems: 'flex-start',
        ...style,
      }}
      {...rest}
    >
      <div
        aria-hidden="true"
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: badge.bg,
          color: badge.fg,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        {icon}
      </div>
      <div style={{ font: '400 13px/1.5 var(--font-sans)', color: 'var(--text-body)' }}>{text}</div>
      {time != null ? (
        <div
          style={{
            font: '12px/1.3 var(--font-mono)',
            color: 'var(--text-subtle)',
            whiteSpace: 'nowrap',
          }}
        >
          {time}
        </div>
      ) : null}
    </div>
  );
}

ActivityItem.displayName = 'Activity.Item';

type ActivityComponent = ReturnType<
  typeof forwardRef<HTMLDivElement, ActivityProps>
> & {
  Item: typeof ActivityItem;
};

/**
 * Activity — a chronological audit feed. Each row is who · what · when.
 * Newest first. Maps to the inline-styled feed in `system/b-activity.html`.
 *
 * Accepts events via the `items` prop or as `<Activity.Item>` children.
 *
 * @example
 * ```tsx
 * <Activity title="Activity" items={[
 *   { icon: <UserIcon />, tone: 'brand', text: <><b>Faith Moyo</b> closed shift S-2841</>, time: '5 min ago' },
 *   { icon: <CoinIcon />, text: <><b>System</b> applied loyalty discount</>, time: '14 min ago' },
 * ]} />
 * ```
 */
const ActivityBase = forwardRef<HTMLDivElement, ActivityProps>(function Activity(
  { title, items, as, className, style, children, ...rest },
  ref,
) {
  const Comp = (as ?? 'div') as ElementType;
  const count = items?.length ?? 0;
  return (
    <Comp
      ref={ref}
      className={cn('activity-card', className)}
      style={{ padding: '16px 20px', ...style }}
      {...rest}
    >
      {title ? (
        <div
          style={{
            font: '600 14px/1.3 var(--font-sans)',
            color: 'var(--text-strong)',
            marginBottom: 14,
          }}
        >
          {title}
        </div>
      ) : null}
      <div style={{ display: 'grid', gap: 0 }}>
        {items?.map((it, i) => <ActivityItem key={i} {...it} bordered={i < count - 1} />)}
        {children}
      </div>
    </Comp>
  );
});

export const Activity = ActivityBase as ActivityComponent;
Activity.Item = ActivityItem;
