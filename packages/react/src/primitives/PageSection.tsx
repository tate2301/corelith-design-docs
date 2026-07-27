"use client";

import {
  forwardRef,
  useId,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';
import { Badge } from './Badge';

export interface PageSectionProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Section heading. */
  title?: ReactNode;
  /** Supporting description shown under the title. */
  description?: ReactNode;
  /** Actions aligned to the right of the header (buttons, links). */
  actions?: ReactNode;
  /** Heading level for the title. @default 2 */
  headingLevel?: 2 | 3 | 4;
  /** Extra classes for the `<header>` element (the outer `className` lands on
   *  the `<section>`). */
  headerClassName?: string;
  /** Inline styles for the `<header>` element. */
  headerStyle?: CSSProperties;
  /** Draw the header as a boxed panel — border, muted fill, radius, padding.
   *  @default false */
  framed?: boolean;
  /** Sits next to the title. A `string`/`number` is coerced into a
   *  `<Badge tone="outline">`; any other node is rendered as-is. */
  badge?: ReactNode;
  /** Render the header but suppress `children`. @default false */
  collapsed?: boolean;
  children?: ReactNode;
}

/**
 * PageSection — a titled content block with an optional description, badge and
 * header actions. Maps to the `.page-section` family in surfaces.css.
 *
 * `className` lands on the `<section>`; use `headerClassName` / `headerStyle`
 * to reach the `<header>`.
 *
 * @example
 * <PageSection
 *   title="Line items"
 *   description="Everything on this quote."
 *   badge={3}
 *   actions={<Button size="sm">Add</Button>}
 * >
 *   <Table />
 * </PageSection>
 *
 * @example
 * // Boxed header, body hidden while the step is folded away.
 * <PageSection title="Delivery" framed collapsed={!open}>
 *   <AddressForm />
 * </PageSection>
 *
 * Accessibility:
 *   - Renders a `<section>` labelled by its heading via `aria-labelledby`, so AT
 *     can navigate by region.
 *   - The heading uses a real `h2`/`h3`/`h4` (set `headingLevel`) to preserve
 *     the document outline.
 *   - `collapsed` removes the children from the accessibility tree entirely; if
 *     the section is toggleable, pair the trigger with `aria-expanded`.
 */
export const PageSection = forwardRef<HTMLElement, PageSectionProps>(function PageSection(
  {
    title,
    description,
    actions,
    headingLevel = 2,
    headerClassName,
    headerStyle,
    framed = false,
    badge,
    collapsed = false,
    className,
    children,
    ...rest
  },
  ref,
) {
  const baseId = useId();
  const headingId = `${baseId}-title`;
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4';
  const hasHeader = title != null || actions != null || badge != null;

  const badgeNode =
    badge == null ? null : (
      <span className="page-section-badge">
        {typeof badge === 'string' || typeof badge === 'number' ? (
          <Badge tone="outline">{badge}</Badge>
        ) : (
          badge
        )}
      </span>
    );

  return (
    <section
      ref={ref}
      aria-labelledby={title != null ? headingId : undefined}
      className={cn('page-section', className)}
      {...rest}
    >
      {hasHeader ? (
        <header
          className={cn('page-section-header', framed && 'is-framed', headerClassName)}
          style={headerStyle}
        >
          <div className="page-section-heading">
            {title != null || badgeNode != null ? (
              <div className="page-section-titlerow">
                {title != null ? (
                  <Heading id={headingId} className="page-section-title">
                    {title}
                  </Heading>
                ) : null}
                {badgeNode}
              </div>
            ) : null}
            {description != null ? <p className="page-section-desc">{description}</p> : null}
          </div>
          {actions != null ? <div className="page-section-actions">{actions}</div> : null}
        </header>
      ) : null}
      {collapsed ? null : children}
    </section>
  );
});

export interface WorkflowStepProps extends PageSectionProps {
  /** Boxed header. Unlike `PageSection`, this preset defaults to `true`. */
  framed?: boolean;
}

/**
 * WorkflowStep — a `PageSection` preset with the boxed header switched on. It
 * is the shared component behind huchu's `workflow-step.tsx` and
 * `page-section.tsx`, whose header markup was byte-identical.
 *
 * @example
 * <WorkflowStep title="2. Pick a warehouse" badge="Required" collapsed={!open}>
 *   <WarehousePicker />
 * </WorkflowStep>
 */
export const WorkflowStep = forwardRef<HTMLElement, WorkflowStepProps>(function WorkflowStep(
  { framed = true, ...rest },
  ref,
) {
  return <PageSection ref={ref} framed={framed} {...rest} />;
});
