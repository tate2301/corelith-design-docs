import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cx } from '../../utils/cx';
import { useI18n, type I18nLocale } from '../I18nProvider/I18nProvider';
import './LocalePicker.css';

export interface LocalePickerProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
  /** Override the locales pulled from `I18nProvider`. */
  locales?: I18nLocale[];
  onChange?: (locale: string) => void;
  /** Visible label rendered alongside the picker. */
  label?: string;
}

/**
 * LocalePicker — locale chooser bound to I18nProvider.
 *
 * @example
 * ```tsx
 * <LocalePicker />
 * ```
 */
export const LocalePicker = forwardRef<HTMLSelectElement, LocalePickerProps>(function LocalePicker(
  { locales, onChange, label, className, ...rest },
  ref,
) {
  const i18n = useI18n();
  const opts = locales ?? i18n.locales ?? [{ code: i18n.locale, label: i18n.locale }];
  const handle = (code: string) => {
    onChange?.(code);
    i18n.setLocale?.(code);
  };
  return (
    <label className={cx('locale-picker', className)}>
      {label ? <span className="locale-picker-label">{label}</span> : null}
      <select
        ref={ref}
        className="select"
        value={i18n.locale}
        onChange={(e) => handle(e.target.value)}
        {...rest}
      >
        {opts.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label ?? l.code}
          </option>
        ))}
      </select>
    </label>
  );
});
