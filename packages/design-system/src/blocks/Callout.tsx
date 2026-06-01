import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';

export type CalloutTone = 'info' | 'success' | 'warn' | 'danger' | 'brand';

export interface CalloutProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Visual tone. Pairs a soft background with a saturated icon. @default 'info' */
  tone?: CalloutTone;
  /** Optional bold title (one short sentence). */
  title?: ReactNode;
  /** Optional leading icon node, rendered inside a white circular badge. */
  icon?: ReactNode;
  /** Optional right-aligned action (button/link). */
  action?: ReactNode;
}

const TONE_VARS: Record<CalloutTone, { bg: string; bd: string; fg: string }> = {
  info: { bg: 'var(--tone-info-bg)', bd: 'var(--tone-info-bd)', fg: 'var(--tone-info)' },
  success: { bg: 'var(--tone-success-bg)', bd: 'var(--tone-success-bd)', fg: 'var(--tone-success)' },
  warn: { bg: 'var(--tone-warn-bg)', bd: 'var(--tone-warn-bd)', fg: 'var(--tone-warn)' },
  danger: { bg: 'var(--tone-danger-bg)', bd: 'var(--tone-danger-bd)', fg: 'var(--tone-danger)' },
  brand: { bg: 'var(--brand-soft)', bd: 'var(--brand-100)', fg: 'var(--brand-strong)' },
};

/**
 * Callout — a bordered tonal notice with an icon. Used for in-context tips,
 * info banners, and inline warnings inside a form.
 *
 * @example
 * ```tsx
 * <Callout tone="success" icon={<CheckIcon />} title="Auto-reminders sent.">
 *   12 reminders queued for the 14 guardians in arrears.
 * </Callout>
 * ```
 */
export const Callout = forwardRef<HTMLDivElement, CalloutProps>(function Callout(
  { tone = 'info', title, icon, action, className, children, style, ...rest },
  ref,
) {
  const colors = TONE_VARS[tone];
  const hasIcon = Boolean(icon);
  const hasAction = Boolean(action);

  return (
    <div
      ref={ref}
      role={tone === 'danger' || tone === 'warn' ? 'alert' : 'status'}
      className={cn('callout', `callout-${tone}`, className)}
      style={{
        display: 'grid',
        gridTemplateColumns: `${hasIcon ? '36px ' : ''}1fr${hasAction ? ' auto' : ''}`,
        gap: 14,
        padding: '14px 18px',
        background: colors.bg,
        border: `1px solid ${colors.bd}`,
        borderRadius: 10,
        alignItems: hasAction ? 'center' : 'start',
        color: colors.fg,
        ...style,
      }}
      {...rest}
    >
      {hasIcon ? (
        <div
          className="callout-ic"
          aria-hidden="true"
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.6)',
            color: colors.fg,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          {icon}
        </div>
      ) : null}
      <div className="callout-body">
        {title ? (
          <div
            className="callout-title"
            style={{
              font: '600 14px/1.3 var(--font-sans)',
              marginBottom: 4,
            }}
          >
            {title}
          </div>
        ) : null}
        {children ? (
          <div
            className="callout-text"
            style={{ font: '400 13.5px/1.55 var(--font-sans)', opacity: 0.9, margin: 0 }}
          >
            {children}
          </div>
        ) : null}
      </div>
      {hasAction ? <div className="callout-action">{action}</div> : null}
    </div>
  );
});
