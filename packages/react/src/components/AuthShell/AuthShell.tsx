import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import './AuthShell.css';

export interface AuthShellProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

const AuthShellRoot = forwardRef<HTMLDivElement, AuthShellProps>(function AuthShell(
  { className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx('auth-shell', className)} {...rest}>
      {children}
    </div>
  );
});

export interface AuthShellBrandProps extends HTMLAttributes<HTMLElement> {
  logo?: ReactNode;
  product?: ReactNode;
}

function AuthShellBrand({ logo, product, className, children, ...rest }: AuthShellBrandProps) {
  return (
    <header className={cx('auth-brand', className)} {...rest}>
      {logo ? <span className="auth-brand-logo">{logo}</span> : null}
      {product ? <span className="auth-brand-product">{product}</span> : null}
      {children}
    </header>
  );
}

export interface AuthShellCardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode;
  subtitle?: ReactNode;
  footer?: ReactNode;
}

function AuthShellCard({ title, subtitle, footer, className, children, ...rest }: AuthShellCardProps) {
  return (
    <section className={cx('auth-card', className)} {...rest}>
      {title || subtitle ? (
        <header className="auth-card-header">
          {title ? <h1 className="auth-card-title">{title}</h1> : null}
          {subtitle ? <p className="auth-card-subtitle">{subtitle}</p> : null}
        </header>
      ) : null}
      <div className="auth-card-body">{children}</div>
      {footer ? <footer className="auth-card-footer">{footer}</footer> : null}
    </section>
  );
}

type AuthShellComponent = typeof AuthShellRoot & {
  Brand: typeof AuthShellBrand;
  Card: typeof AuthShellCard;
};

export const AuthShell = AuthShellRoot as AuthShellComponent;
AuthShell.Brand = AuthShellBrand;
AuthShell.Card = AuthShellCard;
