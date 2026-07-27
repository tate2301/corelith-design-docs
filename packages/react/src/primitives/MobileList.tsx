"use client";

import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';
import { Slot } from '../utils/Slot';

export interface MobileListProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

/**
 * MobileList — a touch-friendly list container with hairline-divided rows.
 * Maps to `.mobile-list` in mobile.css; the card chrome (surface, border,
 * radius, clipped corners) lives entirely in CSS.
 *
 * Two composition styles are supported:
 *   - `MobileList.Row` / `MobileListRow` — the four-slot shorthand.
 *   - `MobileListItem` + `MobileListIcon` / `MobileListContent` / … — full
 *     control over the row anatomy.
 *
 * Accessibility:
 *   - Container is `role="list"`; each Row is `role="listitem"`. Interactive
 *     rows render as buttons so they are keyboard-activatable.
 *
 * @example
 * <MobileList>
 *   <MobileList.Row title="Mukamba Group" subtitle="Supplier" trailing="$48k" />
 * </MobileList>
 *
 * @example
 * <MobileList>
 *   <MobileListSectionHeader>Today</MobileListSectionHeader>
 *   <MobileListItem variant="touchable" href="/orders/1">
 *     <MobileListIcon variant="brand">MG</MobileListIcon>
 *     <MobileListContent>
 *       <MobileListTitle>Mukamba Group</MobileListTitle>
 *       <MobileListSubtitle>Supplier</MobileListSubtitle>
 *     </MobileListContent>
 *     <MobileListMeta>
 *       <MobileListMetaText>$48k</MobileListMetaText>
 *     </MobileListMeta>
 *     <MobileListChevron />
 *   </MobileListItem>
 * </MobileList>
 */
const MobileListRoot = forwardRef<HTMLDivElement, MobileListProps>(function MobileList(
  { className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      role="list"
      data-slot="mobile-list"
      className={cn('mobile-list', className)}
      {...rest}
    >
      {children}
    </div>
  );
});

/* ── Row (shorthand API) ─────────────────────────────────────────────────── */

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

/**
 * MobileListRow — the four-slot shorthand row. Maps to `.mobile-list-row`.
 * Also reachable as `MobileList.Row`.
 *
 * @example
 * <MobileListRow leading={<Icon />} title="Invoice #204" subtitle="Due today" static />
 */
const MobileListRow = forwardRef<HTMLButtonElement, MobileListRowProps>(function MobileListRow(
  { leading, title, subtitle, trailing, static: isStatic, className, children, ...rest },
  ref,
) {
  const rowClass = cn('mobile-list-row', className);

  const inner = (
    <>
      {leading != null ? (
        <div className="mobile-list-row-leading" aria-hidden="true">
          {leading}
        </div>
      ) : null}
      <div className="mobile-list-row-body">
        {title != null ? <div className="mobile-list-row-title">{title}</div> : null}
        {subtitle != null ? <div className="mobile-list-row-subtitle">{subtitle}</div> : null}
        {children}
      </div>
      <span className="mobile-list-row-trailing" aria-hidden="true">
        {trailing ?? (isStatic ? null : '›')}
      </span>
    </>
  );

  if (isStatic) {
    return (
      <div
        role="listitem"
        data-slot="mobile-list-row"
        data-leading={leading != null ? 'true' : undefined}
        data-static="true"
        className={rowClass}
      >
        {inner}
      </div>
    );
  }

  return (
    <div role="listitem" style={{ display: 'contents' }}>
      <button
        ref={ref}
        type="button"
        data-slot="mobile-list-row"
        data-leading={leading != null ? 'true' : undefined}
        className={rowClass}
        {...rest}
      >
        {inner}
      </button>
    </div>
  );
});

/* ── Item (composable API) ───────────────────────────────────────────────── */

export type MobileListItemVariant = 'default' | 'compact' | 'touchable';

export interface MobileListItemProps extends HTMLAttributes<HTMLDivElement> {
  /** Row density. `touchable` adds a generous hit area and a pointer cursor.
   *  @default 'default' */
  variant?: MobileListItemVariant;
  /** Merge the item's props onto a single child element instead of a wrapper. */
  asChild?: boolean;
  /** Render an `<a>` and link the whole row. Ignored when `asChild` is set. */
  href?: string;
}

/**
 * MobileListItem — one composable row inside a `MobileList`. Maps to
 * `.mobile-list-item` (+ `--compact`, `--touchable`).
 *
 * Renders an `<a>` when `href` is set, the supplied child when `asChild` is
 * set, and a `<div>` otherwise.
 *
 * @example
 * <MobileListItem variant="touchable" onClick={open}>…</MobileListItem>
 */
