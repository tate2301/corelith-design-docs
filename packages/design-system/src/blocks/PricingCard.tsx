import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';

export type PricingFeature = {
  /** Feature label. */
  label: ReactNode;
  /** When true, the feature is greyed out (not included in this tier). */
  disabled?: boolean;
};

export interface PricingCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Tier name ("Branch"). */
  tier: ReactNode;
  /** Currency prefix ("USD"). */
  currency?: ReactNode;
  /** The big number ("89"). */
  price: ReactNode;
  /** Cadence suffix ("/ month"). */
  per?: ReactNode;
  /** One- or two-sentence description. */
  description?: ReactNode;
  /** Feature list with ✓ ticks. */
  features?: PricingFeature[];
  /** Footer action (one or two buttons). */
  action?: ReactNode;
  /** Mark this card as the anchored/featured tier. @default false */
  featured?: boolean;
  /** Ribbon label shown on featured cards ("Most chosen"). */
  ribbon?: ReactNode;
}

// Ports the inline `.pcard` styles from b-pricing-card.html (no shared class in components.css).
/**
 * PricingCard — a single pricing tier. Three lined up form a pricing row; the
 * middle is usually featured. Maps to `.pcard` in `system/b-pricing-card.html`.
 *
 * @example
 * ```tsx
 * <PricingCard
 *   tier="Branch"
 *   featured
 *   ribbon="Most chosen"
 *   currency="USD"
 *   price="89"
 *   per="/ month"
 *   description="For a single supermarket or workshop."
 *   features={[
 *     { label: '1 branch · unlimited tills' },
 *     { label: 'Group consolidation', disabled: true },
 *   ]}
 *   action={<Button variant="primary" block>Start free trial</Button>}
 * />
 * ```
 */
export const PricingCard = forwardRef<HTMLDivElement, PricingCardProps>(function PricingCard(
  { tier, currency, price, per, description, features, action, featured = false, ribbon, className, style, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('pcard', featured && 'featured', className)}
      style={{
        background: 'var(--surface)',
        border: featured ? '1px solid var(--brand)' : '1px solid var(--border)',
        borderRadius: 14,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        position: featured ? 'relative' : undefined,
        boxShadow: featured ? '0 0 0 4px var(--brand-soft)' : undefined,
        ...style,
      }}
      {...rest}
    >
      {featured && ribbon != null ? (
        <span
          className="ribbon"
          style={{
            position: 'absolute',
            top: -10,
            right: 16,
            background: 'var(--brand)',
            color: '#fff',
            padding: '3px 10px',
            borderRadius: 9999,
            font: '500 11px/1 var(--font-sans)',
            letterSpacing: '0.04em',
          }}
        >
          {ribbon}
        </span>
      ) : null}
      <div
        className="tier"
        style={{
          font: '600 14px/1 var(--font-sans)',
          color: featured ? 'var(--brand-strong)' : 'var(--text-strong)',
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
        }}
      >
        {tier}
      </div>
      <div className="price" style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        {currency != null ? (
          <span className="cur" style={{ font: '500 14px/1 var(--font-mono)', color: 'var(--text-muted)' }}>{currency}</span>
        ) : null}
        <span className="big" style={{ font: '700 36px/1 var(--font-sans)', color: 'var(--text-strong)', letterSpacing: '-0.02em' }}>
          {price}
        </span>
        {per != null ? (
          <span className="per" style={{ font: 'var(--type-body-sm)', color: 'var(--text-muted)' }}>{per}</span>
        ) : null}
      </div>
      {description != null ? (
        <p className="desc" style={{ font: 'var(--type-body)', color: 'var(--text-muted)', margin: 0 }}>{description}</p>
      ) : null}
      {features && features.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {features.map((f, i) => (
            <li
              key={i}
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
                font: 'var(--type-body-sm)',
                color: f.disabled ? 'var(--text-subtle)' : 'var(--text-body)',
              }}
            >
              <span
                className="ck"
                aria-hidden="true"
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 9999,
                  background: f.disabled ? 'var(--surface-muted)' : 'var(--tone-success-bg)',
                  color: f.disabled ? 'var(--text-subtle)' : 'var(--tone-success)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 'none',
                  font: '600 10px/1 var(--font-sans)',
                }}
              >
                ✓
              </span>
              {f.label}
            </li>
          ))}
        </ul>
      ) : null}
      {action ? <div style={{ marginTop: 'auto' }}>{action}</div> : null}
    </div>
  );
});
