import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type DragEvent,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../utils/cx';
import './FileUpload.css';

export interface FileUploadProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'onDrop' | 'onPaste'> {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  /** Render override for inner text/icon. */
  children?: ReactNode;
}

function pickFiles(list: FileList | null | undefined): File[] {
  if (!list) return [];
  return Array.from(list);
}

/**
 * FileUpload — drag-and-drop file picker.
 *
 * @example
 * ```tsx
 * <FileUpload />
 * ```
 */
export const FileUpload = forwardRef<HTMLDivElement, FileUploadProps>(function FileUpload(
  { onFiles, accept, multiple, disabled, className, children, ...rest },
  ref,
) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handle = useCallback(
    (files: File[]) => {
      if (disabled || files.length === 0) return;
      onFiles(files);
    },
    [disabled, onFiles],
  );

  const onClick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    handle(pickFiles(e.target.files));
    e.target.value = '';
  };
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    handle(pickFiles(e.dataTransfer.files));
  };
  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };
  const onDragLeave = () => setDragging(false);
  const onPaste = (e: ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.files;
    if (items && items.length > 0) handle(pickFiles(items));
  };

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled || undefined}
      className={cx('file-upload', dragging && 'is-dragging', className)}
      onClick={onClick}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
          e.preventDefault();
          onClick();
        }
      }}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onPaste={onPaste}
      {...rest}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="file-upload-input"
        onChange={onChange}
      />
      {children ?? <span>Drop files here, click to browse, or paste an image.</span>}
    </div>
  );
});
