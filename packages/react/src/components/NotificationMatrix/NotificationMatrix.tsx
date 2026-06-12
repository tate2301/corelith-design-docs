import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import './NotificationMatrix.css';

export interface NotificationEvent {
  id: string;
  label: ReactNode;
  description?: ReactNode;
}

export interface NotificationChannel {
  id: string;
  label: ReactNode;
}

export type NotificationPrefs = Record<string, boolean>;

export type MasterPause = 0 | 1 | 4 | 24 | 'until-tomorrow';

const PAUSE_PRESETS: { value: MasterPause; label: string }[] = [
  { value: 0, label: 'Off' },
  { value: 1, label: '1 hour' },
  { value: 4, label: '4 hours' },
  { value: 24, label: '24 hours' },
  { value: 'until-tomorrow', label: 'Until tomorrow' },
];

export interface NotificationMatrixProps {
  events: NotificationEvent[];
  channels: NotificationChannel[];
  /** Keyed `${eventId}:${channelId}` → boolean. */
  value: NotificationPrefs;
  onChange?: (eventId: string, channelId: string, enabled: boolean) => void;
  /** Currently active master-pause window. */
  masterPauseHours?: MasterPause;
  onMasterPause?: (next: MasterPause) => void;
  className?: string;
}

/**
 * Settings matrix of events × channels. Renders a real `<table>` for proper
 * keyboard navigation and screen-reader semantics.
 */
/**
 * NotificationMatrix — channel × event preference grid.
 *
 * @example
 * ```tsx
 * <NotificationMatrix />
 * ```
 */
export function NotificationMatrix({
  events,
  channels,
  value,
  onChange,
  masterPauseHours,
  onMasterPause,
  className,
}: NotificationMatrixProps) {
  const key = (eventId: string, channelId: string) => `${eventId}:${channelId}`;

  return (
    <div className={cx('notif-matrix-wrap', className)}>
      {onMasterPause ? (
        <div className="notif-matrix-pause" role="group" aria-label="Pause all notifications">
          <span className="notif-matrix-pause-label">Pause all</span>
          {PAUSE_PRESETS.map((p) => (
            <button
              key={String(p.value)}
              type="button"
              className={cx(
                'btn btn-md',
                masterPauseHours === p.value ? 'btn-primary' : 'btn-ghost',
              )}
              onClick={() => onMasterPause(p.value)}
              aria-pressed={masterPauseHours === p.value || undefined}
            >
              {p.label}
            </button>
          ))}
        </div>
      ) : null}
      <table className="notif-matrix">
        <thead>
          <tr>
            <th scope="col" className="notif-matrix-corner">
              Event
            </th>
            {channels.map((c) => (
              <th key={c.id} scope="col">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {events.map((ev) => (
            <tr key={ev.id}>
              <th scope="row" className="notif-matrix-event">
                <div className="notif-matrix-event-label">{ev.label}</div>
                {ev.description ? (
                  <div className="notif-matrix-event-desc">{ev.description}</div>
                ) : null}
              </th>
              {channels.map((c) => {
                const k = key(ev.id, c.id);
                const enabled = !!value[k];
                const ariaLabel =
                  typeof ev.label === 'string' && typeof c.label === 'string'
                    ? `${ev.label} via ${c.label}`
                    : `${ev.id} via ${c.id}`;
                return (
                  <td key={c.id} className="notif-matrix-cell">
                    <label className="check" aria-label={ariaLabel}>
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => onChange?.(ev.id, c.id, e.target.checked)}
                        aria-label={ariaLabel}
                      />
                    </label>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
