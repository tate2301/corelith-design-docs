import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, fireEvent, cleanup, act } from '@testing-library/react';
import {
  BottomSheet,
  Combobox,
  DataTable,
  Drawer,
  FilterChips,
  InputOtp,
  KanbanBoard,
  Modal,
  RoleSwitcher,
  SegmentedControl,
  Tabs,
  type DataTableColumn,
  type DataTableSortState,
} from '../index';

afterEach(() => cleanup());

// ─── Modal focus trap ────────────────────────────────────────────
describe('Modal — focus trap', () => {
  it('Tab from last focusable wraps to first', () => {
    const { container } = render(
      <Modal open onClose={() => {}} title="x">
        <button>a</button>
        <button>b</button>
        <button>c</button>
      </Modal>,
    );
    const buttons = container.ownerDocument.querySelectorAll('button');
    const first = buttons[0]! as HTMLButtonElement;
    const last = buttons[buttons.length - 1]! as HTMLButtonElement;
    last.focus();
    expect(document.activeElement).toBe(last);
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(first);
  });

  it('Shift+Tab from first wraps to last', () => {
    const { container } = render(
      <Modal open onClose={() => {}} title="x">
        <button>a</button>
        <button>b</button>
        <button>c</button>
      </Modal>,
    );
    const buttons = container.ownerDocument.querySelectorAll('button');
    const first = buttons[0]! as HTMLButtonElement;
    const last = buttons[buttons.length - 1]! as HTMLButtonElement;
    first.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it('renders with title and is dismissable with Escape', () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="x">
        body
      </Modal>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('honours dismissOnEscape=false', () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} dismissOnEscape={false} title="x">
        body
      </Modal>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('honours dismissOnBackdrop=false', () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal open onClose={onClose} dismissOnBackdrop={false} title="x">
        body
      </Modal>,
    );
    const overlay = container.ownerDocument.querySelector('.x-modal-overlay')!;
    fireEvent.click(overlay);
    expect(onClose).not.toHaveBeenCalled();
  });
});

// ─── Escape chain: nested overlays ──────────────────────────────
describe('Modal-inside-Drawer Escape chain', () => {
  it('Escape closes Modal first, then Drawer', () => {
    const onCloseDrawer = vi.fn();
    const onCloseModal = vi.fn();
    render(
      <>
        <Drawer open onClose={onCloseDrawer} title="d">
          drawer
        </Drawer>
        <Modal open onClose={onCloseModal} title="m">
          modal
        </Modal>
      </>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    // Modal was opened last, so it's on top — it closes first.
    expect(onCloseModal).toHaveBeenCalledTimes(1);
    expect(onCloseDrawer).not.toHaveBeenCalled();
  });
});

// ─── Drawer focus trap ───────────────────────────────────────────
describe('Drawer — focus trap', () => {
  it('Tab wraps last→first', () => {
    const { container } = render(
      <Drawer open onClose={() => {}} title="x">
        <button>a</button>
        <button>b</button>
      </Drawer>,
    );
    const buttons = container.ownerDocument.querySelectorAll('button');
    const last = buttons[buttons.length - 1]! as HTMLButtonElement;
    last.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    // The first focusable in a Drawer is the close (×) button.
    expect(document.activeElement).toBe(buttons[0]);
  });

  it('Shift+Tab wraps first→last', () => {
    const { container } = render(
      <Drawer open onClose={() => {}} title="x">
        <button>a</button>
        <button>b</button>
      </Drawer>,
    );
    const buttons = container.ownerDocument.querySelectorAll('button');
    const first = buttons[0]! as HTMLButtonElement;
    const last = buttons[buttons.length - 1]! as HTMLButtonElement;
    first.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);
  });
});

// ─── BottomSheet focus trap ──────────────────────────────────────
describe('BottomSheet — focus trap', () => {
  it('Tab wraps last→first', () => {
    const { container } = render(
      <BottomSheet open onClose={() => {}} title="x">
        <button>a</button>
        <button>b</button>
      </BottomSheet>,
    );
    const buttons = container.ownerDocument.querySelectorAll('button');
    const last = buttons[buttons.length - 1]! as HTMLButtonElement;
    last.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(buttons[0]);
  });

  it('Shift+Tab wraps first→last', () => {
    const { container } = render(
      <BottomSheet open onClose={() => {}} title="x">
        <button>a</button>
        <button>b</button>
      </BottomSheet>,
    );
    const buttons = container.ownerDocument.querySelectorAll('button');
    const first = buttons[0]! as HTMLButtonElement;
    const last = buttons[buttons.length - 1]! as HTMLButtonElement;
    first.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);
  });
});