export const MobileListItem = forwardRef<HTMLDivElement, MobileListItemProps>(
  function MobileListItem({ variant = 'default', asChild, href, className, children, ...rest }, ref) {
    const props = {
      'data-slot': 'mobile-list-item',
      'data-variant': variant,
      className: cn(
        'mobile-list-item',
        variant !== 'default' && `mobile-list-item--${variant}`,
        className,
      ),
      ...rest,
    };

    if (asChild) {
      return (
        <Slot ref={ref as React.Ref<HTMLElement>} {...props}>
          {children as ReactElement}
        </Slot>
      );
    }

    if (href !== undefined) {
      return (
        <a
          ref={ref as unknown as React.Ref<HTMLAnchorElement>}
          href={href}
          {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </a>
      );
    }

    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    );
  },
);

export type MobileListIconVariant = 'default' | 'brand' | 'ghost' | 'image';

export interface MobileListIconProps extends HTMLAttributes<HTMLDivElement> {
  /** Tile treatment. `image` clips a child `<img>` to the tile.
   *  @default 'default' */
  variant?: MobileListIconVariant;
}

/**
 * MobileListIcon — the leading tile of a `MobileListItem`. Maps to
 * `.mobile-list-icon` (+ `--brand`, `--ghost`, `--image`).
 *
 * @example
 * <MobileListIcon variant="image"><img src={logo} alt="" /></MobileListIcon>
 */
