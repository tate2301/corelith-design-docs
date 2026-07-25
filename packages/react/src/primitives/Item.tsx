import {
  forwardRef,
  type ElementType,
  type ReactNode,
  type Ref,
} from 'react';
import { cn } from '../utils/cn';

export interface ItemOwnProps {
  /** Leading node — icon, avatar, or thumbnail. */
  leading?: ReactNode;
  /** Primary line. */
  title?: ReactNode;
  /** Secondary line under the title. */
  subtitle?: ReactNode;
  /** Trailing node — chevron, badge, action. */
  trailing?: ReactNode;
  /** Render as another element/component (e.g. `'a'`, `'button'`). @default 'div' */
  as?: ElementType;
  className?: string;
  children?: ReactNode;
}

// Polymorphic prop merge — own props win, the rest pass through to `as`.
export type ItemProps<E extends ElementType = 'div'> = ItemOwnProps &
  Omit<React.ComponentPropsWithoutRef<E>, keyof ItemOwnProps>;

/**
 * Item — a generic list row with leading / title / subtitle / trailing slots.
 * Polymorphic: render as a `<div>`, `<button>`, or `<a>` via `as`.
 * The docs (`p-item`) lay this out with an inline grid (no `.item` rule exists
 * in components.css), so the three-column layout is a token-driven inline
 * fallback while still exposing a `.item` class hook.
 *
 * Accessibility:
 *   - When rendered as `button`/`a` the whole row is a single focusable target;
 *     pass an `aria-label` if the visible text is ambiguous.
 *   - Trailing affordances (chevron icons) are decorative; mark interactive
 *     trailing controls with their own roles/labels.
 */
export const Item = forwardRef(function Item<E extends ElementType = 'div'>(
  {
    leading,
    title,
    subtitle,
    trailing,
    as,
    className,
    children,
    ...rest
  }: ItemProps<E>,
  ref: Ref<Element>,
) {
  const Component = (as ?? 'div') as ElementType;
  const interactive = Component === 'button' || Component === 'a';

  return (
    <Component
      ref={ref}
      className={cn('item', className)}
      // Token-driven inline fallback: no `.item` rule in components.css.
      style={{
        display: 'grid',
        gridTemplateColumns: `${leading ? '36px ' : ''}1fr auto`,
        gap: 12,
        padding: '10px 12px',
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
        textAlign: 'left',
        background: 'transparent',
        border: 0,
        color: 'inherit',
        cursor: interactive ? 'pointer' : undefined,
        font: 'inherit',
      }}
      {...rest}
    >
      {leading != null ? (
        <span
          aria-hidden={interactive ? 'true' : undefined}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'var(--surface-muted)',
            color: 'var(--text-muted)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          {leading}
        </span>
      ) : null}
      <span style={{ minWidth: 0 }}>
        {title != null ? (
          <span
            style={{
              display: 'block',
              font: '500 14px/1.3 var(--font-sans)',
              color: 'var(--text-strong)',
            }}
          >
            {title}
          </span>
        ) : null}
        {subtitle != null ? (
          <span
            style={{
              display: 'block',
              font: '12.5px/1.3 var(--font-sans)',
              color: 'var(--text-muted)',
              marginTop: 2,
            }}
          >
            {subtitle}
          </span>
        ) : null}
        {children}
      </span>
      {trailing != null ? (
        <span style={{ color: 'var(--text-subtle)', display: 'inline-flex', alignItems: 'center' }}>
          {trailing}
        </span>
      ) : null}
    </Component>
  );
}) as <E extends ElementType = 'div'>(props: ItemProps<E> & { ref?: Ref<Element> }) => React.ReactElement;
