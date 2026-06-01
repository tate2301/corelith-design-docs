import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';

export type OfflineState = 'offline' | 'reconnecting';

export interface OfflineBannerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Banner state. 'offline' is a dark bar; 'reconnecting' is an info bar with a spinner. @default 'offline' */
  state?: OfflineState;
  /** Optional leading icon (offline state only). Ignored when reconnecting (spinner shown). */
  icon?: ReactNode;
  /** Primary line ("Offline since 14:12 · receipts queue locally"). */
  title: ReactNode;
  /** Secondary explanatory line. */
  detail?: ReactNode;
  /** Right-aligned action (Retry). Offline state only. */
  action?: ReactNode;
}

function Spinner() {
  // Inline SVG spinner — no CSS class exists; uses tokens for colour.
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" style={{ animation: 'cor-spin 0.8s linear infinite' }}>
      <circle cx="12" cy="12" r="9" stroke="rgba(11,93,240,0.2)" strokeWidth="2" fill="none" />
      <path d="M12 3a9 9 0 0 1 9 9" stroke="var(--brand)" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/**
 * OfflineBanner — an offline / reconnecting status banner. The product is
 * offline-first, so it never blocks the page. Maps to `system/b-offline-banner.html`.
 *
 * Note: the reconnecting spinner uses the `@keyframes cor-spin` rule shipped
 * in the design-system stylesheet (components.css).
 *
 * @example
 * ```tsx
 * <OfflineBanner
 *   state="offline"
 *   icon={<CloudOffIcon />}
 *   title="Offline since 14:12 · receipts queue locally"
 *   detail="POS, stock, and HR still work. New receipts will sync when you reconnect."
 *   action={<Button variant="quiet" style={{ color: '#fff' }}>Retry</Button>}
 * />
 * ```
 */
export const OfflineBanner = forwardRef<HTMLDivElement, OfflineBannerProps>(function OfflineBanner(
  { state = 'offline', icon, title, detail, action, className, style, ...rest },
  ref,
) {
  if (state === 'reconnecting') {
    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        className={cn('offline-banner', 'offline-banner-reconnecting', className)}
        style={{
          background: 'var(--tone-info-bg)',
          border: '1px solid var(--tone-info-bd)',
          borderRadius: 10,
          padding: '12px 18px',
          display: 'flex',
          gap: 14,
          alignItems: 'center',
          ...style,
        }}
        {...rest}
      >
        <Spinner />
        <div style={{ flex: 1, color: 'var(--brand-strong)' }}>
          <div style={{ font: '600 13px/1.3 var(--font-sans)' }}>{title}</div>
          {detail != null ? <div style={{ font: '12px/1.3 var(--font-sans)', opacity: 0.8 }}>{detail}</div> : null}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      className={cn('offline-banner', 'offline-banner-offline', className)}
      style={{
        background: 'var(--ink)',
        color: '#fff',
        borderRadius: 10,
        padding: '12px 18px',
        display: 'flex',
        gap: 16,
        alignItems: 'center',
        ...style,
      }}
      {...rest}
    >
      {icon ? (
        <span
          aria-hidden="true"
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: 'var(--tone-warn)',
            color: '#fff',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          {icon}
        </span>
      ) : null}
      <div style={{ flex: 1 }}>
        <div style={{ font: '600 13px/1.3 var(--font-sans)' }}>{title}</div>
        {detail != null ? (
          <div style={{ font: '12px/1.3 var(--font-sans)', color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>{detail}</div>
        ) : null}
      </div>
      {action ? <div style={{ flex: 'none' }}>{action}</div> : null}
    </div>
  );
});
