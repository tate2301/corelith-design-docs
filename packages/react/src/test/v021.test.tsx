import { describe, it, expect, vi } from 'vitest';
import { act } from 'react';
import { render, fireEvent, cleanup, renderHook } from '@testing-library/react';
import {
  AlertDialog,
  CommentsThread,
  DatePicker,
  KanbanBoard,
  NotificationMatrix,
  useComments,
  useDateRange,
  useKanban,
  usePreferences,
} from '../index';

afterEach(() => cleanup());

// ── AlertDialog ─────────────────────────────────────────────────
describe('AlertDialog', () => {
  it('renders the title, description, and both action buttons', () => {
    const { getByText } = render(
      <AlertDialog
        open
        onClose={() => {}}
        title="Delete record?"
        description="This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Keep"
      />,
    );
    expect(getByText('Delete record?')).toBeTruthy();
    expect(getByText('This cannot be undone.')).toBeTruthy();
    expect(getByText('Delete')).toBeTruthy();
    expect(getByText('Keep')).toBeTruthy();
  });

  it('AlertDialog.confirm() returns a promise that resolves with a boolean', async () => {
    let p!: Promise<boolean>;
    await act(async () => {
      p = AlertDialog.confirm({ title: 'Sign out everywhere?', confirmLabel: 'Yes' });
    });
    expect(typeof p.then).toBe('function');
    // The confirm Modal portals into document.body — find the Yes button.
    const confirmBtn = Array.from(document.body.querySelectorAll('button')).find(
      (b) => b.textContent === 'Yes',
    );
    expect(confirmBtn).toBeTruthy();
    await act(async () => {
      fireEvent.click(confirmBtn!);
    });
    const result = await p;
    expect(result).toBe(true);
  });
});

// ── KanbanBoard / useKanban ─────────────────────────────────────
describe('KanbanBoard', () => {
  const columns = [
    { id: 'backlog', title: 'Backlog' },
    { id: 'doing', title: 'In progress' },
  ];

  it('renders columns and items', () => {
    const items = {
      backlog: [{ id: '1', title: 'Refund 1192' }],
      doing: [{ id: '2', title: 'Restock honey' }],
    };
    const { container, getByText } = render(
      <KanbanBoard columns={columns} items={items} />,
    );
    expect(container.querySelectorAll('.kanban-column').length).toBe(2);
    expect(getByText('Refund 1192')).toBeTruthy();
    expect(getByText('Restock honey')).toBeTruthy();
  });

  it('move() transfers an item between columns', () => {
    const { result } = renderHook(() =>
      useKanban({
        backlog: [{ id: '1', title: 'Refund 1192' }],
        doing: [],
      }),
    );
    act(() => {
      result.current.move('1', 'backlog', 'doing', 0);
    });
    expect(result.current.items.backlog).toHaveLength(0);
    expect(result.current.items.doing).toHaveLength(1);
    expect(result.current.items.doing[0]!.id).toBe('1');
  });

  it('useKanban().addCard inserts a new card', () => {
    const { result } = renderHook(() =>
      useKanban<{ id: string; title: string }>({ todo: [] }),
    );
    act(() => {
      result.current.addCard('todo', { id: 'a', title: 'Hello' });
    });
    expect(result.current.items.todo).toHaveLength(1);
  });
});

// ── CommentsThread / useComments ────────────────────────────────
describe('CommentsThread', () => {
  const me = { id: 'u1', name: 'Tatenda' };
  it('renders flat comments and the composer fires onAdd', () => {
    const onAdd = vi.fn();
    const comments = [
      { id: 'c1', parentId: null, author: me, body: 'Hello', createdAt: '1m' },
    ];
    const { container } = render(
      <CommentsThread
        comments={comments}
        currentUser={me}
        onAdd={onAdd}
      />,
    );
    expect(container.querySelectorAll('.comment').length).toBe(1);
    const textarea = container.querySelector('textarea')!;
    fireEvent.change(textarea, { target: { value: 'Hi' } });
    // Cmd+Enter to submit
    fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true });
    expect(onAdd).toHaveBeenCalledWith('Hi', null);
  });
});

describe('useComments', () => {
  it('add / edit / resolve round-trip', () => {
    const me = { id: 'u1', name: 'Tatenda' };
    const { result } = renderHook(() => useComments());
    let id = '';
    act(() => {
      const c = result.current.add('First!', me);
      id = c.id;
    });
    expect(result.current.comments).toHaveLength(1);
    expect(result.current.comments[0]!.body).toBe('First!');
    act(() => {
      result.current.edit(id, 'edited');
    });
    expect(result.current.comments[0]!.body).toBe('edited');
    act(() => {
      result.current.resolve(id);
    });
    expect(result.current.comments[0]!.resolved).toBe(true);
  });
});

// ── NotificationMatrix / usePreferences ─────────────────────────
describe('NotificationMatrix', () => {
  it('renders an aria-labelled checkbox for every event × channel cell', () => {
    const events = [{ id: 'mention', label: 'Mention' }];
    const channels = [
      { id: 'email', label: 'Email' },
      { id: 'push', label: 'Push' },
    ];
    const onChange = vi.fn();
    const { container } = render(
      <NotificationMatrix
        events={events}
        channels={channels}
        value={{ 'mention:email': true }}
        onChange={onChange}
      />,
    );
    const inputs = container.querySelectorAll('input[type="checkbox"]');
    expect(inputs.length).toBe(2);
    const emailCell = container.querySelector('input[aria-label="Mention via Email"]') as HTMLInputElement;
    expect(emailCell).toBeTruthy();
    expect(emailCell.checked).toBe(true);
    fireEvent.click(emailCell);
    expect(onChange).toHaveBeenCalledWith('mention', 'email', false);
  });
});

describe('usePreferences', () => {
  it('set / get round-trip works under the eventId:channelId key', () => {
    const { result } = renderHook(() => usePreferences());
    act(() => {
      result.current.set('mention', 'email', true);
    });
    expect(result.current.prefs['mention:email']).toBe(true);
    act(() => {
      result.current.pauseFor(4);
    });
    expect(result.current.pause).toBe(4);
  });
});

// ── DatePicker ──────────────────────────────────────────────────
describe('DatePicker', () => {
  it('shows the formatted value in the trigger', () => {
    const { container } = render(
      <DatePicker
        value={new Date(2026, 5, 7)}
        format={(d) => `D-${d.getDate()}`}
        placeholder="pick"
      />,
    );
    const input = container.querySelector('input.input.date-picker-trigger') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.value).toBe('D-7');
  });
});

// ── useDateRange ────────────────────────────────────────────────
describe('useDateRange', () => {
  it("preset('this-month') sets a from/to pair within this month", () => {
    const { result } = renderHook(() => useDateRange());
    act(() => {
      result.current.preset('this-month');
    });
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    expect(result.current.from!.startsWith(`${y}-${m}-`)).toBe(true);
    expect(result.current.to!.startsWith(`${y}-${m}-`)).toBe(true);
    expect(result.current.isPreset('this-month')).toBe(true);
  });

  it('setRange swaps from/to when from > to', () => {
    const { result } = renderHook(() => useDateRange());
    act(() => {
      result.current.setRange({ from: '2026-12-31', to: '2026-01-01' });
    });
    expect(result.current.from).toBe('2026-01-01');
    expect(result.current.to).toBe('2026-12-31');
  });
});
