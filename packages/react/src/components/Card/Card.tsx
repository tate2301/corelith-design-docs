import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import './Card.css';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

const CardRoot = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx('card', className)} {...rest}>
      {children}
    </div>
  );
});

export interface CardHeaderProps extends HTMLAttributes<HTMLElement> {}
function CardHeader({ className, ...rest }: CardHeaderProps) {
  return <header className={cx('card-header', className)} {...rest} />;
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}
function CardTitle({ className, ...rest }: CardTitleProps) {
  return <h3 className={cx('card-title', className)} {...rest} />;
}

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {}
function CardBody({ className, ...rest }: CardBodyProps) {
  return <div className={cx('card-body', className)} {...rest} />;
}

export interface CardFooterProps extends HTMLAttributes<HTMLElement> {}
function CardFooter({ className, ...rest }: CardFooterProps) {
  return <footer className={cx('card-footer', className)} {...rest} />;
}

type CardComponent = typeof CardRoot & {
  Header: typeof CardHeader;
  Title: typeof CardTitle;
  Body: typeof CardBody;
  Footer: typeof CardFooter;
};

/**
 * Card — compound surface with Header / Body / Footer slots.
 *
 * @example
 * ```tsx
 * <Card />
 * ```
 */
export const Card = CardRoot as CardComponent;
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Body = CardBody;
Card.Footer = CardFooter;
