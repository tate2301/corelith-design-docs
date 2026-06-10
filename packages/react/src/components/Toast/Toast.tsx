import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../utils/cx';
import './Toast.css';

export type ToastTone = 'info' | 'success' | 'warn' | 'danger';

export interface ToastInput {
  id?: string;
  tone?: ToastTone;
  title?: ReactNode;
  message?: ReactNode;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

export interface ToastItem extends Required<Pick<ToastInput, 'id' | 'tone' | 'duration'>> {
  title?: ReactNode;
  message?: ReactNode;
  action?: ToastInput['action'];
}

interface ToastApi {
  show: (input: ToastInput) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

type Action =
  | { type: 'add'; toast: ToastItem }
  | { type: 'remove'; id: string }
  | { type: 'clear' };

function reducer(state: ToastItem[], action: Action): ToastItem[] {
  switch (action.type) {
    case 'add':
      return [...state, action.toast];
    case 'remove':
      return state.filter((t) => t.id !== action.id);
    case 'clear':
      return [];
  }
}

export interface ToastProviderProps {
  children: ReactNode;
  /** Default auto-dismiss in ms. Set 0 to keep open. */
  defaultDuration?: number;
  /** Element to portal into. Defaults to document.body. */
  container?: HTMLElement | null;
}

let uid = 0;
const nextId = () => `t_${Date.now().toString(36)}_${(uid++).toString(36)}`;

export function ToastProvider({ children, defaultDuration = 4000, container }: ToastProviderProps) {
  const [toasts, dispatch] = useReducer(reducer, [] as ToastItem[]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: string) => {
    const t = timers.current.get(id);
    if (t) {
      clearTimeout(t);
      timers.current.delete(id);
    }
    dispatch({ type: 'remove', id });
  }, []);

  const show = useCallback(
    (input: ToastInput) => {
      const id = input.id ?? nextId();
      const duration = input.duration ?? defaultDuration;
      const toast: ToastItem = {
        id,
        tone: input.tone ?? 'info',
        title: input.title,
        message: input.message,
        duration,
        action: input.action,
      };
      dispatch({ type: 'add', toast });
      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration);
        timers.current.set(id, timer);
      }
      return id;
    },
    [defaultDuration, dismiss],
  );

  useEffect(() => {
    const timersRef = timers.current;
    return () => {
      timersRef.forEach((t) => clearTimeout(t));
      timersRef.clear();
    };
  }, []);

  const api = useMemo<ToastApi>(() => ({ show, dismiss }), [show, dismiss]);

  const target = container ?? (typeof document !== 'undefined' ? document.body : null);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {target
        ? createPortal(
            <div className="toast-stack" role="region" aria-live="polite" aria-label="Notifications">
              {toasts.map((t) => (
                <Toast key={t.id} item={t} onDismiss={() => dismiss(t.id)} />
              ))}
            </div>,
            target,
          )
        : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast() must be used inside <ToastProvider>.');
  }
  return ctx;
}

interface ToastProps {
  item: ToastItem;
  onDismiss: () => void;
}

/**
 * Toast — transient notification (use ToastProvider).
 *
 * @example
 * ```tsx
 * <Toast />
 * ```
 */
export function Toast({ item, onDismiss }: ToastProps) {
  return (
    <div className={cx('toast', `toast-${item.tone}`)} role={item.tone === 'danger' ? 'alert' : 'status'}>
      <div className="toast-body">
        {item.title ? <div className="toast-title">{item.title}</div> : null}
        {item.message ? <div className="toast-message">{item.message}</div> : null}
      </div>
      {item.action ? (
        <button type="button" className="toast-action" onClick={item.action.onClick}>
          {item.action.label}
        </button>
      ) : null}
      <button type="button" className="toast-dismiss" aria-label="Dismiss" onClick={onDismiss}>
        ×
      </button>
    </div>
  );
}
