"use client";

import {
  forwardRef,
  useId,
  useRef,
  useState,
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
  /** Optional leading icon. */
  icon?: ReactNode;
  /** Upload progress 0–100. Omit (or 100) for a settled file. */
  progress?: number;
}

export interface AttachmentCenterProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onDrop' | 'title'> {
  /** The files to list. */
  files: AttachmentFile[];
  /** Optional title. @default `Attachments · N` */
  title?: ReactNode;
  /** Fires when files are chosen (button or drop). */
  onUpload?: (files: FileList) => void;
  /** Fires when a file's remove button is pressed. */
  onRemove?: (id: string) => void;
  /** Accepted MIME types / extensions for the file input. */
  accept?: string;
  /** Allow choosing multiple files. @default true */
  multiple?: boolean;
}

/**
 * AttachmentCenter — a file list with an upload dropzone, per-file progress,
 * and remove actions. The docs (`p-attachment-center`) reference `.attachments`
 * but no rule exists in components.css, so the card, row, and dropzone chrome
 * are token-driven inline fallbacks. The upload/remove controls reuse `.btn`.
 *
 * Accessibility:
 *   - File list is `role="list"` / `role="listitem"`.
 *   - In-flight uploads expose `role="progressbar"` with
 *     `aria-valuenow/min/max`.
 *   - The dropzone has an associated visually-labelled file `<input>`; drag-drop
 *     is an enhancement over the always-present Upload button. Remove buttons
 *     carry an explicit `aria-label`.
 */
export const AttachmentCenter = forwardRef<HTMLDivElement, AttachmentCenterProps>(
  function AttachmentCenter(
    { files, title, onUpload, onRemove, accept, multiple = true, className, style, ...rest },
    ref,
  ) {
    const baseId = useId();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [dragging, setDragging] = useState(false);

    const emit = (list: FileList | null) => {
      if (list && list.length) onUpload?.(list);
    };

    return (
      <div
        ref={ref}
        className={cn('attachments', className)}
        // Token-driven inline fallback: no `.attachments` rule in components.css.
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '18px 20px',
          ...style,
        }}
        {...rest}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <h2
            style={{
              font: '600 15px/1.3 var(--font-sans)',
              color: 'var(--text-strong)',
              margin: 0,
              flex: 1,
            }}
          >
            {title ?? `Attachments · ${files.length}`}
          </h2>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => inputRef.current?.click()}
          >
            Upload
          </button>
          <input
            ref={inputRef}
            id={`${baseId}-input`}
            type="file"
            accept={accept}
            multiple={multiple}
            style={{ display: 'none' }}
            onChange={(e) => emit(e.target.files)}
          />
        </div>

        <ul role="list" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {files.map((file) => {
            const uploading = file.progress != null && file.progress < 100;
            return (
              <li
                key={file.id}
                role="listitem"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '36px 1fr auto',
                  gap: 12,
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    background: 'var(--surface-muted)',
                    color: 'var(--text-muted)',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  {file.icon}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      font: '500 13.5px/1.3 var(--font-sans)',
                      color: 'var(--text-strong)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {file.name}
                  </div>
                  {uploading ? (
                    <div
                      role="progressbar"
                      aria-valuenow={Math.round(file.progress!)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Uploading ${file.name}`}
                      style={{
                        height: 4,
                        borderRadius: 2,
                        background: 'var(--surface-muted)',
                        marginTop: 6,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${file.progress}%`,
                          height: '100%',
                          background: 'var(--brand)',
                        }}
                      />
                    </div>
                  ) : file.meta != null ? (
                    <div
                      style={{
                        font: '11px/1.3 var(--font-mono)',
                        color: 'var(--text-muted)',
                        marginTop: 2,
                      }}
                    >
                      {file.meta}
                    </div>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="btn btn-quiet btn-icon btn-sm"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => onRemove?.(file.id)}
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            emit(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          style={{
            marginTop: 14,
            padding: '18px',
            border: `1.5px dashed ${dragging ? 'var(--brand)' : 'var(--border-strong)'}`,
            borderRadius: 10,
            textAlign: 'center',
            font: 'var(--type-body-sm)',
            color: 'var(--text-muted)',
            background: dragging ? 'var(--brand-soft)' : 'transparent',
            cursor: 'pointer',
          }}
        >
          Drop files here or click to upload
        </div>
      </div>
    );
  },
);
