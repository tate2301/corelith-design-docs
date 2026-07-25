"use client";

import {
  forwardRef,
  useId,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';

export interface PageSectionProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Section heading. */
  title?: ReactNode;
  /** Supporting description shown under the title. */
  description?: ReactNode;
  /** Actions aligned to the right of the header (buttons, links). */
  actions?: ReactNode;
  /** Heading level for the title. @default 2 */
  headingLevel?: 2 | 3 | 4;
  children?: ReactNode;
}

/**
 * PageSection — a titled content block with an optional description and header
 * actions. The docs (`p-page-section`) render the heading/description inline
 * (no `.page-section` rule in components.css), so the header typography and
 * spacing are token-driven inline fallbacks.
 *
 * Accessibility:
 *   - Renders a `<section>` labelled by its heading via `aria-labelledby`, so AT
 *     can navigate by region.
 *   - The heading uses a real `h2`/`h3`/`h4` (set `headingLevel`) to preserve
 *     the document outline.
 */
export const PageSection = forwardRef<HTMLElement, PageSectionProps>(function PageSection(
  { title, description, actions, headingLevel = 2, className, children, ...rest },
  ref,
) {
  const baseId = useId();
  const headingId = `${baseId}-title`;
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4';

  return (
    <section
      ref={ref}
      aria-labelledby={title != null ? headingId : undefined}
      className={cn('page-section', className)}
      {...rest}
    >
      {title != null || actions != null ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 16,
            marginBottom: 28,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            {title != null ? (
              <Heading
                id={headingId}
                style={{
                  font: '600 17px/1.3 var(--font-sans)',
                  color: 'var(--text-strong)',
                  margin: '0 0 4px',
                }}
              >
                {title}
              </Heading>
            ) : null}
            {description != null ? (
              <p style={{ font: 'var(--type-body-sm)', color: 'var(--text-muted)', margin: 0 }}>
                {description}
              </p>
            ) : null}
          </div>
          {actions != null ? (
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>{actions}</div>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
});
