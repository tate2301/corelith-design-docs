import { type ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface DetailViewHero {
  /** Eyebrow text above the title (e.g. "Supplier · SUP-01"). */
  eyebrow?: ReactNode;
  /** The record title. */
  title: ReactNode;
  /** Optional avatar/monogram mark. Renders in the leading tile. */
  mark?: ReactNode;
  /** Mark colour treatment. @default 'ledger' */
  markTone?: 'ledger' | 'gem' | 'person';
  /** Inline meta facts shown under the title (label/value pairs). */
  meta?: Array<{ label: ReactNode; value: ReactNode }>;
  /** Right-aligned actions (buttons, menus). */
  actions?: ReactNode;
}

export interface DetailViewFact {
  /** Field label (rendered small/uppercase). */
  label: ReactNode;
  /** Field value. */
  value: ReactNode;
  /** Render the value in a monospace/tabular style. */
  mono?: boolean;
}

export interface DetailViewSection {
  /** Section id (used as React key). */
  id: string;
  /** Card heading. */
  title: ReactNode;
  /** Optional sub-heading. */
  description?: ReactNode;
  /** Optional header-right slot (e.g. an Edit button). */
  action?: ReactNode;
  /** Section body. */
  content: ReactNode;
}

export interface DetailViewProps {
  /** Top hero band — identity + key actions. */
  hero?: DetailViewHero;
  /** Key/value facts grid rendered as the first detail card. */
  facts?: DetailViewFact[];
  /** Heading for the facts card. @default 'Details' */
  factsTitle?: ReactNode;
  /** Stacked content cards in the main column. */
  sections?: DetailViewSection[];
  /** Right-rail content (activity, related records). When omitted the layout is single-column. */
  aside?: ReactNode;
  /** Extra className on the root. */
  className?: string;
  /** Extra content rendered after the standard cards in the main column. */
  children?: ReactNode;
}

/**
 * DetailView — record-inspection page assembly. Composes the `.detail-page`,
 * `.detail-hero`, `.detail-grid`, `.detail-card` and `.meta-grid` markup into a
 * controlled, prop-driven layout: a hero band, a facts grid, stacked section
 * cards, and an optional right rail (`aside`).
 *
 * @example
 * ```tsx
 * <DetailView
 *   hero={{
 *     eyebrow: 'Supplier · SUP-01',
 *     title: 'Mukamba Group',
 *     mark: 'MG',
 *     meta: [
 *       { label: 'Town', value: 'Harare' },
 *       { label: 'Status', value: <Badge tone="success">Active</Badge> },
 *     ],
 *     actions: <Button variant="primary">Record payment</Button>,
 *   }}
 *   facts={[
 *     { label: 'Outstanding', value: 'US$48,200', mono: true },
 *     { label: 'Terms', value: 'Net 30' },
 *     { label: 'VAT no.', value: '10042318', mono: true },
 *     { label: 'Account', value: 'CBZ · 0123', mono: true },
 *   ]}
 *   sections={[
 *     { id: 'notes', title: 'Notes', content: <p>Pays reliably; prefers EcoCash.</p> },
 *   ]}
 *   aside={<ActivityRail />}
 * />
 * ```
 */
export function DetailView({
  hero,
  facts,
  factsTitle = 'Details',
  sections,
  aside,
  className,
  children,
}: DetailViewProps) {
  const main = (
    <div style={{ display: 'grid', gap: 20, minWidth: 0 }}>
      {facts && facts.length > 0 ? (
        <section className="detail-card">
          <div className="dc-h">
            <span className="ti">{factsTitle}</span>
          </div>
          <div className="dc-body">
            <div className="meta-grid">
              {facts.map((f, i) => (
                <div key={i}>
                  <span className="k">{f.label}</span>
                  <span className={cn('v', f.mono && 'mono')}>{f.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {sections?.map((s) => (
        <section className="detail-card" key={s.id}>
          <div className="dc-h">
            <div>
              <span className="ti">{s.title}</span>
              {s.description ? <div className="sub">{s.description}</div> : null}
            </div>
            {s.action}
          </div>
          <div className="dc-body">{s.content}</div>
        </section>
      ))}

      {children}
    </div>
  );

  return (
    <div className={cn('detail-page', className)}>
      {hero ? <DetailHeroBand {...hero} /> : null}
      {aside ? (
        <div className="detail-grid">
          {main}
          <aside style={{ display: 'grid', gap: 20, alignSelf: 'start' }}>{aside}</aside>
        </div>
      ) : (
        main
      )}
    </div>
  );
}

function DetailHeroBand({ eyebrow, title, mark, markTone = 'ledger', meta, actions }: DetailViewHero) {
  return (
    <header className="detail-hero">
      {mark ? <div className={cn('dh-mark', markTone)} aria-hidden="true">{mark}</div> : <div />}
      <div style={{ minWidth: 0 }}>
        {eyebrow ? <div className="dh-eyebrow">{eyebrow}</div> : null}
        <h1>{title}</h1>
        {meta && meta.length > 0 ? (
          <div className="dh-meta">
            {meta.map((m, i) => (
              <span key={i}>
                {m.label}: <strong>{m.value}</strong>
              </span>
            ))}
          </div>
        ) : null}
      </div>
      {actions ? <div className="dh-actions">{actions}</div> : <div />}
    </header>
  );
}