// ─── Tabs keyboard navigation ────────────────────────────────────
describe('Tabs — keyboard nav', () => {
  function TabsHarness() {
    const [v, setV] = useState('a');
    return (
      <Tabs value={v} onValueChange={setV}>
        <Tabs.List>
          <Tabs.Tab value="a">A</Tabs.Tab>
          <Tabs.Tab value="b">B</Tabs.Tab>
          <Tabs.Tab value="c">C</Tabs.Tab>
        </Tabs.List>
      </Tabs>
    );
  }

  it('ArrowRight moves selection forward', () => {
    const { container } = render(<TabsHarness />);
    const tabs = container.querySelectorAll('[role="tab"]');
    (tabs[0] as HTMLElement).focus();
    fireEvent.keyDown(tabs[0]!, { key: 'ArrowRight' });
    expect(tabs[1]!.getAttribute('aria-selected')).toBe('true');
  });

  it('ArrowLeft moves selection backward', () => {
    const { container } = render(<TabsHarness />);
    const tabs = container.querySelectorAll('[role="tab"]');
    (tabs[1] as HTMLElement).click();
    fireEvent.keyDown(tabs[1]!, { key: 'ArrowLeft' });
    expect(tabs[0]!.getAttribute('aria-selected')).toBe('true');
  });

  it('Home jumps to first', () => {
    const { container } = render(<TabsHarness />);
    const tabs = container.querySelectorAll('[role="tab"]');
    (tabs[2] as HTMLElement).click();
    fireEvent.keyDown(tabs[2]!, { key: 'Home' });
    expect(tabs[0]!.getAttribute('aria-selected')).toBe('true');
  });

  it('End jumps to last', () => {
    const { container } = render(<TabsHarness />);
    const tabs = container.querySelectorAll('[role="tab"]');
    (tabs[0] as HTMLElement).focus();
    fireEvent.keyDown(tabs[0]!, { key: 'End' });
    expect(tabs[2]!.getAttribute('aria-selected')).toBe('true');
  });

  it('ArrowRight wraps from last to first', () => {
    const { container } = render(<TabsHarness />);
    const tabs = container.querySelectorAll('[role="tab"]');
    (tabs[2] as HTMLElement).click();
    fireEvent.keyDown(tabs[2]!, { key: 'ArrowRight' });
    expect(tabs[0]!.getAttribute('aria-selected')).toBe('true');
  });

  it('defaultValue selects the initial tab (uncontrolled)', () => {
    const { container } = render(
      <Tabs defaultValue="b">
        <Tabs.List>
          <Tabs.Tab value="a">A</Tabs.Tab>
          <Tabs.Tab value="b">B</Tabs.Tab>
        </Tabs.List>
      </Tabs>,
    );
    const tabs = container.querySelectorAll('[role="tab"]');
    expect(tabs[1]!.getAttribute('aria-selected')).toBe('true');
  });

  it('Uncontrolled Tabs respond to clicks', () => {
    const { container } = render(
      <Tabs defaultValue="a">
        <Tabs.List>
          <Tabs.Tab value="a">A</Tabs.Tab>
          <Tabs.Tab value="b">B</Tabs.Tab>
        </Tabs.List>
      </Tabs>,
    );
    const tabs = container.querySelectorAll('[role="tab"]');
    fireEvent.click(tabs[1]!);
    expect(tabs[1]!.getAttribute('aria-selected')).toBe('true');
  });
});

// ─── Combobox filter + select ────────────────────────────────────
describe('Combobox', () => {
  it('typing narrows the option list', () => {
    const { container, getByPlaceholderText } = render(
      <Combobox
        items={[
          { value: 'a', label: 'Apple' },
          { value: 'b', label: 'Banana' },
          { value: 'c', label: 'Cherry' },
        ]}
      />,
    );
    fireEvent.change(getByPlaceholderText('Search…'), { target: { value: 'an' } });
    const matches = container.querySelectorAll('.cb-item');
    // Banana matches 'an'
    expect(matches.length).toBe(1);
    expect(matches[0]!.textContent).toContain('Banana');
  });

  it('clicking an option fires onChange with value', () => {
    const onChange = vi.fn();
    const { container } = render(
      <Combobox
        items={[
          { value: 'a', label: 'Apple' },
          { value: 'b', label: 'Banana' },
        ]}
        onChange={onChange}
      />,
    );
    const items = container.querySelectorAll('.cb-item');
    fireEvent.click(items[1]!);
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0]![0]).toBe('b');
  });
});

