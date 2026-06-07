import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';

export interface MenuProps extends HTMLAttributes<HTMLDivElement> {
  ariaLabel?: string;
}

const MenuRoot = forwardRef<HTMLDivElement, MenuProps>(function Menu(
  { ariaLabel, className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      role="menu"
      aria-label={ariaLabel}
      className={cx('menu', className)}
      {...rest}
    >
      {children}
    </div>
  );
});

export interface MenuLabelProps extends HTMLAttributes<HTMLDivElement> {}

function MenuLabel({ className, ...rest }: MenuLabelProps) {
  return <div className={cx('menu-label', className)} {...rest} />;
}

export interface MenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  shortcut?: ReactNode;
  /** Marks the item as a destructive action. */
  destructive?: boolean;
}

function MenuItem({ icon, shortcut, destructive, className, children, ...rest }: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      className={cx('menu-item', destructive && 'danger', className)}
      {...rest}
    >
      <span className="icon" aria-hidden="true">{icon}</span>
      <span>{children}</span>
      {shortcut ? <span className="shortcut">{shortcut}</span> : null}
    </button>
  );
}

function MenuDivider() {
  return <div className="menu-divider" role="separator" />;
}

type MenuComponent = typeof MenuRoot & {
  Item: typeof MenuItem;
  Label: typeof MenuLabel;
  Divider: typeof MenuDivider;
  /** Alias for `Divider` — recipes use both spellings. */
  Separator: typeof MenuDivider;
};

export const Menu = MenuRoot as MenuComponent;
Menu.Item = MenuItem;
Menu.Label = MenuLabel;
Menu.Divider = MenuDivider;
Menu.Separator = MenuDivider;
