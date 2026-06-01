import {
  forwardRef,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';

/** Maps to the canonical `.status-dot` modifier classes. */
export type HighlightTone = 'ok' | 'attention' | 'danger' | 'progress' | 'neutral';

export type HighlightItem = {
  /** Dot tone — 'ok' for wins, 'attention' for warnings. @default 'ok' */
  tone?: HighlightTone;
  /** One-sentence highlight. */
  text: ReactNode;
};

export interface HighlightsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Optional heading ("Highlights · this shift"). */
  title?: ReactNode;
  /** Inline items API. Mutually exchangeable with <Highlights.Item> children. */
  items?: HighlightItem[];
  /** Polymorphic root element. @default 'div' */
  as?: ElementType;
}

export interface HighlightItemProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'>,
    HighlightItem {}

const DOT_CLASS: Record<HighlightTone, string> = {
  ok: 'ok',
  attention: 'attention',
  danger: 'danger',
  progress: 'progress',
  neutral: '',
};

/**
 * Highlights.Item — a single highlight row (status dot + one sentence).
 */
function HighlightsItem({ tone = 'ok', text, className, style, ...rest }: HighlightItemProps) {
  return (
    <div
      className={cn('highlight-item', className)}
      style={{ display: 'flex', gap: 10, alignItems: 'flex-start', ...style }}
      {...rest}
    >
      <span className={cn('status-dot', DOT_CLASS[tone])} style={{ marginTop: 6 }} aria-hidden="true" />
      <span style={{ font: 'var(--type-body)', color: 'var(--text-body)', lineHeight: 1.55, flex: 1 }}>{text}</span>
    </div>
  );
}

HighlightsItem.displayName = 'Highlights.Item';

type HighlightsComponent = ReturnType<
  typeof forwardRef<HTMLDivElement, HighlightsProps>
> & {
  Item: typeof HighlightsItem;
};

/**
 * Highlights — a short callout grid of one-sentence wins and warnings, each
 * led by a status dot. Three is honest; six is noise. Maps to
 * `system/b-highlights.html`.
 *
 * @example
 * ```tsx
 * <Highlights title="Highlights · this shift" items={[
 *   { tone: 'ok', text: 'Park Centre crossed $ 2.5k in revenue · earliest of the month' },
 *   { tone: 'attention', text: 'Long-life milk on track to stock-out by 16:00 · reorder placed' },
 * ]} />
 * ```
 */
const HighlightsBase = forwardRef<HTMLDivElement, HighlightsProps>(function Highlights(
  { title, items, as, className, style, children, ...rest },
  ref,
) {
  const Comp = (as ?? 'div') as ElementType;
  return (
    <Comp
      ref={ref}
      className={cn('highlights', className)}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '18px 20px',
        ...style,
      }}
      {...rest}
    >
      {title ? (
        <h2 style={{ font: '600 15px/1.3 var(--font-sans)', color: 'var(--text-strong)', margin: '0 0 12px' }}>
          {title}
        </h2>
      ) : null}
      <div style={{ display: 'grid', gap: 10 }}>
        {items?.map((it, i) => <HighlightsItem key={i} {...it} />)}
        {children}
      </div>
    </Comp>
  );
});

export const Highlights = HighlightsBase as HighlightsComponent;
Highlights.Item = HighlightsItem;