// ─── InputOtp paste ─────────────────────────────────────────────
describe('InputOtp — paste', () => {
  it('paste of a 6-digit string distributes one digit per input', () => {
    function Harness() {
      const [v, setV] = useState('');
      return <InputOtp value={v} onChange={setV} length={6} />;
    }
    const { container } = render(<Harness />);
    const inputs = container.querySelectorAll<HTMLInputElement>('.input-otp-cell');
    fireEvent.paste(inputs[0]!, {
      clipboardData: { getData: () => '123456' },
    });
    expect(inputs[0]!.value).toBe('1');
    expect(inputs[1]!.value).toBe('2');
    expect(inputs[2]!.value).toBe('3');
    expect(inputs[3]!.value).toBe('4');
    expect(inputs[4]!.value).toBe('5');
    expect(inputs[5]!.value).toBe('6');
  });

  it('non-digit characters are stripped on paste', () => {
    function Harness() {
      const [v, setV] = useState('');
      return <InputOtp value={v} onChange={setV} length={4} />;
    }
    const { container } = render(<Harness />);
    const inputs = container.querySelectorAll<HTMLInputElement>('.input-otp-cell');
    fireEvent.paste(inputs[0]!, {
      clipboardData: { getData: () => '12-34' },
    });
    expect(inputs[0]!.value).toBe('1');
    expect(inputs[3]!.value).toBe('4');
  });

  it('ArrowRight moves focus to next cell', () => {
    function Harness() {
      const [v, setV] = useState('1');
      return <InputOtp value={v} onChange={setV} length={4} />;
    }
    const { container } = render(<Harness />);
    const inputs = container.querySelectorAll<HTMLInputElement>('.input-otp-cell');
    inputs[0]!.focus();
    fireEvent.keyDown(inputs[0]!, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(inputs[1]);
  });

  it('Backspace on empty cell focuses previous', () => {
    function Harness() {
      const [v, setV] = useState('12');
      return <InputOtp value={v} onChange={setV} length={4} />;
    }
    const { container } = render(<Harness />);
    const inputs = container.querySelectorAll<HTMLInputElement>('.input-otp-cell');
    inputs[2]!.focus();
    fireEvent.keyDown(inputs[2]!, { key: 'Backspace' });
    expect(document.activeElement).toBe(inputs[1]);
  });
});

// ─── DataTable sort ──────────────────────────────────────────────
describe('DataTable — sort', () => {
  type Row = { id: string; name: string };
  const columns: DataTableColumn<Row>[] = [
    { id: 'name', header: 'Name', sortable: true },
  ];
  const rows: Row[] = [{ id: '1', name: 'a' }];

  it('clicking sortable header fires onSort with { column, direction: "asc" }', () => {
    const onSortChange = vi.fn();
    const { container } = render(
      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        onSortChange={onSortChange}
      />,
    );
    const th = container.querySelector('th.sortable')!;
    fireEvent.click(th);
    expect(onSortChange).toHaveBeenCalled();
    const arg = onSortChange.mock.calls[0]![0] as DataTableSortState;
    expect(arg.column).toBe('name');
    expect(arg.direction).toBe('asc');
  });

  it('clicking already-asc header sorts desc', () => {
    const onSortChange = vi.fn();
    const { container } = render(
      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        sort={{ column: 'name', direction: 'asc' }}
        onSortChange={onSortChange}
      />,
    );
    const th = container.querySelector('th.sortable')!;
    fireEvent.click(th);
    const arg = onSortChange.mock.calls[0]![0] as DataTableSortState;
    expect(arg.direction).toBe('desc');
  });

  it('clicking already-desc header clears sort', () => {
    const onSortChange = vi.fn();
    const { container } = render(
      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        sort={{ column: 'name', direction: 'desc' }}
        onSortChange={onSortChange}
      />,
    );
    const th = container.querySelector('th.sortable')!;
    fireEvent.click(th);
    expect(onSortChange).toHaveBeenCalledWith(undefined);
  });

  it('deprecated columnId on sort still drives header state', () => {
    // Pass a sort with `column` omitted but `columnId` present (legacy API).
    const legacySort = { columnId: 'name', direction: 'asc' as const } as unknown as DataTableSortState;
    const { container } = render(
      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        sort={legacySort}
        onSortChange={() => {}}
      />,
    );
    const th = container.querySelector('th.sortable')!;
    expect(th.getAttribute('aria-sort')).toBe('ascending');
  });
});

// ─── KanbanBoard keyboard ────────────────────────────────────────
describe('KanbanBoard — keyboard', () => {
  function makeBoard(onMove = vi.fn()) {
    const columns = [
      { id: 'todo', title: 'Todo' },
      { id: 'done', title: 'Done' },
    ];
    const items = {
      todo: [{ id: 'i1', title: 'one' }],
      done: [] as { id: string; title: string }[],
    };
    return { columns, items, onMove };
  }

  it('Space picks up a card (aria-grabbed=true)', () => {
    const { columns, items } = makeBoard();
    const { container } = render(
      <KanbanBoard columns={columns} items={items} />,
    );
    const card = container.querySelector('[data-item-id="i1"]')! as HTMLElement;
    card.focus();
    fireEvent.keyDown(card, { key: ' ' });
    expect(card.getAttribute('aria-grabbed')).toBe('true');
  });

  it('Arrow key moves card to adjacent column after pickup', () => {
    const { columns, items, onMove } = makeBoard();
    const { container } = render(
      <KanbanBoard columns={columns} items={items} onMove={onMove} />,
    );
    const card = container.querySelector('[data-item-id="i1"]')! as HTMLElement;
    card.focus();
    fireEvent.keyDown(card, { key: ' ' });
    fireEvent.keyDown(card, { key: 'ArrowRight' });
    expect(onMove).toHaveBeenCalledWith('i1', 'todo', 'done', 0);
  });

  it('Enter drops the picked-up card', () => {
    const { columns, items } = makeBoard();
    const { container } = render(
      <KanbanBoard columns={columns} items={items} />,
    );
    const card = container.querySelector('[data-item-id="i1"]')! as HTMLElement;
    card.focus();
    fireEvent.keyDown(card, { key: ' ' });
    expect(card.getAttribute('aria-grabbed')).toBe('true');
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(card.getAttribute('aria-grabbed')).not.toBe('true');
  });

  it('Escape cancels pickup without moving', () => {
    const { columns, items, onMove } = makeBoard();
    const { container } = render(
      <KanbanBoard columns={columns} items={items} onMove={onMove} />,
    );
    const card = container.querySelector('[data-item-id="i1"]')! as HTMLElement;
    card.focus();
    fireEvent.keyDown(card, { key: ' ' });
    fireEvent.keyDown(card, { key: 'Escape' });
    expect(card.getAttribute('aria-grabbed')).not.toBe('true');
    expect(onMove).not.toHaveBeenCalled();
  });
});

// ─── SegmentedControl uncontrolled ──────────────────────────────
describe('SegmentedControl — uncontrolled', () => {
  it('defaultValue selects the initial option', () => {
    const { container } = render(
      <SegmentedControl
        defaultValue="b"
        options={[
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
        ]}
      />,
    );
    const items = container.querySelectorAll('[role="radio"]');
    expect(items[1]!.getAttribute('aria-checked')).toBe('true');
  });

  it('clicking switches selection in uncontrolled mode', () => {
    const { container } = render(
      <SegmentedControl
        defaultValue="a"
        options={[
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
        ]}
      />,
    );
    const items = container.querySelectorAll('[role="radio"]');
    fireEvent.click(items[1]!);
    expect(items[1]!.getAttribute('aria-checked')).toBe('true');
  });
});

// ─── FilterChips uncontrolled ───────────────────────────────────
describe('FilterChips — uncontrolled', () => {
  it('defaultValue selects the initial chip', () => {
    const { container } = render(
      <FilterChips
        defaultValue="open"
        options={[
          { value: 'all', label: 'All' },
          { value: 'open', label: 'Open' },
        ]}
      />,
    );
    const items = container.querySelectorAll('[role="radio"]');
    expect(items[1]!.getAttribute('aria-checked')).toBe('true');
  });
});

// ─── RoleSwitcher uncontrolled ──────────────────────────────────
describe('RoleSwitcher — uncontrolled', () => {
  it('defaultValue selects the initial role', () => {
    const { container } = render(
      <RoleSwitcher
        defaultValue="admin"
        options={[
          { value: 'driver', label: 'Driver' },
          { value: 'admin', label: 'Admin' },
        ]}
      />,
    );
    const btns = container.querySelectorAll('button');
    expect(btns[1]!.getAttribute('aria-pressed')).toBe('true');
  });

  it('clicking switches selection in uncontrolled mode', () => {
    const { container } = render(
      <RoleSwitcher
        defaultValue="driver"
        options={[
          { value: 'driver', label: 'Driver' },
          { value: 'admin', label: 'Admin' },
        ]}
      />,
    );
    const btns = container.querySelectorAll('button');
    fireEvent.click(btns[1]!);
    expect(btns[1]!.getAttribute('aria-pressed')).toBe('true');
  });
});

// ─── Ref forwarding sanity checks ───────────────────────────────
describe('Refs', () => {
  it('Modal forwards ref to the dialog element', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <Modal ref={ref} open onClose={() => {}} title="x">
        body
      </Modal>,
    );
    expect(ref.current).not.toBeNull();
    expect(ref.current?.getAttribute('role')).toBe('dialog');
  });

  it('Drawer forwards ref to the drawer element', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <Drawer ref={ref} open onClose={() => {}} title="x">
        body
      </Drawer>,
    );
    expect(ref.current).not.toBeNull();
    expect(ref.current?.getAttribute('role')).toBe('dialog');
  });

  it('BottomSheet forwards ref to the sheet element', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <BottomSheet ref={ref} open onClose={() => {}} title="x">
        body
      </BottomSheet>,
    );
    expect(ref.current).not.toBeNull();
    expect(ref.current?.getAttribute('role')).toBe('dialog');
  });
});

// suppress unused
void act;
