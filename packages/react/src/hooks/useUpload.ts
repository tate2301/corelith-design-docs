"use client";

import { useCallback, useRef, useState } from 'react';

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export interface UploadState {
  status: UploadStatus;
  /** 0–1 fraction of bytes uploaded for the current request. */
  progress: number;
  error: Error | null;
  /** Server response body — undefined until success. */
  response: unknown;
}

export interface UploadOptions {
  /** Override the request method. Defaults to POST. */
  method?: string;
  /** Extra headers to send. */
  headers?: Record<string, string>;
  /** Form-field name when sending a single `File`. Defaults to `'file'`. */
  fieldName?: string;
}

const initial: UploadState = { status: 'idle', progress: 0, error: null, response: undefined };

/**
 * Tiny `XMLHttpRequest`-backed upload helper. Exposes a stable `upload(url,
 * file)` call, a progress fraction, and a `cancel()` to abort an in-flight
 * request. Use this where `fetch()` falls short — namely upload progress.
 */
export function useUpload() {
  const [state, setState] = useState<UploadState>(initial);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const cancel = useCallback(() => {
    xhrRef.current?.abort();
    xhrRef.current = null;
    setState(initial);
  }, []);

  const reset = useCallback(() => setState(initial), []);

  const upload = useCallback(
    (url: string, file: File | FormData, options: UploadOptions = {}) => {
      cancel();
      return new Promise<unknown>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;
        xhr.open(options.method ?? 'POST', url);
        if (options.headers) {
          for (const [k, v] of Object.entries(options.headers)) xhr.setRequestHeader(k, v);
        }
        xhr.upload.onprogress = (e) => {
          if (!e.lengthComputable) return;
          setState((s) => ({ ...s, status: 'uploading', progress: e.loaded / e.total }));
        };
        xhr.onload = () => {
          let response: unknown = xhr.responseText;
          try {
            response = JSON.parse(xhr.responseText);
          } catch {
            /* not JSON — return raw text */
          }
          if (xhr.status >= 200 && xhr.status < 300) {
            setState({ status: 'success', progress: 1, error: null, response });
            resolve(response);
          } else {
            const err = new Error(`Upload failed with ${xhr.status}`);
            setState({ status: 'error', progress: 1, error: err, response });
            reject(err);
          }
        };
        xhr.onerror = () => {
          const err = new Error('Network error');
          setState({ status: 'error', progress: 0, error: err, response: undefined });
          reject(err);
        };

        let body: FormData;
        if (file instanceof FormData) {
          body = file;
        } else {
          body = new FormData();
          body.append(options.fieldName ?? 'file', file);
        }
        setState({ status: 'uploading', progress: 0, error: null, response: undefined });
        xhr.send(body);
      });
    },
    [cancel],
  );

  return { ...state, upload, cancel, reset };
}
