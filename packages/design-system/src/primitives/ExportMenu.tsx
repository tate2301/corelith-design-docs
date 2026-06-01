import {
  forwardRef,
  type ReactNode,
} from 'react';
import { cn } from '../utils/cn';
import { Button, type ButtonProps } from './Button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './DropdownMenu';
import type { Align, Side } from '../utils/usePosition';

export interface ExportFormat {
  /** Identifier emitted on select, e.g. "csv". */
  id: string;
  /** Visible label, e.g. "CSV". */
  label: ReactNode;
  /** Optional descriptive subline. */
  description?: ReactNode;
  /** Optional leading icon. */
  icon?: ReactNode;
  disabled?: boolean;
}

export interface ExportMenuProps {
  /** Available export formats. @default CSV / JSON / PDF */
  formats?: ExportFormat[];
  /** Fires with the chosen format id. */
  onExport?: (id: string) => void;
  /** Trigger button label. @default 'Export' */
  label?: ReactNode;
  /** Props forwarded to the trigger Button. */
  triggerProps?: ButtonProps;
  side?: Side;
  align?: Align;
  className?: string;
}

const DEFAULT_FORMATS: ExportFormat[] = [
  { id: 'csv', label: 'CSV', description: 'Raw rows for Excel' },
  { id: 'json', label: 'JSON', description: 'Structured data' },
  { id: 'pdf', label: 'PDF', description: 'Report-style document' },
];

/**
 * ExportMenu — a dropdown of export formats (CSV / JSON / PDF).
 * Composes the `DropdownMenu` primitive (and therefore its `.menu` /
 * `.menu-item` classes + roving-focus keyboard model) plus the shared `.btn`
 * family for the trigger.
 *
 * Accessibility:
 *   - Inherits DropdownMenu semantics: trigger `aria-haspopup="menu"` +
 *     `aria-expanded`, items `role="menuitem"`, Arrow/Enter/Esc handling.
 *   - Each format row keeps its label as the accessible name; the description is
 *     supplementary text inside the same item.
 */
export const ExportMenu = forwardRef<HTMLButtonElement, ExportMenuProps>(function ExportMenu(
  { formats = DEFAULT_FORMATS, onExport, label = 'Export', triggerProps, side = 'bottom', align = 'start', className },
  ref,
) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button ref={ref} variant="secondary" {...triggerProps}>
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side={side} align={align} className={cn('export-menu', className)} style={{ minWidth: 220 }}>
        {formats.map((fmt) => (
          <DropdownMenuItem
            key={fmt.id}
            disabled={fmt.disabled}
            onSelect={() => onExport?.(fmt.id)}
          >
            <span
              style={{
                display: 'grid',
                gridTemplateColumns: fmt.icon ? '24px 1fr' : '1fr',
                gap: 10,
                alignItems: 'center',
                width: '100%',
              }}
            >
              {fmt.icon ? (
                <span aria-hidden="true" style={{ color: 'var(--text-muted)' }}>
                  {fmt.icon}
                </span>
              ) : null}
              <span>
                <span style={{ display: 'block', font: '500 13px/1 var(--font-sans)' }}>{fmt.label}</span>
                {fmt.description != null ? (
                  <span
                    style={{
                      display: 'block',
                      font: '11.5px/1.2 var(--font-sans)',
                      color: 'var(--text-muted)',
                      marginTop: 2,
                    }}
                  >
                    {fmt.description}
                  </span>
                ) : null}
              </span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
