"use client";

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
  /** Props forwarded to the trigger Button. Spread last, so `variant`, `size`
   *  and friends override this component's defaults. */
  triggerProps?: ButtonProps;
  /**
   * Extra classes for the TRIGGER button. Merged with
   * `triggerProps.className` rather than replacing it.
   */
  triggerClassName?: string;
  side?: Side;
  align?: Align;
  /**
   * Extra classes for the MENU CONTENT (the popover), NOT the trigger — the
   * menu is portalled to `document.body`, so this is the only way to reach it.
   * Use `triggerClassName` for the button.
   */
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
 * family for the trigger. The popover itself maps to `.export-menu` in
 * surfaces.css.
 *
 * @example
 * <ExportMenu onExport={(id) => download(id)} />
 *
 * @example
 * // `className` styles the popover; `triggerClassName` styles the button.
 * <ExportMenu
 *   label="Download"
 *   triggerClassName="ml-auto"
 *   triggerProps={{ variant: 'primary', size: 'sm' }}
 *   className="wide-export-menu"
 *   formats={[{ id: 'xlsx', label: 'Excel', description: 'Formatted workbook' }]}
 * />
 *
 * Accessibility:
 *   - Inherits DropdownMenu semantics: trigger `aria-haspopup="menu"` +
 *     `aria-expanded`, items `role="menuitem"`, Arrow/Enter/Esc handling.
 *   - Each format row keeps its label as the accessible name; the description is
 *     supplementary text inside the same item.
 */
export const ExportMenu = forwardRef<HTMLButtonElement, ExportMenuProps>(function ExportMenu(
  {
    formats = DEFAULT_FORMATS,
    onExport,
    label = 'Export',
    triggerProps,
    triggerClassName,
    side = 'bottom',
    align = 'start',
    className,
  },
  ref,
) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        {/* `triggerProps` is spread AFTER `variant`, so callers can override the
            default secondary styling. `className` is applied after the spread so
            `triggerClassName` is merged rather than clobbered. */}
        <Button
          ref={ref}
          variant="secondary"
          {...triggerProps}
          className={cn(triggerClassName, triggerProps?.className)}
        >
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side={side} align={align} className={cn('export-menu', className)}>
        {formats.map((fmt) => (
          <DropdownMenuItem
            key={fmt.id}
            disabled={fmt.disabled}
            onSelect={() => onExport?.(fmt.id)}
          >
            <span className={cn('export-menu-item', Boolean(fmt.icon) && 'has-icon')}>
              {fmt.icon ? (
                <span aria-hidden="true" className="export-menu-item-icon">
                  {fmt.icon}
                </span>
              ) : null}
              <span>
                <span className="export-menu-item-label">{fmt.label}</span>
                {fmt.description != null ? (
                  <span className="export-menu-item-desc">{fmt.description}</span>
                ) : null}
              </span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
