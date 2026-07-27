"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';
import { Switch } from '../primitives/Switch';

export interface NotificationChannel {
  key: string;
  label: ReactNode;
}

export interface NotificationItemSetting {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  channels: Record<string, boolean>;
}

export interface NotificationMatrixProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onToggle'> {
  channels: NotificationChannel[];
  items: NotificationItemSetting[];
  onToggle?: (itemId: string, channelKey: string, enabled: boolean) => void;
}

export const NotificationMatrix = forwardRef<HTMLDivElement, NotificationMatrixProps>(
  function NotificationMatrix({ channels = [], items = [], onToggle, className, style, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('b-notification-matrix', className)}
        style={{
          width: '100%',
          border: '1px solid var(--border, #e5e7eb)',
          borderRadius: 12,
          overflow: 'hidden',
          backgroundColor: 'var(--surface, #ffffff)',
          ...style,
        }}
        {...props}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--surface-muted, #f9fafb)', borderBottom: '1px solid var(--border, #e5e7eb)' }}>
              <th style={{ padding: '12px 16px', font: '600 13px/1 var(--font-sans)', color: 'var(--text-strong)' }}>
                Notification Type
              </th>
              {channels.map((ch) => (
                <th
                  key={ch.key}
                  style={{
                    padding: '12px 16px',
                    font: '600 13px/1 var(--font-sans)',
                    color: 'var(--text-strong)',
                    textAlign: 'center',
                    width: 100,
                  }}
                >
                  {ch.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--border, #e5e7eb)' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ font: '500 14px/1.3 var(--font-sans)', color: 'var(--text-strong)' }}>
                    {item.title}
                  </div>
                  {item.description && (
                    <div style={{ font: 'var(--type-body-sm)', color: 'var(--text-muted)', marginTop: 2 }}>
                      {item.description}
                    </div>
                  )}
                </td>
                {channels.map((ch) => (
                  <td key={ch.key} style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <Switch
                      checked={Boolean(item.channels[ch.key])}
                      onChange={(e) => onToggle?.(item.id, ch.key, e.target.checked)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },
);
