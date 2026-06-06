import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../utils/cx';

export type AvatarSize = 'sm' | 'md' | 'lg';
export type AvatarTone = 'default' | 'clay' | 'ink';

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  size?: AvatarSize;
  tone?: AvatarTone;
  /** Name used to derive 1–2 letter initials when no `src` is provided. */
  name?: string;
  src?: string;
  alt?: string;
  /** Override the auto-generated initials. */
  initials?: string;
}

function deriveInitials(name?: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { size = 'md', tone = 'default', name, src, alt, initials, className, children, ...rest },
  ref,
) {
  const sizeClass = size === 'md' ? null : size;
  const toneClass = tone === 'default' ? null : tone;
  const label = initials ?? deriveInitials(name);
  return (
    <span
      ref={ref}
      className={cx('avatar', sizeClass, toneClass, className)}
      role={src ? undefined : 'img'}
      aria-label={src ? undefined : (alt ?? name)}
      {...rest}
    >
      {src ? <img src={src} alt={alt ?? name ?? ''} width="100%" height="100%" /> : (children ?? label)}
    </span>
  );
});
