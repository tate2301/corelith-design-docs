import {
  forwardRef,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';

export type DetailHeroTone = 'neutral' | 'brand' | 'success' | 'warn' | 'danger';

export type DetailFact = {
  /** Tiny uppercase label. */
  label: ReactNode;
  /** The value (mono numbers read best). */
  value: ReactNode;
};

export interface DetailHeroProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Small mono/eyebrow identifier above the title ("SH-2841" or a pill). */
  eyebrow?: ReactNode;
  /** The record title. Rendered as <h1>. */
  title: ReactNode;
  /** One-sentence summary under the title. */
  lede?: ReactNode;
  /** Optional status row node (e.g. a `.status-dot` + text) shown under the title. */
  status?: ReactNode;
  /** Optional key/value facts row under the header. 4–6 max. */
  facts?: DetailFact[];
  /** Right-aligned action buttons. */
  actions?: ReactNode;
  /** Tonal accent — draws a coloured strip on the left edge. @default 'neutral' */
  tone?: DetailHeroTone;
  /** Polymorphic root element. @default 'header' */
  as?: ElementType;
}

// Tone → left accent colour. No dedicated class covers the inline-styled hero in b-detail-hero.html.
const TONE_ACCENT: Record<DetailHeroTone, string | undefined> = {
  neutral: undefined,
  brand: 'var(--brand)',
  success: 'var(--tone-success)',
  warn: 'var(--tone-warn)',
  danger: 'var(--tone-danger)',
};

/**
 * DetailHero — the hero at the top of a record detail page: identifier,
 * title, status/lede, an optional facts row, and actions.
 * Maps to the inline-styled hero in `system/b-detail-hero.html`.
 *
 * @example
 * ```tsx
 * <DetailHero
 *   eyebrow="SH-2841"
 *   title="Shipment to Rand Refinery"
 *   status={<><span className="status-dot progress">In transit</span></>}
 *   facts={[
 *     { label: 'Total weight', value: '4.20 kg fine' },
 *     { label: 'Courier', value: 'G4S Heavy' },
 *   ]}
 *   actions={<><Button variant="secondary">Contact courier</Button><Button variant="primary">Mark received</Button></>}
 * />
 * ```
 */
export const DetailHero = forwardRef<HTMLElement, DetailHeroProps>(function DetailHero(
  { eyebrow, title, lede, status, facts, actions, tone = 'neutral', as, className, style, ...rest },
  ref,
) {
  const Comp = (as ?? 'header') as ElementType;
  const accent = TONE_ACCENT[tone];
  const hasFacts = Boolean(facts && facts.length > 0);

  return (
    <Comp
      ref={ref}
      className={cn('detail-hero-block', `detail-hero-${tone}`, className)}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderLeft: accent ? `4px solid ${accent}` : '1px solid var(--border)',
        borderRadius: 14,
        padding: '28px 32px',
        ...style,
      }}
      {...rest}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, marginBottom: hasFacts ? 20 : 0 }}>
        <div style={{ flex: 1 }}>
          {eyebrow != null ? (
            <div style={{ font: '500 12px/1 var(--font-mono)', color: 'var(--text-muted)', marginBottom: 8 }}>
              {eyebrow}
            </div>
          ) : null}
          <h1
            style={{
              font: '700 28px/1.15 var(--font-sans)',
              letterSpacing: '-0.025em',
              margin: '0 0 6px',
              color: 'var(--text-strong)',
            }}
          >
            {title}
          </h1>
          {status ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>{status}</div>
          ) : null}
          {lede ? (
            <p style={{ font: '400 15px/1.55 var(--font-sans)', color: 'var(--text-muted)', margin: 0 }}>{lede}</p>
          ) : null}
        </div>
        {actions ? <div style={{ display: 'inline-flex', gap: 8 }}>{actions}</div> : null}
      </div>
      {hasFacts ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${facts!.length}, 1fr)`,
            gap: 0,
            borderTop: '1px solid var(--border)',
            paddingTop: 20,
          }}
        >
          {facts!.map((f, i) => (
            <div key={i}>
              <div
                style={{
                  font: 'var(--type-caption)',
                  color: 'var(--text-muted)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                {f.label}
              </div>
              <div style={{ font: '600 18px/1 var(--font-sans)', color: 'var(--text-strong)' }}>{f.value}</div>
            </div>
          ))}
        </div>
      ) : null}
    </Comp>
  );
});
