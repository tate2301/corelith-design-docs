import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import {
  BottomSheet,
  Drawer,
  Modal,
  Dialog,
  Popover,
  CommandPalette,
  Tooltip,
  Menu,
  Toast,
  ToastProvider,
  useToast,
  Combobox,
} from '../index';

afterEach(() => cleanup());

describe('BottomSheet', () => {
  it('renders when open and closes on Escape', () => {
    const onClose = vi.fn();
    const { getByText, rerender } = render(
      <BottomSheet open title="Hi" onClose={onClose}>
        body
      </BottomSheet>,
    );
    expect(getByText('body')).toBeTruthy();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
    rerender(<BottomSheet open={false} onClose={onClose} />);
  });
});

describe('Drawer', () => {
  it('renders when open and emits close on backdrop', () => {
    const onClose = vi.fn();
    const { container } = render(
      <Drawer open onClose={onClose} title="Settings">
        body
      </Drawer>,
    );
    const backdrop = container.ownerDocument.querySelector('.x-drawer-overlay')!;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });
});

describe('Modal', () => {
  it('renders title and closes on Escape', () => {
    const onClose = vi.fn();
    const { getByText } = render(
      <Modal open onClose={onClose} title="Confirm">
        body
      </Modal>,
    );
    expect(getByText('Confirm')).toBeTruthy();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});

describe('Dialog', () => {
  it('renders confirm and cancel and routes clicks', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    const { getByText } = render(
      <Dialog
        open
        onClose={onClose}
        onConfirm={onConfirm}
        confirmLabel="OK"
        cancelLabel="Cancel"
        title="Confirm"
      >
        body
      </Dialog>,
    );
    fireEvent.click(getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
    fireEvent.click(getByText('OK'));
    expect(onConfirm).toHaveBeenCalled();
  });
});

describe('Popover', () => {
  it('renders when open and closes on Escape', () => {
    const onClose = vi.fn();
    const { getByText } = render(
      <Popover open onClose={onClose} title="Hi">
        content
      </Popover>,
    );
    expect(getByText('content')).toBeTruthy();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});

describe('CommandPalette', () => {
  it('filters items by query and runs onSelect', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    const { container, getByPlaceholderText } = render(
      <CommandPalette
        open
        onClose={onClose}
        items={[
          { id: 'a', label: 'Apple', onSelect },
          { id: 'b', label: 'Banana' },
        ]}
      />,
    );
    const input = getByPlaceholderText('Type a command or search…') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'ban' } });
    const matches = container.ownerDocument.querySelectorAll('.cmdk-item');
    expect(matches.length).toBe(1);
    expect(matches[0]!.textContent).toContain('Banana');
    fireEvent.change(input, { target: { value: 'apple' } });
    fireEvent.click(container.ownerDocument.querySelector('.cmdk-item')!);
    expect(onSelect).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});

describe('Tooltip', () => {
  it('shows content on hover', () => {
    const { getByRole, queryByRole } = render(
      <Tooltip content="hint">
        <button>btn</button>
      </Tooltip>,
    );
    expect(queryByRole('tooltip')).toBeNull();
    fireEvent.mouseEnter(getByRole('button'));
    expect(queryByRole('tooltip')!.textContent).toBe('hint');
  });
});

describe('Menu', () => {
  it('renders items with menuitem role', () => {
    const { getAllByRole } = render(
      <Menu>
        <Menu.Item>One</Menu.Item>
        <Menu.Item destructive>Delete</Menu.Item>
      </Menu>,
    );
    const items = getAllByRole('menuitem');
    expect(items.length).toBe(2);
    expect(items[1]!.className).toContain('danger');
  });
});

describe('Combobox', () => {
  it('filters by query', () => {
    const { container, getByPlaceholderText } = render(
      <Combobox
        items={[
          { value: 'a', label: 'Apple' },
          { value: 'b', label: 'Banana' },
        ]}
      />,
    );
    fireEvent.change(getByPlaceholderText('Search…'), { target: { value: 'ban' } });
    const matches = container.querySelectorAll('.cb-item');
    expect(matches.length).toBe(1);
  });
});

describe('Toast', () => {
  it('useToast() show() pushes a toast that renders in the portal', () => {
    function Tester() {
      const { show } = useToast();
      return <button onClick={() => show({ title: 'Saved', tone: 'success' })}>go</button>;
    }
    const { getByRole, container } = render(
      <ToastProvider container={document.body}>
        <Tester />
      </ToastProvider>,
    );
    fireEvent.click(getByRole('button'));
    const stack = document.body.querySelector('.toast-stack')!;
    expect(stack.textContent).toContain('Saved');
    // Suppress unused container.
    void container;
  });

  it('Toast renders given an item directly', () => {
    const { getByText } = render(
      <Toast
        item={{ id: 't', tone: 'info', duration: 0, title: 'Hello' }}
        onDismiss={() => {}}
      />,
    );
    expect(getByText('Hello')).toBeTruthy();
  });
});
