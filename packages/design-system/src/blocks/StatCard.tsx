import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';

export type StatTone = 'neutral' | 'brand' | 'success' | 'warn' | 'danger';
export type DeltaDirection = 'up' | 'down' | 'neutral';

export type StatDelta = {
  /** Direction arrow + colour. */
  direction?: DeltaDirection;
  /** Label, eg "+12.4 % vs Tue avg". */
  label: ReactNode;
};

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Small uppercase label above the value. */
  label: ReactNode;
  /** The headline number. Wrap units in <span className="u">…</span> for muted styling. */
  value: ReactNode;
  /** Optional small delta line under the value. */
  delta?: StatDelta | ReactNode;
  /** Tonal tint for the whole tile. @default 'neutral' */
  tone?: StatTone;
  /** Optional muted line at the bottom (e.g. "3 batches"). */
  footer?: ReactNode;
}

function isStatDelta(v: unknown): v is StatDelta {
  return typeof v === 'object' && v !== null && 'label' in (v as Record<string, unknown>);
}

const DIR_GLYPH: Record<DeltaDirection, string> = {
  up: '▲',
  down: '▼',
  neutral: '·',
};

const DIR_CLASS: Record<DeltaDirection, string> = {
  up: 'up',
  down: 'dn',
  neutral: '',
};

/**
 * StatCard — a single KPI tile (label · value · delta).
 * Maps to `.stat-tile` in components.css.
 *
 * @example
 * ```tsx
 * <StatCard
 *   label="Today's revenue"
 *   value={<>$ 2,816<span className="u">.40</span></>}
 *   delta={{ direction: 'up', label: '12.4 % vs Tue avg' }}
 * />
 * ```
 */
export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(function StatCard(
  { label, value, delta, tone = 'neutral', footer, className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cn('stat-tile', tone !== 'neutral' && `stat-tile-${tone}`, className)} {...rest}>
      <div className="lbl">{label}</div>
      <div className={cn('val', tone !== 'neutral' && tone !== 'brand' && tone)}>{value}</div>
      {delta != null
        ? isStatDelta(delta)
          ? (
            <div className={cn('delta', DIR_CLASS[delta.direction ?? 'neutral'])}>
              {delta.direction && delta.direction !== 'neutral' ? (
                <span aria-hidden="true" style={{ marginRight: 4 }}>
                  {DIR_GLYPH[delta.direction]}
                </span>
              ) : null}
              {delta.label}
            </div>
          )
          : <div className="delta">{delta}</div>
        : null}
      {footer ? <div className="delta" style={{ color: 'var(--text-muted)' }}>{footer}</div> : null}
    </div>
  );
});
