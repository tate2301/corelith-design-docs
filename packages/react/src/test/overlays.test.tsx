import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, cleanup, act } from '@testing-library/react';
import {
  AlertDialog,
  Button,
  CommandPalette,
  Combobox,
  DropdownMenu,
  Modal,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Sheet,
  Toaster,
  Tooltip,
  toast,
} from '../index';

afterEach(() => {
  act(() => {
    toast.dismiss();
  });
  cleanup();
});

describe('Modal and Sheet', () => {
  it('uses onOpenChange for modal escape/backdrop close requests', () => {
    const onOpenChange = vi.fn();
    render(
      <Modal open onOpenChange={onOpenChange} title="Confirm">
        Body
      </Modal>,
    );

    expect(document.body.querySelector('[role="dialog"]')!.textContent).toContain('Confirm');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('renders Sheet as the drawer primitive', () => {
    const onOpenChange = vi.fn();
    render(
      <Sheet open onOpenChange={onOpenChange} side="right" title="Filters">
        Body
      </Sheet>,
    );

    expect(document.body.querySelector('.drawer')!.textContent).toContain('Filters');
    fireEvent.pointerDown(document.body.querySelector('.modal-scrim')!);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe('Popover', () => {
  it('exposes compound trigger/content with data-state hooks', () => {
    const onOpenChange = vi.fn();
    const { getByRole } = render(
      <Popover onOpenChange={onOpenChange}>
        <PopoverTrigger>
          <Button>Open</Button>
        </PopoverTrigger>
        <PopoverContent>Popover body</PopoverContent>
      </Popover>,
    );

    const trigger = getByRole('button');
    expect(trigger.getAttribute('data-state')).toBe('closed');
    fireEvent.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(document.body.querySelector('.popover')!.textContent).toBe('Popover body');
    expect(trigger.getAttribute('data-state')).toBe('open');
  });
});

describe('DropdownMenu', () => {
  it('renders compound menu items and supports item asChild', () => {
    const onSelect = vi.fn();
    const { getByRole } = render(
      <DropdownMenu defaultOpen>
        <DropdownMenu.Trigger>
          <Button>Actions</Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Label>Export</DropdownMenu.Label>
          <DropdownMenu.Item onSelect={onSelect}>CSV</DropdownMenu.Item>
          <DropdownMenu.Item asChild destructive>
            <a href="/delete">Delete</a>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>,
    );

    const items = document.body.querySelectorAll('[role="menuitem"]');
    expect(items.length).toBe(2);
    expect(items[1]!.className).toContain('danger');
    expect(items[1]!.tagName).toBe('A');
    fireEvent.click(getByRole('menuitem', { name: 'CSV' }));
    expect(onSelect).toHaveBeenCalled();
  });
});

describe('AlertDialog', () => {
  it('uses the Radix-style compound API and closes from cancel/action', () => {
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();
    render(
      <AlertDialog open onOpenChange={onOpenChange}>
        <AlertDialog.Content destructive>
          <AlertDialog.Title>Delete invoice</AlertDialog.Title>
          <AlertDialog.Description>This cannot be undone.</AlertDialog.Description>
          <AlertDialog.Footer>
            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
            <AlertDialog.Action destructive onClick={onConfirm}>
              Delete
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>,
    );

    expect(document.body.querySelector('[role="alertdialog"]')).toBeTruthy();
    fireEvent.click(document.body.querySelector('[data-ad-cancel]')!);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    fireEvent.click(document.body.querySelector('.btn-destructive')!);
    expect(onConfirm).toHaveBeenCalled();
  });
});

describe('CommandPalette and Combobox', () => {
  it('filters commands and closes after selection', () => {
    const onSelect = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <CommandPalette
        open
        onOpenChange={onOpenChange}
        commands={[
          { id: 'a', label: 'Apple', onSelect },
          { id: 'b', label: 'Banana', onSelect: vi.fn() },
        ]}
      />,
    );

    const input = document.body.querySelector<HTMLInputElement>('input[role="combobox"]')!;
    fireEvent.change(input, { target: { value: 'apple' } });
    fireEvent.click(document.body.querySelector('[role="option"]')!);
    expect(onSelect).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('opens Combobox, filters options, and emits onValueChange', () => {
    const onValueChange = vi.fn();
    const { getByRole } = render(
      <Combobox
        options={[
          { value: 'a', label: 'Apple' },
          { value: 'b', label: 'Banana' },
        ]}
        onValueChange={onValueChange}
      />,
    );

    fireEvent.click(getByRole('combobox'));
    fireEvent.change(document.body.querySelector<HTMLInputElement>('input[role="searchbox"]')!, {
      target: { value: 'ban' },
    });
    const matches = document.body.querySelectorAll('.cb-item');
    expect(matches.length).toBe(1);
    fireEvent.click(matches[0]!);
    expect(onValueChange).toHaveBeenCalledWith('b');
  });
});

describe('Tooltip and Toaster', () => {
  it('supports controlled tooltip rendering', () => {
    render(
      <Tooltip content="hint" open>
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    expect(document.body.querySelector('[role="tooltip"]')!.textContent).toBe('hint');
  });

  it('renders module-scoped toast notifications through Toaster', () => {
    render(<Toaster position="top-right" />);
    act(() => {
      toast.success('Saved', { duration: Infinity });
    });

    const region = document.body.querySelector('[aria-label="Notifications"]')!;
    expect(region.textContent).toContain('Saved');
    act(() => {
      fireEvent.click(document.body.querySelector('[aria-label="Dismiss notification"]')!);
    });
    expect(document.body.querySelector('[aria-label="Notifications"]')!.textContent).not.toContain('Saved');
  });
});
