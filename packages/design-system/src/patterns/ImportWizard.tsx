import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';
import { Button } from '../primitives/Button';

export interface WizardStepContext<Data> {
  /** Current shared wizard data. */
  data: Data;
  /** Merge a partial update into the shared data. */
  setData: (patch: Partial<Data>) => void;
  /** Advance to the next step (no-op on the last). */
  next: () => void;
  /** Go back a step (no-op on the first). */
  back: () => void;
  /** Zero-based index of the active step. */
  index: number;
  /** Whether this is the final step. */
  isLast: boolean;
}

export interface WizardStep<Data> {
  /** Stable id (React key). */
  id: string;
  /** Short label for the stepper. */
  label: ReactNode;
  /** Optional sub-label / hint. */
  description?: ReactNode;
  /** Render the step body. Receives the wizard context. */
  render: (ctx: WizardStepContext<Data>) => ReactNode;
  /** Gate "Next" — return false (or a string error) to block advancing. */
  validate?: (data: Data) => boolean | string;
}

export interface ImportWizardProps<Data> {
  /** Ordered step configs. A typical import is upload → map → preview → confirm. */
  steps: WizardStep<Data>[];
  /** Initial shared data. */
  initialData: Data;
  /** Fires when the final step's primary button is pressed. */
  onComplete: (data: Data) => void | Promise<void>;
  /** Fires if the user cancels the wizard. */
  onCancel?: () => void;
  /** Label for the final-step button. @default 'Finish' */
  finishLabel?: ReactNode;
  /** Show a busy state on the finish button. */
  completing?: boolean;
  /** Extra className. */
  className?: string;
}

/**
 * ImportWizard — a multi-step wizard with a built-in step state machine and the
 * `.steps` numbered indicator. Designed for data-import flows
 * (upload → map columns → preview → confirm) but works for any ordered wizard.
 *
 * Each step renders via a render-prop and shares a single `data` object; steps
 * can `validate` before advancing. Composes the `Button` primitive and the
 * `.steps` stepper markup.
 *
 * @example
 * ```tsx
 * type ImportData = { file?: File; mapping: Record<string, string>; rows: unknown[] };
 * <ImportWizard
 *   initialData={{ mapping: {}, rows: [] }}
 *   onComplete={(data) => importSuppliers(data.rows)}
 *   steps={[
 *     { id: 'upload', label: 'Upload', validate: (d) => !!d.file || 'Choose a CSV',
 *       render: ({ setData }) => <FileDrop onFile={(file) => setData({ file })} /> },
 *     { id: 'map', label: 'Map columns',
 *       render: ({ data, setData }) => <ColumnMapper value={data.mapping} onChange={(mapping) => setData({ mapping })} /> },
 *     { id: 'preview', label: 'Preview',
 *       render: ({ data }) => <PreviewTable rows={data.rows} /> },
 *     { id: 'confirm', label: 'Confirm',
 *       render: ({ data }) => <p>Import {data.rows.length} suppliers into Mukamba Group?</p> },
 *   ]}
 * />
 * ```
 */
export function ImportWizard<Data>({
  steps,
  initialData,
  onComplete,
  onCancel,
  finishLabel = 'Finish',
  completing,
  className,
}: ImportWizardProps<Data>) {
  const [index, setIndex] = useState(0);
  const [data, setDataState] = useState<Data>(initialData);
  const [error, setError] = useState<string | null>(null);

  const step = steps[index];
  const isLast = index === steps.length - 1;

  const setData = useCallback((patch: Partial<Data>) => {
    setDataState((d) => ({ ...d, ...patch }));
    setError(null);
  }, []);

  const tryAdvance = useCallback(
    (toLast: boolean) => {
      const result = step.validate?.(data);
      if (result === false) {
        setError('Please complete this step before continuing.');
        return;
      }
      if (typeof result === 'string') {
        setError(result);
        return;
      }
      setError(null);
      if (toLast) {
        onComplete(data);
      } else {
        setIndex((i) => Math.min(i + 1, steps.length - 1));
      }
    },
    [step, data, onComplete, steps.length],
  );

  const next = useCallback(() => tryAdvance(false), [tryAdvance]);
  const back = useCallback(() => {
    setError(null);
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  const ctx = useMemo<WizardStepContext<Data>>(
    () => ({ data, setData, next, back, index, isLast }),
    [data, setData, next, back, index, isLast],
  );

  return (
    <div className={cn('import-wizard', className)}>
      {/* Stepper */}
      <div className="steps" style={{ marginBottom: 24 }}>
        {steps.map((s, i) => (
          <span key={s.id} style={{ display: 'contents' }}>
            <span className={cn('st', i < index && 'done', i === index && 'current')}>
              <span className="st-bubble">{i < index ? '✓' : i + 1}</span>
              <span className="st-label">{s.label}</span>
            </span>
            {i < steps.length - 1 ? <span className="st-rail" /> : null}
          </span>
        ))}
      </div>

      {step.description ? (
        <p style={{ font: 'var(--type-body-sm)', color: 'var(--text-muted)', marginBottom: 16 }}>{step.description}</p>
      ) : null}

      {/* Body */}
      <div className="import-wizard-body">{step.render(ctx)}</div>

      {error ? (
        <div role="alert" style={{ marginTop: 12, color: 'var(--tone-danger)', font: 'var(--type-body-sm)' }}>
          {error}
        </div>
      ) : null}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
        {onCancel ? (
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <span style={{ flex: 1 }} />
        {index > 0 ? (
          <Button variant="secondary" onClick={back} disabled={completing}>
            Back
          </Button>
        ) : null}
        {isLast ? (
          <Button variant="primary" onClick={() => tryAdvance(true)} loading={completing}>
            {finishLabel}
          </Button>
        ) : (
          <Button variant="primary" onClick={next}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
