"use client";

import { useEffect, useMemo, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Command, type CommandItem } from '../primitives/Command';

export interface PaletteCommand {
  /** Unique id. */
  id: string;
  /** Visible label — what the user searches against. */
  label: string;
  /** Optional secondary description line. */
  description?: string;
  /** Optional secondary keywords folded into the fuzzy match. */
  keywords?: string[];
  /** Optional group/section name. Items with the same group are clustered. */
  group?: string;
  /** Optional leading icon node. */
  icon?: ReactNode;
  /** Optional trailing shortcut hint (e.g. "⌘N"). */
  shortcut?: ReactNode;
  /** Fired when the command is chosen. The palette closes afterwards. */
  onSelect: () => void;
  /** Disable the command (shown greyed, not selectable). */
  disabled?: boolean;
}

export interface CommandPaletteProps {
  /** Controlled open state. */
  open: boolean;
  /** Fires when the palette wants to open/close. */
  onOpenChange: (open: boolean) => void;
  /** Commands to show. Grouping is derived from each item's `group`. */
  commands: PaletteCommand[];
  /** Placeholder for the search box. @default 'Type a command or search…' */
  placeholder?: string;
  /** Text shown when nothing matches. @default 'No matching commands' */
  emptyText?: ReactNode;
  /** Bind ⌘K / Ctrl+K globally to toggle the palette. @default true */
  bindHotkey?: boolean;
}

/**
 * CommandPalette — a ⌘K modal that wraps the `Command` primitive. It supplies
 * the dialog chrome (portal, scrim, scroll-lock, ESC, ⌘K hotkey) and maps the
 * palette's per-command `onSelect` callbacks onto the primitive's single
 * `onSelect(item)` handler, closing the palette after a choice.
 *
 * Fuzzy search, grouping and arrow-key navigation are inherited from `Command`.
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 * <CommandPalette
 *   open={open}
 *   onOpenChange={setOpen}
 *   commands={[
 *     { id: 'new-invoice', label: 'New invoice', group: 'Create', shortcut: '⌘N',
 *       onSelect: () => router.push('/invoices/new') },
 *     { id: 'goto-mukamba', label: 'Go to Mukamba Group', group: 'Suppliers',
 *       keywords: ['supplier', 'harare'], onSelect: () => router.push('/suppliers/SUP-01') },
 *   ]}
 * />
 * ```
 */
export function CommandPalette({
  open,
  onOpenChange,
  commands,
  placeholder = 'Type a command or search…',
  emptyText = 'No matching commands',
  bindHotkey = true,
}: CommandPaletteProps) {
  // Global ⌘K / Ctrl+K toggle.
  useEffect(() => {
    if (!bindHotkey) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [bindHotkey, open, onOpenChange]);

  // Esc to close + scroll lock while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onOpenChange(false);
      }
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onOpenChange]);

  // Map palette commands → Command primitive items, keeping a lookup so we can
  // fire the matching per-command callback on select.
  const { items, byId } = useMemo(() => {
    const lookup = new Map<string, PaletteCommand>();
    const mapped: CommandItem[] = commands.map((c) => {
      lookup.set(c.id, c);
      return {
        id: c.id,
        label: c.label,
        description: c.description,
        icon: c.icon,
        shortcut: c.shortcut,
        group: c.group,
        keywords: c.keywords,
        disabled: c.disabled,
      };
    });
    return { items: mapped, byId: lookup };
  }, [commands]);

  if (!open) return null;
  const portalTarget = typeof document !== 'undefined' ? document.body : null;
  if (!portalTarget) return null;

  return createPortal(
    <div
      className="modal-scrim"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(42,38,34,0.32)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
        zIndex: 1150,
      }}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onOpenChange(false);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        style={{ width: '100%', maxWidth: 560 }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <Command
          items={items}
          placeholder={placeholder}
          emptyMessage={emptyText}
          onSelect={(item) => {
            const cmd = byId.get(item.id);
            if (!cmd || cmd.disabled) return;
            cmd.onSelect();
            onOpenChange(false);
          }}
        />
      </div>
    </div>,
    portalTarget,
  );
}
