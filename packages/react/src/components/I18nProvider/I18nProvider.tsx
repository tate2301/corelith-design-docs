import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';

export type I18nMessages = Record<string, string>;

export interface I18nLocale {
  code: string;
  label?: string;
}

export interface I18nContextValue {
  locale: string;
  setLocale?: (code: string) => void;
  locales?: I18nLocale[];
  messages: I18nMessages;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export interface I18nProviderProps {
  locale: string;
  setLocale?: (code: string) => void;
  locales?: I18nLocale[];
  messages: I18nMessages;
  /** Optional fallback messages used when a key is missing in `messages`. */
  fallbackMessages?: I18nMessages;
  children?: ReactNode;
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k: string) => (vars[k] != null ? String(vars[k]) : `{${k}}`));
}

/**
 * I18nProvider — supplies a locale and message dictionary.
 *
 * @example
 * ```tsx
 * <I18nProvider />
 * ```
 */
export function I18nProvider({
  locale,
  setLocale,
  locales,
  messages,
  fallbackMessages,
  children,
}: I18nProviderProps) {
  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const raw = messages[key] ?? fallbackMessages?.[key] ?? key;
      return interpolate(raw, vars);
    },
    [messages, fallbackMessages],
  );

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, locales, messages, t }),
    [locale, setLocale, locales, messages, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within an <I18nProvider>.');
  }
  return ctx;
}

export function useT(): I18nContextValue['t'] {
  return useI18n().t;
}
