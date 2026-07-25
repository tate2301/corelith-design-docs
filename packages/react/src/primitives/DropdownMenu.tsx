"use client";

import {
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../utils/cn';
import { Slot } from '../utils/Slot';
import { usePosition, type Align, type Side } from '../utils/usePosition';

interface MenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  anchorRef: React.MutableRefObject<HTMLElement | null>;
  contentRef: React.MutableRefObject<HTMLDivElement | null>;
  contentId: string;
  triggerId: string;
}

const MenuContext = createContext<MenuContextValue | null>(null);
const useMenu = () => {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error('DropdownMenu primitive: child must be inside <DropdownMenu>.');
  return ctx;
};

export interface DropdownMenuProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

/**
 * DropdownMenu — a button that toggles a list of actions.
 * Maps to `.menu`, `.menu-item`, `.menu-divider`, `.menu-label` in components.css.
 *
 * Accessibility:
 *   - Trigger: `aria-haspopup="menu"` + `aria-expanded`.
 *   - Content: `role="menu"` (or `role="group"` for the label header).
 *   - Items: `role="menuitem"`. Focus is managed by the menu itself (roving
 *     focus moves on ArrowUp/Down, wraps at edges).
 *   - Enter / Space activates focused item; Escape closes and returns focus to
 *     the trigger; Tab closes and lets focus continue to the next document
 *     focusable.
 *
 * Limitations: not a focus-trap; relies on outside-click + Esc.
 */
export function DropdownMenu({ open: openProp, defaultOpen = false, onOpenChange, children }: DropdownMenuProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp! : uncontrolled;
  const anchorRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const baseId = useId();

  const setOpen = useCallback(
    (v: boolean) => {
      if (!isControlled) setUncontrolled(v);
      onOpenChange?.(v);
    },
    [isControlled, onOpenChange],
  );

  const ctx = useMemo<MenuContextValue>(
    () => ({
      open,
      setOpen,
      anchorRef,
      contentRef,
      contentId: `${baseId}-menu`,
      triggerId: `${baseId}-trigger`,
    }),
    [open, setOpen, baseId],
  );

  return <MenuContext.Provider value={ctx}>{children}</MenuContext.Provider>;
}

export interface DropdownMenuTriggerProps {
  /** Accepts Radix-style trigger composition. This trigger already clones its child. */
  asChild?: boolean;
  children: ReactElement;
}

const DropdownMenuTrigger = forwardRef<HTMLElement, DropdownMenuTriggerProps>(function DropdownMenuTrigger(
  { children },
  ref,
) {
  const ctx = useMenu();
  if (!isValidElement(children)) {
    throw new Error('DropdownMenu.Trigger: children must be a single React element.');
  }
  const childProps = children.props as Record<string, unknown> & {
    onClick?: (e: React.MouseEvent) => void;
    onKeyDown?: (e: React.KeyboardEvent) => void;
    ref?: React.Ref<HTMLElement>;
  };

  const setRefs = (node: HTMLElement | null) => {
    ctx.anchorRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref && typeof ref === 'object')
      (ref as React.MutableRefObject<HTMLElement | null>).current = node;
    const r = childProps.ref;
    if (typeof r === 'function') r(node);
    else if (r && typeof r === 'object') (r as React.MutableRefObject<HTMLElement | null>).current = node;
  };

  return cloneElement(children as ReactElement<Record<string, unknown>>, {
    ref: setRefs,
    id: ctx.triggerId,
    'aria-haspopup': 'menu',
    'aria-expanded': ctx.open,
    'aria-controls': ctx.open ? ctx.contentId : undefined,
    'data-slot': 'dropdown-menu-trigger',
    'data-state': ctx.open ? 'open' : 'closed',
    onClick: (e: React.MouseEvent) => {
      childProps.onClick?.(e);
      ctx.setOpen(!ctx.open);
    },
    onKeyDown: (e: React.KeyboardEvent) => {
      childProps.onKeyDown?.(e);
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        ctx.setOpen(true);
        // Focus first item on next tick.
        requestAnimationFrame(() => {
          const first = ctx.contentRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
          first?.focus();
        });
      }
    },
  });
});

export interface DropdownMenuContentProps extends HTMLAttributes<HTMLDivElement> {
  side?: Side;
  align?: Align;
  sideOffset?: number;
  alignOffset?: number;
}

