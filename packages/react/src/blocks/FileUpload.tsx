"use client";

import {
  useState,
  useRef,
  forwardRef,
  type HTMLAttributes,
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';
import { Button } from '../primitives/Button';

export interface FileUploadProps extends HTMLAttributes<HTMLDivElement> {
  onFilesSelected?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeMb?: number;
  label?: ReactNode;
  description?: ReactNode;
}

export const FileUpload = forwardRef<HTMLDivElement, FileUploadProps>(function FileUpload(
  {
    onFilesSelected,
    accept,
    multiple = true,
    maxSizeMb = 10,
    label = 'Drop files here or click to upload',
    description = `Supports files up to ${maxSizeMb}MB`,
    className,
    style,
    ...props
  },
  ref,
) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size <= maxSizeMb * 1024 * 1024) {
        validFiles.push(file);
      }
    }
    if (validFiles.length > 0) {
      onFilesSelected?.(validFiles);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  return (
    <div
      ref={ref}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn('b-file-upload', isDragging && 'dragging', className)}
      style={{
        border: `2px dashed ${isDragging ? 'var(--brand, #0B5DF0)' : 'var(--border, #e5e7eb)'}`,
        backgroundColor: isDragging ? 'var(--brand-soft, #eff6ff)' : 'var(--surface-muted, #f9fafb)',
        borderRadius: 12,
        padding: '32px 24px',
        textAlign: 'center',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        transition: 'all 0.15s ease',
        ...style,
      }}
      {...props}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          backgroundColor: 'var(--surface, #ffffff)',
          border: '1px solid var(--border, #e5e7eb)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--brand, #0B5DF0)',
        }}
      >
        ↑
      </div>
      <div>
        <div style={{ font: '500 14px/1.3 var(--font-sans)', color: 'var(--text-strong)' }}>
          {label}
        </div>
        {description && (
          <div style={{ font: 'var(--type-body-sm)', color: 'var(--text-muted)', marginTop: 4 }}>
            {description}
          </div>
        )}
      </div>
      <Button variant="secondary" size="sm" type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
        Select files
      </Button>
    </div>
  );
});