export const MobileListIcon = forwardRef<HTMLDivElement, MobileListIconProps>(
  function MobileListIcon({ variant = 'default', className, children, ...rest }, ref) {
    return (
      <div
        ref={ref}
        data-slot="mobile-list-icon"
        data-variant={variant}
        className={cn(
          'mobile-list-icon',
          variant !== 'default' && `mobile-list-icon--${variant}`,
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

export type MobileListContentProps = HTMLAttributes<HTMLDivElement>;

/**
 * MobileListContent — the flexible text column of a row. Maps to
 * `.mobile-list-content`.
 *
 * @example
 * <MobileListContent><MobileListTitle>Invoice #204</MobileListTitle></MobileListContent>
 */
export const MobileListContent = forwardRef<HTMLDivElement, MobileListContentProps>(
  function MobileListContent({ className, children, ...rest }, ref) {
    return (
      <div
        ref={ref}
        data-slot="mobile-list-content"
        className={cn('mobile-list-content', className)}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

export type MobileListTitleProps = HTMLAttributes<HTMLDivElement>;

/**
 * MobileListTitle — primary line of a row; truncates on overflow. Maps to
 * `.mobile-list-title`.
 *
 * @example
 * <MobileListTitle>Mukamba Group</MobileListTitle>
 */
export const MobileListTitle = forwardRef<HTMLDivElement, MobileListTitleProps>(
  function MobileListTitle({ className, children, ...rest }, ref) {
    return (
      <div
        ref={ref}
        data-slot="mobile-list-title"
        className={cn('mobile-list-title', className)}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

export type MobileListSubtitleProps = HTMLAttributes<HTMLParagraphElement>;

/**
 * MobileListSubtitle — secondary line of a row, rendered as a `<p>`. Maps to
 * `.mobile-list-subtitle`.
 *
 * @example
 * <MobileListSubtitle>Supplier · Harare</MobileListSubtitle>
 */
export const MobileListSubtitle = forwardRef<HTMLParagraphElement, MobileListSubtitleProps>(
  function MobileListSubtitle({ className, children, ...rest }, ref) {
    return (
      <p
        ref={ref}
        data-slot="mobile-list-subtitle"
        className={cn('mobile-list-subtitle', className)}
        {...rest}
      >
        {children}
      </p>
    );
  },
);

export type MobileListMetaProps = HTMLAttributes<HTMLDivElement>;

/**
 * MobileListMeta — right-aligned trailing column (amounts, timestamps). Maps
 * to `.mobile-list-meta`.
 *
 * @example
 * <MobileListMeta><MobileListMetaText>$48k</MobileListMetaText></MobileListMeta>
 */
export const MobileListMeta = forwardRef<HTMLDivElement, MobileListMetaProps>(
  function MobileListMeta({ className, children, ...rest }, ref) {
    return (
      <div
        ref={ref}
        data-slot="mobile-list-meta"
        className={cn('mobile-list-meta', className)}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

export type MobileListMetaTextProps = HTMLAttributes<HTMLSpanElement>;

/**
 * MobileListMetaText — a tabular-numeral line inside `MobileListMeta`. Maps to
 * `.mobile-list-meta-text`.
 *
 * @example
 * <MobileListMetaText>12:04</MobileListMetaText>
 */
export const MobileListMetaText = forwardRef<HTMLSpanElement, MobileListMetaTextProps>(
  function MobileListMetaText({ className, children, ...rest }, ref) {
    return (
      <span
        ref={ref}
        data-slot="mobile-list-meta-text"
        className={cn('mobile-list-meta-text', className)}
        {...rest}
      >
        {children}
      </span>
    );
  },
);

export type MobileListChevronProps = HTMLAttributes<HTMLSpanElement>;

/**
 * MobileListChevron — the "drills in" affordance at the end of a row. Maps to
 * `.mobile-list-chevron`. Renders an inline chevron so the package keeps zero
 * icon dependencies; pass `children` to swap the glyph.
 *
 * Accessibility: decorative — marked `aria-hidden`.
 *
 * @example
 * <MobileListChevron />
 */
export const MobileListChevron = forwardRef<HTMLSpanElement, MobileListChevronProps>(
  function MobileListChevron({ className, children, ...rest }, ref) {
    return (
      <span
        ref={ref}
        data-slot="mobile-list-chevron"
        aria-hidden="true"
        className={cn('mobile-list-chevron', className)}
        {...rest}
      >
        {children ?? (
          /* Inline chevron so the row has no external icon dependency. */
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        )}
      </span>
    );
  },
);

export type MobileListBadgeProps = HTMLAttributes<HTMLDivElement>;

/**
 * MobileListBadge — non-shrinking wrapper for a `Badge` or status pill inside a
 * row. Maps to `.mobile-list-badge`.
 *
 * @example
 * <MobileListBadge><Badge tone="warn">Overdue</Badge></MobileListBadge>
 */
export const MobileListBadge = forwardRef<HTMLDivElement, MobileListBadgeProps>(
  function MobileListBadge({ className, children, ...rest }, ref) {
    return (
      <div
        ref={ref}
        data-slot="mobile-list-badge"
        className={cn('mobile-list-badge', className)}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

export type MobileListSectionHeaderProps = HTMLAttributes<HTMLDivElement>;

/**
 * MobileListSectionHeader — a sticky-looking group label between runs of rows.
 * Maps to `.mobile-list-section-header`.
 *
 * @example
 * <MobileListSectionHeader>Yesterday</MobileListSectionHeader>
 */
export const MobileListSectionHeader = forwardRef<HTMLDivElement, MobileListSectionHeaderProps>(
  function MobileListSectionHeader({ className, children, ...rest }, ref) {
    return (
      <div
        ref={ref}
        data-slot="mobile-list-section-header"
        className={cn('mobile-list-section-header', className)}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

export interface MobileListEmptyProps extends HTMLAttributes<HTMLDivElement> {
  /** Optional glyph shown above the message in a framed tile. */
  icon?: ReactNode;
}

/**
 * MobileListEmpty — the zero-state slot for a `MobileList`. Maps to
 * `.mobile-list-empty`; `children` render as the message paragraph.
 *
 * @example
 * <MobileListEmpty icon={<InboxIcon />}>No orders yet</MobileListEmpty>
 */
export const MobileListEmpty = forwardRef<HTMLDivElement, MobileListEmptyProps>(
  function MobileListEmpty({ icon, className, children, ...rest }, ref) {
    return (
      <div
        ref={ref}
        data-slot="mobile-list-empty"
        className={cn('mobile-list-empty', className)}
        {...rest}
      >
        {icon != null ? (
          <div className="mobile-list-empty-icon" aria-hidden="true">
            {icon}
          </div>
        ) : null}
        <p className="mobile-list-empty-text">{children}</p>
      </div>
    );
  },
);

/* ── Compound export ─────────────────────────────────────────────────────── */

export type MobileListComponent = typeof MobileListRoot & {
  Row: typeof MobileListRow;
};

/**
 * The `as unknown as Record<string, unknown>` cast this file used to carry made
 * `MobileList.Row` invisible to TypeScript. `Object.assign` returns the
 * intersection type, so the compound access typechecks without a cast.
 */
export const MobileList: MobileListComponent = Object.assign(MobileListRoot, {
  Row: MobileListRow,
});

export { MobileListRow };
