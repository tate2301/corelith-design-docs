import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../utils/cx';

export interface PopoverProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  /** Show a small arrow pointing back at the anchor. */
  arrow?: boolean;
  /** Close on outside click (default true). */
  dismissOnOutside?: boolean;
  /** Close on Escape (default true). */
  dismissOnEscape?: boolean;
}

/**
 * Popover — anchored floating panel.
 *
 * @example
 * ```tsx
 * <Popover />
 * ```
 */
export const Popover = forwardRef<HTMLDivElement, PopoverProps>(function Popover(
  {
    open,
    onClose,
    title,
    arrow,
    dismissOnOutside = true,
    dismissOnEscape = true,
    className,
    children,
    ...rest
  },
  ref,
) {
  const innerRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();

  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      innerRef.current = el;
      if (typeof ref === 'function') ref(el);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
    },
    [ref],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissOnEscape) {
        e.preventDefault();
        onClose();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!dismissOnOutside) return;
      const node = innerRef.current;
      if (node && !node.contains(e.target as Node)) onClose();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open, onClose, dismissOnEscape, dismissOnOutside]);

  if (!open) return null;
  return (
    <div
      ref={setRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby={title ? titleId : undefined}
      className={cx('popover', className)}
      {...rest}
    >
      {arrow ? <span className="pop-arrow" aria-hidden="true" /> : null}
      {title ? (
        <div className="pop-h">
          <span id={titleId} className="ti">{title}</span>
          <button type="button" className="x" aria-label="Close" onClick={onClose}>×</button>
        </div>
      ) : null}
      {children}
    </div>
  );
});
