import {
  forwardRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';

export interface MobileListProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

/**
 * MobileList — a touch-friendly list container with hairline-divided rows.
 * The docs (`p-mobile-list`) build this from an inline surface card plus grid
 * rows; no `.mobile-list` rule exists in components.css, so the card chrome and
 * row layout are token-driven inline fallbacks.
 *
 * Accessibility:
 *   - Container is `role="list"`; each Row is `role="listitem"`. Interactive
 *     rows render as buttons so they are keyboard-activatable.
 */
export const MobileList = forwardRef<HTMLDivElement, MobileListProps>(function MobileList(
  { className, style, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      role="list"
      className={cn('mobile-list', className)}
      // Token-driven inline fallback: no `.mobile-list` rule in components.css.
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        overflow: 'clip',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
});

export interface MobileListRowProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'title'> {
  /** Leading node — icon tile or avatar. */
  leading?: ReactNode;
  /** Primary line. */
  title?: ReactNode;
  /** Secondary line. */
  subtitle?: ReactNode;
  /** Trailing node. @default a chevron when the row is a button. */
  trailing?: ReactNode;
  /** Render as a static row instead of a button. */
  static?: boolean;
}

const MobileListRow = forwardRef<HTMLButtonElement, MobileListRowProps>(function MobileListRow(
  { leading, title, subtitle, trailing, static: isStatic, className, style, children, ...rest },
  ref,
) {
  const layoutStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `${leading ? '40px ' : ''}1fr 14px`,
    gap: 14,
    alignItems: 'center',
    padding: '14px 18px',
    borderBottom: '1px solid var(--border-subtle)',
    width: '100%',
    textAlign: 'left',
    background: 'transparent',
    border: 0,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--border-subtle)',
    cursor: isStatic ? undefined : 'pointer',
    font: 'inherit',
    color: 'inherit',
    ...style,
  };

  const inner = (
    <>
      {leading != null ? (
        <div
          aria-hidden="true"
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'var(--brand-soft)',
            color: 'var(--brand-strong)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          {leading}
        </div>
      ) : null}
      <div style={{ minWidth: 0 }}>
        {title != null ? (
          <div style={{ font: '500 15px/1.3 var(--font-sans)', color: 'var(--text-strong)' }}>
            {title}
          </div>
        ) : null}
        {subtitle != null ? (
          <div
            style={{
              font: '12.5px/1.3 var(--font-sans)',
              color: 'var(--text-muted)',
              marginTop: 2,
            }}
          >
            {subtitle}
          </div>
        ) : null}
        {children}
      </div>
      <span aria-hidden="true" style={{ color: 'var(--text-subtle)' }}>
        {trailing ?? (isStatic ? null : '›')}
      </span>
    </>
  );

  if (isStatic) {
    return (
      <div role="listitem" className={cn('mobile-list-row', className)} style={layoutStyle}>
        {inner}
      </div>
    );
  }

  return (
    <div role="listitem" style={{ display: 'contents' }}>
      <button
        ref={ref}
        type="button"
        className={cn('mobile-list-row', className)}
        style={layoutStyle}
        {...rest}
      >
        {inner}
      </button>
    </div>
  );
});

(MobileList as unknown as Record<string, unknown>).Row = MobileListRow;

export type MobileListComponent = typeof MobileList & {
  Row: typeof MobileListRow;
};

export { MobileListRow };
