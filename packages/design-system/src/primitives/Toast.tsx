import {
  useEffect,
  useRef,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../utils/cn';

export type ToastTone = 'default' | 'success' | 'warn' | 'danger';

export interface ToastAction {
  /** Label shown on the action button. */
  label: string;
  /** Fires when action is clicked; toast dismisses automatically. */
  onClick: () => void;
}

export interface ToastOptions {
  /** Tonal variant. */
  tone?: ToastTone;
  /** Body text under the title. */
  description?: ReactNode;
  /** Auto-dismiss timeout in ms. Pass `Infinity` for sticky. @default 5000 */
  duration?: number;
  /** Single trailing action (Undo / Retry / View). */
  action?: ToastAction;
  /** Override the generated id (for upserts). */
  id?: string;
}

export interface ToastEntry extends ToastOptions {
  id: string;
  title: ReactNode;
  createdAt: number;
}

// ──────────────────────────────────────────────────────────────────────────
// Store — module-scoped so toasts work from anywhere without a Provider.
// ──────────────────────────────────────────────────────────────────────────
type Listener = () => void;
let toasts: ToastEntry[] = [];
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((l) => l());

const subscribe = (l: Listener) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => toasts;
const getServerSnapshot = () => toasts;

let counter = 0;
const nextId = () => `toast-${++counter}-${Date.now().toString(36)}`;

function add(title: ReactNode, opts: ToastOptions = {}): string {
  const id = opts.id ?? nextId();
  const existingIdx = toasts.findIndex((t) => t.id === id);
  const entry: ToastEntry = {
    id,
    title,
    tone: opts.tone ?? 'default',
    description: opts.description,
    duration: opts.duration ?? 5000,
    action: opts.action,
    createdAt: Date.now(),
  };
  if (existingIdx >= 0) {
    toasts = [...toasts.slice(0, existingIdx), entry, ...toasts.slice(existingIdx + 1)];
  } else {
    toasts = [...toasts, entry];
  }
  emit();
  return id;
}

function dismiss(id?: string) {
  toasts = id ? toasts.filter((t) => t.id !== id) : [];
  emit();
}

/**
 * `toast()` — fire a toast from anywhere. Module-scoped store, no Provider
 * needed; just render a `<Toaster />` once in your app shell.
 *
 * Accessibility: see the `<Toaster />` docs below.
 */
export const toast = Object.assign(
  (title: ReactNode, opts?: ToastOptions) => add(title, opts),
  {
    success: (title: ReactNode, opts?: ToastOptions) => add(title, { ...opts, tone: 'success' }),
    error: (title: ReactNode, opts?: ToastOptions) => add(title, { ...opts, tone: 'danger' }),
    warn: (title: ReactNode, opts?: ToastOptions) => add(title, { ...opts, tone: 'warn' }),
    dismiss,
  },
);

// ──────────────────────────────────────────────────────────────────────────
// Toaster host
// ──────────────────────────────────────────────────────────────────────────
export type ToasterPosition =
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center';

export interface ToasterProps {
  /** Anchor corner. @default 'bottom-right' */
  position?: ToasterPosition;
  /** Maximum number of visible toasts (oldest dismiss first). @default 5 */
  max?: number;
  /** Outer container style override. */
  style?: CSSProperties;
}

/**
 * Toaster — render this once in your app shell. Hosts the toast stack in a
 * fixed-position container portalled to `document.body`.
 *
 * Accessibility:
 *   - The host is a polite `aria-live` region (`role="region"`).
 *   - Danger toasts use `role="alert"` for immediate announcement; default /
 *     success / warn use `role="status"` (polite).
 *   - Each toast has a close button (`aria-label="Dismiss notification"`).
 *   - Pointer-enter pauses the auto-dismiss countdown (mouseleave resumes).
 */
export function Toaster({ position = 'bottom-right', max = 5, style }: ToasterProps) {
  const list = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const visible = list.slice(-max);

  if (typeof document === 'undefined') return null;

  const [vSide, hSide] = position.split('-') as [string, string];
  const containerStyle: CSSProperties = {
    position: 'fixed',
    [vSide]: 16,
    ...(hSide === 'center'
      ? { left: '50%', transform: 'translateX(-50%)' }
      : { [hSide]: 16 }),
    display: 'flex',
    flexDirection: vSide === 'top' ? 'column' : 'column-reverse',
    gap: 8,
    zIndex: 1200,
    pointerEvents: 'none',
    ...style,
  } as CSSProperties;

  return createPortal(
    <div role="region" aria-label="Notifications" style={containerStyle}>
      {visible.map((t) => (
        <ToastItem key={t.id} entry={t} />
      ))}
    </div>,
    document.body,
  );
}

function ToastItem({ entry }: { entry: ToastEntry }) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remaining = useRef<number>(entry.duration ?? 5000);
  const startedAt = useRef<number>(Date.now());

  useEffect(() => {
    if (!isFinite(remaining.current)) return;
    const arm = (ms: number) => {
      timerRef.current = setTimeout(() => dismiss(entry.id), ms);
      startedAt.current = Date.now();
    };
    arm(remaining.current);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry.id]);

  const pause = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      remaining.current = Math.max(0, remaining.current - (Date.now() - startedAt.current));
    }
  };
  const resume = () => {
    if (!isFinite(remaining.current)) return;
    if (timerRef.current) return;
    timerRef.current = setTimeout(() => dismiss(entry.id), remaining.current);
    startedAt.current = Date.now();
  };

  const role = entry.tone === 'danger' ? 'alert' : 'status';
  const toneClass = entry.tone === 'success' ? 'success' : entry.tone === 'danger' ? 'danger' : undefined;
  const inlineTone =
    entry.tone === 'warn'
      ? { background: 'var(--tone-warn)', color: '#fff' }
      : undefined;

  return (
    <div
      role={role}
      aria-live={entry.tone === 'danger' ? 'assertive' : 'polite'}
      className={cn('toast', toneClass)}
      style={{
        pointerEvents: 'auto',
        gridTemplateColumns: entry.action ? '20px 1fr auto auto' : '20px 1fr auto',
        ...inlineTone,
      }}
      onPointerEnter={pause}
      onPointerLeave={resume}
    >
      <span aria-hidden="true" style={{ width: 20 }} />
      <div>
        <div className="t-title">{entry.title}</div>
        {entry.description ? <div className="t-body">{entry.description}</div> : null}
      </div>
      {entry.action ? (
        <button
          type="button"
          onClick={() => {
            entry.action!.onClick();
            dismiss(entry.id);
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#fff',
            font: '500 13px/1 var(--font-sans)',
            padding: '4px 10px',
            borderRadius: 6,
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          {entry.action.label}
        </button>
      ) : null}
      <button
        type="button"
        className="x"
        aria-label="Dismiss notification"
        onClick={() => dismiss(entry.id)}
      >
        ×
      </button>
    </div>
  );
}
