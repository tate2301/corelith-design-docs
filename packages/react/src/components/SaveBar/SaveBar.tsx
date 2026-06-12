import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';

export interface SaveBarProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** When true, the bar slides up into view. */
  dirty: boolean;
  title?: ReactNode;
  summary?: ReactNode;
  onSave?: () => void;
  onDiscard?: () => void;
  saving?: boolean;
  /** Override the labels on the two buttons. */
  saveLabel?: string;
  discardLabel?: string;
  /** Custom action area — overrides the default save/discard buttons. */
  actions?: ReactNode;
}

/**
 * SaveBar — sticky save/discard footer for forms.
 *
 * @example
 * ```tsx
 * <SaveBar />
 * ```
 */
export const SaveBar = forwardRef<HTMLElement, SaveBarProps>(function SaveBar(
  {
    dirty,
    title = 'Unsaved changes',
    summary,
    onSave,
    onDiscard,
    saving,
    saveLabel = 'Save',
    discardLabel = 'Discard',
    actions,
    className,
    ...rest
  },
  ref,
) {
  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      role="region"
      aria-label="Save bar"
      aria-hidden={!dirty}
      className={cx('p-save-bar', dirty && 'dirty', className)}
      {...(rest as HTMLAttributes<HTMLDivElement>)}
    >
      <div className="label">
        <span className="title">{title}</span>
        {summary ? <span className="summary">{summary}</span> : null}
      </div>
      <div className="actions">
        {actions ?? (
          <>
            {onDiscard ? (
              <button type="button" className="btn btn-ghost btn-md" onClick={onDiscard} disabled={saving}>
                {discardLabel}
              </button>
            ) : null}
            {onSave ? (
              <button
                type="button"
                className="btn btn-primary btn-md"
                onClick={onSave}
                disabled={saving}
                aria-busy={saving || undefined}
              >
                {saving ? 'Saving…' : saveLabel}
              </button>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
});
