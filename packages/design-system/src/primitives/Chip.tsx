import {
  forwardRef,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Optional leading content — typically an icon. */
  leading?: ReactNode;
  /** Optional trailing content — typically a caret or count. Ignored when
   *  `onRemove` is supplied (the remove affordance takes precedence). */
  trailing?: ReactNode;
  /** When provided, renders a trailing remove button. Called when the user
   *  clicks the × icon (event propagation to the chip is stopped). */
  onRemove?: (event: MouseEvent<HTMLSpanElement>) => void;
  /** Accessible label for the remove affordance. @default 'Remove' */
  removeLabel?: string;
  /** Mark the chip as selected (filled, brand-tinted). */
  selected?: boolean;
}

/**
 * Chip — small interactive pill used for filters and removable tags.
 * Maps to the `.chip` class in components.css.
 *
 * Accessibility:
 *  - Rendered as a real `<button>` so it gets focus and keyboard support for
 *    free. Callers should pass `aria-pressed` when the chip is a toggle.
 *  - When `onRemove` is set the × is a separate `role="button"` span with its
 *    own `aria-label` so the chip and its dismiss action are independent.
 */
export const Chip = forwardRef<HTMLButtonElement, ChipProps>(function Chip(
  {
    leading,
    trailing,
    onRemove,
    removeLabel = 'Remove',
    selected,
    className,
    style,
    children,
    type = 'button',
    ...rest
  },
  ref,
) {
  // Selected style trims to brand colors. Done inline to avoid redefining CSS.
  const selectedStyle: React.CSSProperties | undefined = selected
    ? {
        background: 'var(--brand-soft)',
        borderColor: 'var(--brand-100)',
        color: 'var(--brand-strong)',
      }
    : undefined;

  const removeStyle: React.CSSProperties | undefined = onRemove ? { paddingRight: 6 } : undefined;

  return (
    <button
      ref={ref}
      type={type}
      className={cn('chip', className)}
      style={{ ...selectedStyle, ...removeStyle, ...style }}
      {...rest}
    >
      {leading ? <span aria-hidden="true">{leading}</span> : null}
      {children ? <span>{children}</span> : null}
      {onRemove ? (
        <span
          role="button"
          aria-label={removeLabel}
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(e);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              onRemove(e as unknown as MouseEvent<HTMLSpanElement>);
            }
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 16,
            height: 16,
            marginLeft: 2,
            opacity: 0.6,
            cursor: 'pointer',
            borderRadius: 3,
          }}
        >
          {/* Inline × so the chip has no external icon dependency. */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </span>
      ) : trailing ? (
        <span aria-hidden="true">{trailing}</span>
      ) : null}
    </button>
  );
});
