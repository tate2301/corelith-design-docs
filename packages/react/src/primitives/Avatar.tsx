"use client";

import { forwardRef, useState, type HTMLAttributes } from 'react';
import { cn } from '../utils/cn';
import { Slot } from '../utils/Slot';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';
export type AvatarTone = 'default' | 'clay' | 'ink';

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** Image URL. If loading fails (or not provided), initials are shown. */
  src?: string;
  /** Full name — used to derive initials and as the default `alt` text. */
  name?: string;
  /** Sizing. @default 'md' */
  size?: AvatarSize;
  /** Visual tone of the initials fallback. @default 'default' */
  tone?: AvatarTone;
  /** Override the `alt` text for the `<img>` (defaults to `name`). */
  alt?: string;
  /** Render the avatar root onto the supplied child, Radix Slot-style. */
  asChild?: boolean;
}

// Map our four sizes onto the two CSS variants (`.sm`, `.lg`) and a default.
// `xs` and `sm` both compose `.sm` since CSS only defines those two.
const SIZE_CLASS: Record<AvatarSize, string | undefined> = {
  xs: 'sm',
  sm: 'sm',
  md: undefined,
  lg: 'lg',
};

const TONE_CLASS: Record<AvatarTone, string | undefined> = {
  default: undefined,
  clay: 'clay',
  ink: 'ink',
};

/** Derive up-to-two-character initials from a full name. */
function initialsFrom(name?: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

/**
 * Avatar — circular identity tile. Renders an `<img>` when `src` is provided
 * and loads successfully; otherwise falls back to derived initials.
 * Maps to the `.avatar` class in components.css.
 *
 * Accessibility:
 *  - Image avatars receive `alt` text (defaults to `name`, empty string when
 *    purely decorative).
 *  - Initials avatars expose the full `name` via `aria-label` and hide the
 *    visual letters with `aria-hidden` so screen readers don't read "FM".
 */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  {
    src,
    name,
    size = 'md',
    tone = 'default',
    alt,
    asChild,
    className,
    children,
    ...rest
  },
  ref,
) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;
  const initials = initialsFrom(name);

  const classes = cn('avatar', SIZE_CLASS[size], TONE_CLASS[tone], className);
  const content = showImage ? (
    <img
      src={src}
      alt={alt ?? name ?? ''}
      onError={() => setFailed(true)}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  ) : (
    <span aria-hidden="true">{children ?? initials}</span>
  );
  const props = {
    ref: ref as React.Ref<HTMLElement>,
    className: classes,
    'aria-label': !showImage && name ? name : undefined,
    'data-slot': 'avatar',
    ...rest,
  };

  if (asChild) {
    return <Slot {...props} slottedChildren={content}>{children as React.ReactElement}</Slot>;
  }

  return (
    <span {...props}>
      {content}
    </span>
  );
});
