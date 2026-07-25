import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface FormShellProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Sticky page header slot — title + description. Stays pinned to the top
   * while the sectioned body scrolls. Maps to `.dash-page-h`.
   */
  header?: ReactNode;
  /**
   * Sticky footer slot — the save/cancel action bar. Belongs at the bottom,
   * near the last field (never at the top). Typically autosave hint + Cancel /
   * Save draft / Save buttons.
   */
  footer?: ReactNode;
  /**
   * When true the body scrolls between the sticky header and footer; when false
   * the page scrolls. @default true
   */
  scrollBody?: boolean;
}

interface FormSectionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Section title (e.g. "Identity", "Class"). */
  title?: ReactNode;
  /** Optional helper text under the title. */
  description?: ReactNode;
}

/**
 * FormShell.Section — one topic group inside a form, rendered as a card.
 * Break forms into sections by topic; each section is a card.
 */
function FormShellSection({
  title,
  description,
  className,
  children,
  style,
  ...rest
}: FormSectionProps) {
  return (
    <section
      className={cn('form-shell-section', className)}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '20px 22px',
        ...style,
      }}
      {...rest}
    >
      {title || description ? (
        <header className="form-shell-section-h" style={{ marginBottom: 14 }}>
          {title ? (
            <div
              className="form-shell-section-title"
              style={{
                font: '600 14px/1.3 var(--font-sans)',
                color: 'var(--text-strong)',
              }}
            >
              {title}
            </div>
          ) : null}
          {description ? (
            <p
              className="form-shell-section-desc"
              style={{
                font: 'var(--type-body-sm)',
                color: 'var(--text-muted)',
                margin: '4px 0 0',
              }}
            >
              {description}
            </p>
          ) : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}
FormShellSection.displayName = 'FormShell.Section';

type FormShellComponent = ReturnType<typeof forwardRef<HTMLDivElement, FormShellProps>> & {
  Section: typeof FormShellSection;
};

/**
 * FormShell — the standing layout for a full-page form: a sticky header, a
 * scrollable body of `<FormShell.Section>` cards, and a sticky save/cancel
 * footer pinned to the bottom.
 *
 * @example
 * ```tsx
 * <FormShell
 *   header={
 *     <PageHeader
 *       title="Enroll new student"
 *       subtitle="Capture demographics, guardians, and the starting term."
 *     />
 *   }
 *   footer={
 *     <>
 *       <span>All changes save automatically</span>
 *       <span style={{ flex: 1 }} />
 *       <Button variant="ghost">Cancel</Button>
 *       <Button variant="secondary">Save draft</Button>
 *       <Button variant="primary">Enroll &amp; open record</Button>
 *     </>
 *   }
 * >
 *   <FormShell.Section title="Identity">
 *     <Field label="First name"><Input placeholder="Tariro" /></Field>
 *     <Field label="Last name"><Input placeholder="Moyo" /></Field>
 *   </FormShell.Section>
 *   <FormShell.Section title="Class" description="Where the student starts.">
 *     <Field label="Form"><Select>…</Select></Field>
 *   </FormShell.Section>
 * </FormShell>
 * ```
 */
const FormShellBase = forwardRef<HTMLDivElement, FormShellProps>(function FormShell(
  { header, footer, scrollBody = true, className, children, style, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('form-shell', className)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        minWidth: 0,
        ...style,
      }}
      {...rest}
    >
      {header ? (
        <header
          className="dash-page-h form-shell-header"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 2,
            flex: '0 0 auto',
            background: 'var(--canvas)',
            paddingBottom: 20,
            marginBottom: 8,
          }}
        >
          {header}
        </header>
      ) : null}

      <div
        className="form-shell-body"
        style={
          scrollBody
            ? { flex: 1, minHeight: 0, overflowY: 'auto', display: 'grid', gap: 24, padding: 1 }
            : { flex: '0 0 auto', display: 'grid', gap: 24, padding: 1 }
        }
      >
        {children}
      </div>

      {footer ? (
        <footer
          className="form-shell-footer"
          style={{
            position: 'sticky',
            bottom: 0,
            zIndex: 2,
            flex: '0 0 auto',
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '12px 20px',
            marginTop: 24,
            font: 'var(--type-caption)',
            color: 'var(--text-muted)',
          }}
        >
          {footer}
        </footer>
      ) : null}
    </div>
  );
});

export const FormShell = FormShellBase as FormShellComponent;
FormShell.Section = FormShellSection;
