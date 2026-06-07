import { useCallback, useState } from 'react';
import type {
  NotificationPrefs,
  MasterPause,
} from '../components/NotificationMatrix/NotificationMatrix';

export interface QuietHours {
  /** 24-hour clock, "HH:MM". */
  start: string;
  end: string;
}

export interface UsePreferencesResult {
  prefs: NotificationPrefs;
  /** Flip a single `${eventId}:${channelId}` key. */
  set: (eventId: string, channelId: string, enabled: boolean) => void;
  /** Apply a master pause; pass `0` to clear. */
  pauseFor: (hours: MasterPause) => void;
  pause: MasterPause;
  quietHours: QuietHours | null;
  setQuietHours: (next: QuietHours | null) => void;
}

/**
 * Minimal in-memory preferences store for `NotificationMatrix`. Returns the
 * `prefs` object (keyed `${eventId}:${channelId}`), a setter, a master-pause
 * control, and a quiet-hours pair. Drop-in for prototypes — wire up your real
 * persistence layer for production.
 */
export function usePreferences(initial: NotificationPrefs = {}): UsePreferencesResult {
  const [prefs, setPrefs] = useState<NotificationPrefs>(initial);
  const [pause, setPause] = useState<MasterPause>(0);
  const [quietHours, setQuietHoursState] = useState<QuietHours | null>(null);

  const set = useCallback((eventId: string, channelId: string, enabled: boolean) => {
    setPrefs((prev) => ({ ...prev, [`${eventId}:${channelId}`]: enabled }));
  }, []);

  const pauseFor = useCallback((hours: MasterPause) => setPause(hours), []);

  const setQuietHours = useCallback((next: QuietHours | null) => setQuietHoursState(next), []);

  return { prefs, set, pauseFor, pause, quietHours, setQuietHours };
}
