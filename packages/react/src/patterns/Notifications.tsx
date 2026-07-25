"use client";

import {
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';
import { EmptyState } from '../blocks/EmptyState';
import { Button } from '../primitives/Button';
import { Chip } from '../primitives/Chip';

export type NotificationTone = 'default' | 'brand' | 'success' | 'warn' | 'danger';

export interface NotificationEntry {
  /** Unique id. */
  id: string;
  /** Body content. Plain text or rich nodes. */
  body: ReactNode;
  /** Relative/absolute time label (e.g. "2h ago"). */
  time?: ReactNode;
  /** Avatar/monogram text or node. */
  avatar?: ReactNode;
  /** Tone of the avatar tile. @default 'default' */
  tone?: NotificationTone;
  /** Read state. @default false */
  read?: boolean;
  /** Optional category used by the filter chips. */
  category?: string;
  /** Optional click handler (e.g. navigate to the source). */
  onClick?: () => void;
}

// ──────────────────────────────────────────────────────────────────────────
// In-memory store via useSyncExternalStore — no Provider needed.
// ──────────────────────────────────────────────────────────────────────────
type Listener = () => void;

export interface NotificationStore {
  add: (entry: Omit<NotificationEntry, 'id'> & { id?: string }) => string;
  markRead: (id: string) => void;
  markAllRead: () => void;
  remove: (id: string) => void;
  clear: () => void;
  getAll: () => NotificationEntry[];
}

function createStore(initial: NotificationEntry[] = []) {
  let items = initial;
  const listeners = new Set<Listener>();
  const emit = () => listeners.forEach((l) => l());
  let counter = 0;
  const nextId = () => `ntf-${++counter}-${Date.now().toString(36)}`;

  const subscribe = (l: Listener) => {
    listeners.add(l);
    return () => listeners.delete(l);
  };
  const getSnapshot = () => items;

  const api: NotificationStore = {
    add(entry) {
      const id = entry.id ?? nextId();
      const existing = items.findIndex((i) => i.id === id);
      const next: NotificationEntry = { read: false, tone: 'default', ...entry, id };
      items = existing >= 0
        ? [...items.slice(0, existing), next, ...items.slice(existing + 1)]
        : [next, ...items];
      emit();
      return id;
    },
    markRead(id) {
      items = items.map((i) => (i.id === id ? { ...i, read: true } : i));
      emit();
    },
    markAllRead() {
      items = items.map((i) => (i.read ? i : { ...i, read: true }));
      emit();
    },
    remove(id) {
      items = items.filter((i) => i.id !== id);
      emit();
    },
    clear() {
      items = [];
      emit();
    },
    getAll: () => items,
  };

  return { api, subscribe, getSnapshot };
}

// Default module-scoped store — `useNotifications()` with no arg reads this.
const defaultStore = createStore();

/** Imperative handle to the default notification store (push from anywhere). */
export const notifications = defaultStore.api;

/**
 * useNotifications — subscribe a component to a notification store. Returns the
 * live list plus the store's imperative API. Pass a custom store (from
 * `createNotificationStore`) to scope notifications; omit for the shared one.
 */
export function useNotifications(store?: ReturnType<typeof createStore>) {
  const s = store ?? defaultStore;
  const items = useSyncExternalStore(s.subscribe, s.getSnapshot, s.getSnapshot);
  const unread = useMemo(() => items.filter((i) => !i.read).length, [items]);
  return { items, unread, ...s.api };
}

/** Create an isolated notification store (e.g. per-workspace). */
export function createNotificationStore(initial?: NotificationEntry[]) {
  return createStore(initial);
}

const TONE_CLASS: Record<NotificationTone, string | undefined> = {
  default: undefined,
  brand: 'brand',
  success: 'success',
  warn: 'warn',
  danger: 'danger',
};

export interface NotificationCenterProps {
  /** Store to read from. Defaults to the shared module store. */
  store?: ReturnType<typeof createStore>;
  /** Title for the header. @default 'Notifications' */
  title?: ReactNode;
  /** Filter categories shown as chips. "All" / "Unread" are always added. */
  categories?: string[];
  /** Empty-state node when the active filter has no items. */
  emptyState?: ReactNode;
  /** Extra className. */
  className?: string;
}

/**
 * NotificationCenter — a list + filter chips + mark-read assembly backed by the
 * `useNotifications` store (in-memory, `useSyncExternalStore`). Composes the
 * `.notif` row markup and the `EmptyState` block.
 *
 * @example
 * ```tsx
 * // Push from anywhere:
 * notifications.add({ body: <><strong>Tendai</strong> approved invoice INV-204</>, time: '2h ago', tone: 'success', category: 'Approvals' });
 *
 * // Render the centre (e.g. inside a Popover or Sheet):
 * <NotificationCenter categories={['Approvals', 'System']} />
 * ```
 */
export function NotificationCenter({
  store,
  title = 'Notifications',
  categories = [],
  emptyState,
  className,
}: NotificationCenterProps) {
  const { items, unread, markRead, markAllRead } = useNotifications(store);
  const [filter, setFilter] = useState<string>('All');

  const chips = useMemo(() => ['All', 'Unread', ...categories], [categories]);

  const visible = useMemo(() => {
    if (filter === 'All') return items;
    if (filter === 'Unread') return items.filter((i) => !i.read);
    return items.filter((i) => i.category === filter);
  }, [items, filter]);

  return (
    <div className={cn('notif-center', className)} style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 4px 12px', gap: 12 }}>
        <strong style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>
          {title}
          {unread > 0 ? <span style={{ marginLeft: 8, color: 'var(--text-muted)', fontWeight: 400 }}>{unread} unread</span> : null}
        </strong>
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={() => markAllRead()}
          disabled={unread === 0}
        >
          Mark all read
        </Button>
      </header>

      <div role="tablist" aria-label="Filter notifications" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '0 4px 10px' }}>
        {chips.map((c) => (
          <Chip
            key={c}
            type="button"
            role="tab"
            aria-selected={filter === c}
            selected={filter === c}
            onClick={() => setFilter(c)}
          >
            {c}
          </Chip>
        ))}
      </div>

      <div style={{ overflowY: 'auto', minHeight: 0 }}>
        {visible.length === 0 ? (
          emptyState ?? (
            <EmptyState title="You're all caught up" body="New notifications will show up here." />
          )
        ) : (
          visible.map((n) => (
            <div
              key={n.id}
              className={cn('notif', !n.read && 'unread')}
              role="button"
              tabIndex={0}
              onClick={() => {
                if (!n.read) markRead(n.id);
                n.onClick?.();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (!n.read) markRead(n.id);
                  n.onClick?.();
                }
              }}
              style={{ display: 'grid', gridTemplateColumns: '32px 1fr auto', gap: 12, padding: '12px 14px', alignItems: 'start', cursor: 'pointer' }}
            >
              <span className={cn('n-av', TONE_CLASS[n.tone ?? 'default'])} aria-hidden="true">
                {n.avatar}
              </span>
              <div className="n-body">{n.body}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {n.time ? <span className="n-time">{n.time}</span> : null}
                {!n.read ? <span className="n-dot" aria-label="Unread" /> : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
