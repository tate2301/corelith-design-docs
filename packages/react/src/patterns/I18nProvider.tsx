"use client";

import { createContext, useContext, useState, type ReactNode } from 'react';

export type Translations = Record<string, string>;

export interface I18nContextValue {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return (key: string, vars?: Record<string, string | number>) => {
      let result = key;
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        });
      }
      return result;
    };
  }
  return ctx.t;
}

export function useI18n() {
  return useContext(I18nContext);
}

export interface I18nProviderProps {
  locale?: string;
  translations?: Record<string, Translations>;
  onLocaleChange?: (locale: string) => void;
  children?: ReactNode;
}

export function I18nProvider({
  locale: initialLocale = 'en',
  translations = {},
  onLocaleChange,
  children,
}: I18nProviderProps) {
  const [locale, setLocaleState] = useState(initialLocale);

  const setLocale = (newLocale: string) => {
    setLocaleState(newLocale);
    onLocaleChange?.(newLocale);
  };

  const t = (key: string, vars?: Record<string, string | number>) => {
    const localeDict = translations[locale] || {};
    let template = localeDict[key] || key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        template = template.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return template;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}
