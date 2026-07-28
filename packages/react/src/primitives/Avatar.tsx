"use client";

import { forwardRef, useState, type HTMLAttributes } from 'react';
import { cn } from '../utils/cn';
import { Slot } from '../utils/Slot';
import { accentFor, type Accent } from '../tokens/accents';

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
  /**
   * Accent hue for the initials fallback. Pass `'auto'` to derive it from
   * `name`, which is the default — see the note on colour below.
   */
  accent?: Accent | 'auto';
  /** Fill the accent solid instead of its soft tint. */
  solid?: boolean;
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
 * **Colour.** The initials fallback is tinted by `accent`, which defaults to a
 * hash of `name`. That is what stops a list of people reading as a column of
 * identical gray discs: the same person gets the same hue on every client and
 * in every session, with nothing stored and nothing to assign. Pass an explicit
 * hue to override, or `accent="gray"` for the old monochrome look.
 *
 * `tone` still wins when set to `clay` or `ink` — those are deliberate
 * one-off treatments, not part of the accent rotation.
 *
 * Accessibility:
 *  - Image avatars receive `alt` text (defaults to `name`, empty string when
 *    purely decorative).
 *  - Initials avatars expose the full `name` via `aria-label` and hide the
 *    visual letters with `aria-hidden` so screen readers don't read "FM".
 *
 * @example
 * ```tsx
 * <Avatar name="Alicia Reed" />                    // hashed hue
 * <Avatar name="Alicia Reed" accent="violet" />    // pinned hue
 * <Avatar name="Alicia Reed" accent="gray" />      // monochrome
 * ```
 */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  {
    src,
    name,
    size = 'md',
    tone = 'default',
    accent = 'auto',
    solid,
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

  // `clay` and `ink` are complete treatments of their own — they paint both
  // background and foreground, so layering an accent on top would fight them.
  const accented = tone === 'default';
  const hue = accent === 'auto' ? accentFor(name) : accent;

  const classes = cn(
    'avatar',
    SIZE_CLASS[size],
    TONE_CLASS[tone],
    accented && 'avatar-accent',
    accented && solid && 'avatar-accent-solid',
    className,
  );
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
    // Set even behind an image so a ring, badge or hover chrome drawn by the
    // caller can inherit the same hue.
    'data-accent': accented ? hue : undefined,
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
