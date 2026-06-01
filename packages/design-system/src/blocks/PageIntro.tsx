import {
  forwardRef,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';

export interface PageIntroProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Small pill eyebrow above the title ("Pricing & promotions"). */
  eyebrow?: ReactNode;
  /** The headline. Rendered as <h1>. */
  title: ReactNode;
  /** One- or two-sentence lede under the title. */
  lede?: ReactNode;
  /** Action row (one primary + maybe one secondary). */
  actions?: ReactNode;
  /** Constrain the intro width for readability. @default 640 */
  maxWidth?: number | string;
  /** Polymorphic root element. @default 'header' */
  as?: ElementType;
}

/**
 * PageIntro — a cold-landing page introduction: eyebrow · headline · lede ·
 * one action. Use sparingly; on high-frequency pages the lede becomes
 * wallpaper. Maps to `system/b-page-intro.html`.
 *
 * @example
 * ```tsx
 * <PageIntro
 *   eyebrow="Pricing & promotions"
 *   title="Build a promo for the weekend"
 *   lede="Promotions apply to a category, a list of SKUs, or members only."
 *   actions={<><Button variant="primary">New promo</Button><Button variant="secondary">Browse templates</Button></>}
 * />
 * ```
 */
export const PageIntro = forwardRef<HTMLElement, PageIntroProps>(function PageIntro(
  { eyebrow, title, lede, actions, maxWidth = 640, as, className, style, ...rest },
  ref,
) {
  const Comp = (as ?? 'header') as ElementType;
  return (
    <Comp ref={ref} className={cn('page-intro', className)} style={{ maxWidth, ...style }} {...rest}>
      {eyebrow != null ? (
        <span
          style={{
            display: 'inline-block',
            padding: '4px 12px',
            background: 'var(--brand-soft)',
            color: 'var(--brand-strong)',
            borderRadius: 9999,
            font: '500 11px/1 var(--font-sans)',
            marginBottom: 14,
            letterSpacing: '0.04em',
          }}
        >
          {eyebrow}
        </span>
      ) : null}
      <h1
        style={{
          font: '700 28px/1.15 var(--font-sans)',
          letterSpacing: '-0.02em',
          color: 'var(--text-strong)',
          margin: '0 0 10px',
        }}
      >
        {title}
      </h1>
      {lede ? (
        <p
          style={{
            font: '400 16px/1.55 var(--font-sans)',
            color: 'var(--text-muted)',
            margin: '0 0 18px',
            maxWidth: '60ch',
          }}
        >
          {lede}
        </p>
      ) : null}
      {actions ? <div style={{ display: 'inline-flex', gap: 8 }}>{actions}</div> : null}
    </Comp>
  );
});
