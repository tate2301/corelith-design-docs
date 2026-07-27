"use client";

import {
  forwardRef,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';

export interface AttachmentFile {
  /** Stable id. */
  id: string;
  /** File name. */
  name: string;
  /** Meta line (size · type · uploader · date). */
  meta?: ReactNode;
  /** Secondary sentence under the name — a caption, note, or rejection reason. */
  description?: ReactNode;
  /** Optional leading icon. */
  icon?: ReactNode;
  /**
   * Upload progress 0–100. Omit (or 100) for a settled file.
   *
   * NOTE — this is a percentage, whereas `useUpload().progress` is a 0–1
   * fraction. Multiply by 100 when feeding one into the other:
   * `progress: upload.progress * 100`.
   */
  progress?: number;
  /** When set, the file name renders as a link opening in a new tab. Takes
   *  precedence over `onOpen`. */
  href?: string;
}

export interface AttachmentCenterProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onDrop' | 'title'> {
  /** The files to list. */
  files: AttachmentFile[];
  /** Optional title. @default `Attachments · N` */
  title?: ReactNode;
  /** Supporting copy under the title (accepted types, size caps, retention). */
  description?: ReactNode;
  /** Fires when files are chosen (button or drop). */
  onUpload?: (files: FileList) => void;
  /** Fires when a file's remove button is pressed. */
  onRemove?: (id: string) => void;
  /** Fires when a file without an `href` is activated. Renders the file name as
   *  a button. */
  onOpen?: (file: AttachmentFile) => void;
  /** Accepted MIME types / extensions for the file input. */
  accept?: string;
  /** Allow choosing multiple files. @default true */
  multiple?: boolean;
  /** Present the list without any mutation affordances — disables the dropzone,
   *  the file input, the Upload button and every remove button. @default false */
  readOnly?: boolean;
  /** Primary dropzone copy. @default 'Drop files here or click to upload' */
  dropLabel?: ReactNode;
  /** Secondary dropzone line (size limits, accepted formats). */
  dropHint?: ReactNode;
  /** Copy shown in place of the list when `files` is empty.
   *  @default 'No attachments yet.' */
  emptyLabel?: ReactNode;
  /** Rendered at the bottom of the card, below the dropzone. */
  footer?: ReactNode;
}

/**
 * AttachmentCenter — a file list with an upload dropzone, per-file progress,
 * and remove actions. Maps to the `.attachments` family in surfaces.css; the
 * upload/remove controls reuse `.btn`.
 *
 * @example
 * <AttachmentCenter
 *   files={files}
 *   description="PDF or PNG, up to 10 MB each."
 *   onUpload={(list) => enqueue(list)}
 *   onRemove={(id) => drop(id)}
 * />
 *
 * @example
 * // Read-only audit view with links out and a footer summary.
 * <AttachmentCenter
 *   files={docs}
 *   readOnly
 *   emptyLabel="Nothing was attached to this order."
 *   footer={<span>{docs.length} document(s) · retained 7 years</span>}
 * />
 *
 * Accessibility:
 *   - File list is `role="list"` / `role="listitem"`.
 *   - In-flight uploads expose `role="progressbar"` with
 *     `aria-valuenow/min/max`.
 *   - The dropzone has an associated visually-labelled file `<input>`; drag-drop
 *     is an enhancement over the always-present Upload button. Remove buttons
 *     carry an explicit `aria-label`.
 *   - When `readOnly` the dropzone drops its click/drop handlers and is marked
 *     `aria-disabled`, so it is inert rather than merely dimmed.
 */
export const AttachmentCenter = forwardRef<HTMLDivElement, AttachmentCenterProps>(
  function AttachmentCenter(
    {
      files,
      title,
      description,
      onUpload,
      onRemove,
      onOpen,
      accept,
      multiple = true,
      readOnly = false,
      dropLabel,
      dropHint,
      emptyLabel,
      footer,
      className,
      style,
      ...rest
    },
    ref,
  ) {
    const baseId = useId();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [dragging, setDragging] = useState(false);

    const emit = (list: FileList | null) => {
      if (readOnly) return;
      if (list && list.length) onUpload?.(list);
    };

    const openPicker = () => {
      if (readOnly) return;
      inputRef.current?.click();
    };

    return (
      <div ref={ref} className={cn('attachments', className)} style={style} {...rest}>
        <div className="attachments-header">
          <div className="attachments-heading">
            <h2 className="attachments-title">{title ?? `Attachments · ${files.length}`}</h2>
            {description != null ? <p className="attachments-desc">{description}</p> : null}
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={readOnly}
            onClick={openPicker}
          >
            Upload
          </button>
          <input
            ref={inputRef}
            id={`${baseId}-input`}
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={readOnly}
            hidden
            onChange={(e) => emit(e.target.files)}
          />
        </div>

        {files.length === 0 ? (
          <p className="attachments-empty">{emptyLabel ?? 'No attachments yet.'}</p>
        ) : (
          <ul role="list" className="attachments-list">
            {files.map((file) => {
              const uploading = file.progress != null && file.progress < 100;

              let nameNode: ReactNode;
              if (file.href) {
                nameNode = (
                  <a
                    className="attachments-item-name"
                    href={file.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {file.name}
                  </a>
                );
              } else if (onOpen) {
                nameNode = (
                  <button
                    type="button"
                    className="attachments-item-name"
                    onClick={() => onOpen(file)}
                  >
                    {file.name}
                  </button>
                );
              } else {
                nameNode = <span className="attachments-item-name">{file.name}</span>;
              }

              return (
                <li key={file.id} role="listitem" className="attachments-item">
                  <span aria-hidden="true" className="attachments-item-icon">
                    {file.icon}
                  </span>
                  <div className="attachments-item-body">
                    {nameNode}
                    {file.description != null ? (
                      <div className="attachments-item-desc">{file.description}</div>
                    ) : null}
                    {uploading ? (
                      <div
                        role="progressbar"
                        aria-valuenow={Math.round(file.progress!)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Uploading ${file.name}`}
                        className="attachments-progress"
                      >
                        <div
                          className="attachments-progress-fill"
                          style={
                            { ['--attachments-progress' as string]: `${file.progress}%` } as CSSProperties
                          }
                        />
                      </div>
                    ) : file.meta != null ? (
                      <div className="attachments-item-meta">{file.meta}</div>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="btn btn-quiet btn-icon btn-sm"
                    aria-label={`Remove ${file.name}`}
                    disabled={readOnly}
                    onClick={() => onRemove?.(file.id)}
                  >
                    ×
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div
          className={cn(
            'attachments-dropzone',
            dragging && !readOnly && 'is-dragging',
            readOnly && 'is-disabled',
          )}
          aria-disabled={readOnly || undefined}
          onDragOver={
            readOnly
              ? undefined
              : (e) => {
                  e.preventDefault();
                  setDragging(true);
                }
          }
          onDragLeave={readOnly ? undefined : () => setDragging(false)}
          onDrop={
            readOnly
              ? undefined
              : (e) => {
                  e.preventDefault();
                  setDragging(false);
                  emit(e.dataTransfer.files);
                }
          }
          onClick={readOnly ? undefined : openPicker}
        >
          <span className="attachments-dropzone-label">
            {dropLabel ?? 'Drop files here or click to upload'}
          </span>
          {dropHint != null ? (
            <span className="attachments-dropzone-hint">{dropHint}</span>
          ) : null}
        </div>

        {footer != null ? <div className="attachments-footer">{footer}</div> : null}
      </div>
    );
  },
);