const DropdownMenuContent = forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  function DropdownMenuContent(
    { side = 'bottom', align = 'start', sideOffset = 6, alignOffset = 0, className, children, style, ...rest },
    ref,
  ) {
    const ctx = useMenu();
    const pos = usePosition(ctx.anchorRef, ctx.contentRef, ctx.open, {
      side,
      align,
      sideOffset,
      alignOffset,
    });

    const setRefs = (node: HTMLDivElement | null) => {
      ctx.contentRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    };

    useEffect(() => {
      if (!ctx.open) return;
      const onDocPointer = (e: PointerEvent) => {
        const t = e.target as Node;
        if (ctx.contentRef.current?.contains(t)) return;
        if (ctx.anchorRef.current?.contains(t)) return;
        ctx.setOpen(false);
      };
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          ctx.setOpen(false);
          ctx.anchorRef.current?.focus();
        } else if (e.key === 'Tab') {
          ctx.setOpen(false);
        }
      };
      document.addEventListener('pointerdown', onDocPointer, true);
      document.addEventListener('keydown', onKey);
      return () => {
        document.removeEventListener('pointerdown', onDocPointer, true);
        document.removeEventListener('keydown', onKey);
      };
    }, [ctx]);

    if (!ctx.open) return null;
    const portalTarget = typeof document !== 'undefined' ? document.body : null;
    if (!portalTarget) return null;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      const items = Array.from(
        ctx.contentRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])') ?? [],
      );
      if (items.length === 0) return;
      const active = document.activeElement as HTMLElement | null;
      const idx = active ? items.indexOf(active) : -1;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        items[(idx + 1 + items.length) % items.length].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        items[(idx - 1 + items.length) % items.length].focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        items[0].focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        items[items.length - 1].focus();
      }
    };

    return createPortal(
      <div
        ref={setRefs}
        id={ctx.contentId}
        role="menu"
        aria-labelledby={ctx.triggerId}
        tabIndex={-1}
        className={cn('menu', className)}
        style={{
          position: 'absolute',
          top: pos?.top ?? -9999,
          left: pos?.left ?? -9999,
          zIndex: 1000,
          ...style,
        }}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {children}
      </div>,
      portalTarget,
    );
  },
);

export interface DropdownMenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Fires when the item is activated (click/Enter/Space). Closes the menu. */
  onSelect?: () => void;
  /** Apply destructive styling. */
  destructive?: boolean;
  /** Render the menu item styles onto the supplied child, Radix Slot-style. */
  asChild?: boolean;
}

const DropdownMenuItem = forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
  function DropdownMenuItem({ onSelect, destructive, asChild, className, children, onClick, disabled, ...rest }, ref) {
    const ctx = useMenu();
    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
      onClick?.(e as React.MouseEvent<HTMLButtonElement>);
      if (disabled) return;
      onSelect?.();
      ctx.setOpen(false);
      ctx.anchorRef.current?.focus();
    };

    if (asChild) {
      return (
        <Slot
          ref={ref as React.Ref<HTMLElement>}
          role="menuitem"
          tabIndex={-1}
          aria-disabled={disabled || undefined}
          data-slot="dropdown-menu-item"
          data-disabled={disabled ? '' : undefined}
          className={cn('menu-item', destructive && 'danger', className)}
          onClick={handleClick}
          {...(rest as React.HTMLAttributes<HTMLElement>)}
        >
          {children as React.ReactElement}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        type="button"
        role="menuitem"
        tabIndex={-1}
        aria-disabled={disabled || undefined}
        data-slot="dropdown-menu-item"
        data-disabled={disabled ? '' : undefined}
        disabled={disabled}
        className={cn('menu-item', destructive && 'danger', className)}
        onClick={handleClick}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

const DropdownMenuSeparator = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function DropdownMenuSeparator({ className, ...rest }, ref) {
    return <div ref={ref} role="separator" className={cn('menu-divider', className)} {...rest} />;
  },
);

const DropdownMenuLabel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function DropdownMenuLabel({ className, children, ...rest }, ref) {
    return (
      <div ref={ref} className={cn('menu-label', className)} {...rest}>
        {children}
      </div>
    );
  },
);

// Attach compound subcomponents.
(DropdownMenu as unknown as Record<string, unknown>).Trigger = DropdownMenuTrigger;
(DropdownMenu as unknown as Record<string, unknown>).Content = DropdownMenuContent;
(DropdownMenu as unknown as Record<string, unknown>).Item = DropdownMenuItem;
(DropdownMenu as unknown as Record<string, unknown>).Separator = DropdownMenuSeparator;
(DropdownMenu as unknown as Record<string, unknown>).Label = DropdownMenuLabel;

export type DropdownMenuComponent = typeof DropdownMenu & {
  Trigger: typeof DropdownMenuTrigger;
  Content: typeof DropdownMenuContent;
  Item: typeof DropdownMenuItem;
  Separator: typeof DropdownMenuSeparator;
  Label: typeof DropdownMenuLabel;
};

export {
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
};
