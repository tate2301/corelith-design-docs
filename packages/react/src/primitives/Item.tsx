import {
  forwardRef,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import { cn } from '../utils/cn';

export type ItemVariant = 'default' | 'outline' | 'muted';
export type ItemSize = 'default' | 'sm';

export interface ItemOwnProps {
  /** Leading node — icon, avatar, or thumbnail. */
  leading?: ReactNode;
  /** Primary line. */
  title?: ReactNode;
  /** Secondary line under the title. */
  subtitle?: ReactNode;
  /** Trailing node — chevron, badge, action. */
  trailing?: ReactNode;
  /** `outline` draws a hairline card, `muted` a filled row. @default 'default' */
  variant?: ItemVariant;
  /** Row density. @default 'default' */
  size?: ItemSize;
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
 *
 * Layout lives in `.item` (styles/display.css) rather than inline styles, so a
 * caller's `className` can override padding, grid columns, or colours. The
 * three-column grid only reserves a leading column when a `leading` node is
 * supplied — that is signalled with `data-leading`.
 *
 * Accessibility:
 *   - When rendered as `button`/`a` the whole row is a single focusable target;
 *     pass an `aria-label` if the visible text is ambiguous.
 *   - Trailing affordances (chevron icons) are decorative; mark interactive
 *     trailing controls with their own roles/labels.
 *
 * @example
 * ```tsx
 * <ItemGroup>
 *   <ItemHeader>Recent files</ItemHeader>
 *   <Item as="button" variant="outline" leading={<FileIcon />}
 *         title="invoice.pdf" subtitle="2.1 MB" trailing={<ChevronRight />} />
 *   <ItemSeparator />
 *   <Item size="sm" title="notes.md" />
 *   <ItemFooter>2 of 40</ItemFooter>
 * </ItemGroup>
 * ```
 */
export const Item = forwardRef(function Item<E extends ElementType = 'div'>(
  {
    leading,
    title,
    subtitle,
    trailing,
    variant = 'default',
    size = 'default',
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
      data-slot="item"
      data-variant={variant}
      data-size={size}
      data-leading={leading != null ? '' : undefined}
      {...rest}
    >
      {leading != null ? (
        <span className="item-media" aria-hidden={interactive ? 'true' : undefined}>
          {leading}
        </span>
      ) : null}
      <span className="item-content">
        {title != null ? <span className="item-title">{title}</span> : null}
        {subtitle != null ? <span className="item-subtitle">{subtitle}</span> : null}
        {children}
      </span>
      {trailing != null ? <span className="item-trailing">{trailing}</span> : null}
    </Component>
  );
}) as <E extends ElementType = 'div'>(props: ItemProps<E> & { ref?: Ref<Element> }) => React.ReactElement;

export interface ItemGroupProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

/**
 * ItemGroup — vertical container for a run of `Item`s. Carries `role="list"`
 * so assistive tech announces the row count.
 */
export const ItemGroup = forwardRef<HTMLDivElement, ItemGroupProps>(function ItemGroup(
  { className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} role="list" className={cn('item-group', className)} data-slot="item-group" {...rest}>
      {children}
    </div>
  );
});

export type ItemSeparatorProps = HTMLAttributes<HTMLDivElement>;

/** ItemSeparator — hairline rule between rows of an `ItemGroup`. */
export const ItemSeparator = forwardRef<HTMLDivElement, ItemSeparatorProps>(
  function ItemSeparator({ className, ...rest }, ref) {
    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation="horizontal"
        className={cn('item-separator', className)}
        data-slot="item-separator"
        {...rest}
      />
    );
  },
);

export interface ItemHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

/** ItemHeader — small uppercase caption above a run of rows. */
export const ItemHeader = forwardRef<HTMLDivElement, ItemHeaderProps>(function ItemHeader(
  { className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cn('item-header', className)} data-slot="item-header" {...rest}>
      {children}
    </div>
  );
});

export interface ItemFooterProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

/** ItemFooter — quiet trailing caption under a run of rows (counts, hints). */
export const ItemFooter = forwardRef<HTMLDivElement, ItemFooterProps>(function ItemFooter(
  { className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cn('item-footer', className)} data-slot="item-footer" {...rest}>
      {children}
    </div>
  );
});
