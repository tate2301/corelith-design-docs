import { describe, it, expect, vi } from 'vitest';
import { createRef } from 'react';
import { render, fireEvent, cleanup, act } from '@testing-library/react';
import {
  Composer,
  Conversation,
  ConversationRenderer,
  ReactionBar,
  accentFor,
  type ComposerHandle,
  type ConversationMessageData,
} from '../index';

afterEach(() => cleanup());

// Extra fields on a message are normal — callers hang their own data here and
// read it back in `dayLabel`/`shouldGroup`. None of it may reach the DOM.
type ThreadMessage = ConversationMessageData & { dayLabel: string; channelId: string };

const MESSAGES: ThreadMessage[] = [
  { id: 'm1', author: 'Alicia Reed', time: '11:40', body: 'Pour came in at 93.8 %', dayLabel: 'Today', channelId: 'ops' },
  { id: 'm2', author: 'Alicia Reed', time: '11:41', body: 'Re-assaying now', dayLabel: 'Today', channelId: 'ops' },
  { id: 'm3', author: 'Tyler Robinson', time: '11:42', body: 'Thanks :tada:', dayLabel: 'Today', channelId: 'ops' },
];

describe('ConversationMessage', () => {
  it('renders the author, time and emoji body', () => {
    const { getByText, container } = render(
      <Conversation.Message id="m1" author="Alicia Reed" time="11:42" body="Shipped :tada:" />,
    );
    expect(getByText('Alicia Reed')).toBeTruthy();
    expect(getByText('11:42')).toBeTruthy();
    expect(container.querySelector('[data-slot="emoji"]')?.getAttribute('data-emoji')).toBe('🎉');
  });

  it('derives the avatar hue from the author name', () => {
    const { container } = render(<Conversation.Message id="m1" author="Alicia Reed" body="hi" />);
    const row = container.querySelector('[data-slot="conversation-message"]')!;
    expect(row.getAttribute('data-accent')).toBe(accentFor('Alicia Reed'));
  });

  it('hides the header when grouped, keeping the time in the gutter', () => {
    const { container, queryByText } = render(
      <Conversation.Message id="m2" author="Alicia Reed" time="11:41" body="follow-up" grouped />,
    );
    expect(queryByText('Alicia Reed')).toBeNull();
    expect(container.querySelector('.conv-msg-gutter-time')?.textContent).toBe('11:41');
    expect(container.querySelector('.conv-msg')!.className).toContain('conv-msg-grouped');
  });

  it('renders an emoji-only body large', () => {
    const { container } = render(<Conversation.Message id="m1" author="Ana" body="🎉" />);
    expect(container.querySelector('.emoji-jumbo')).not.toBeNull();
  });

  it('marks failed sends and shows the error', () => {
    const { container, getByText } = render(
      <Conversation.Message id="m1" author="Ana" body="nope" status="failed" error="Not delivered" />,
    );
    expect(container.querySelector('.conv-msg')!.className).toContain('conv-msg-failed');
    expect(getByText('Not delivered')).toBeTruthy();
  });

  it('tints attachments by file extension', () => {
    const { container } = render(
      <Conversation.Message
        id="m1"
        author="Ana"
        attachments={[
          { name: 'overview.csv', size: '1.4 MB' },
          { name: 'invoice.pdf', href: '/i.pdf' },
          { name: 'mystery.xyz' },
        ]}
      />,
    );
    const tiles = container.querySelectorAll('.conv-attachment');
    expect(tiles[0]!.getAttribute('data-accent')).toBe('green');
    expect(tiles[1]!.getAttribute('data-accent')).toBe('red');
    // Unknown extensions fall back rather than throwing.
    expect(tiles[2]!.getAttribute('data-accent')).toBe('gray');
    expect(tiles[1]!.tagName).toBe('A');
  });
});

describe('ReactionBar', () => {
  it('exposes pills as toggles with the count in the accessible name', () => {
    const onToggle = vi.fn();
    const { getByLabelText } = render(
      <ReactionBar
        reactions={[{ emoji: '👍', count: 3, reacted: true }]}
        onToggle={onToggle}
      />,
    );
    const pill = getByLabelText('👍 3 reactions');
    expect(pill.getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(pill);
    expect(onToggle).toHaveBeenCalledWith('👍');
  });

  it('adds a reaction through the picker', () => {
    const onAdd = vi.fn();
    const { getByLabelText, getByRole } = render(<ReactionBar onAdd={onAdd} />);
    fireEvent.click(getByLabelText('Add reaction'));
    fireEvent.change(getByRole('combobox'), { target: { value: 'fire' } });
    fireEvent.keyDown(getByRole('combobox'), { key: 'Enter' });
    expect(onAdd).toHaveBeenCalledWith('🔥');
  });

  it('renders nothing when empty and the add button is hidden', () => {
    const { container } = render(<ReactionBar hideAdd />);
    expect(container.firstChild).toBeNull();
  });
});

describe('ConversationRenderer', () => {
  it('groups consecutive messages from one author', () => {
    const { container } = render(<ConversationRenderer messages={MESSAGES} />);
    const rows = container.querySelectorAll('[data-slot="conversation-message"]');
    expect(rows).toHaveLength(3);
    expect(rows[0]!.className).not.toContain('conv-msg-grouped');
    expect(rows[1]!.className).toContain('conv-msg-grouped'); // same author
    expect(rows[2]!.className).not.toContain('conv-msg-grouped'); // author changed
  });

  it('keeps a caller\'s own message fields out of the DOM', () => {
    const { container } = render(
      <ConversationRenderer messages={MESSAGES} dayLabel={(m) => (m as ThreadMessage).dayLabel} />,
    );
    const row = container.querySelector('[data-slot="conversation-message"]')!;
    expect(row.hasAttribute('dayLabel')).toBe(false);
    expect(row.hasAttribute('daylabel')).toBe(false);
    expect(row.hasAttribute('channelId')).toBe(false);
    expect(row.hasAttribute('channelid')).toBe(false);
  });

  it('inserts a day divider and breaks the group across it', () => {
    const messages: ConversationMessageData[] = [
      { id: 'a', author: 'Ana', body: 'yesterday' },
      { id: 'b', author: 'Ana', body: 'today' },
    ];
    const { container } = render(
      <ConversationRenderer
        messages={messages}
        dayLabel={(m) => (m.id === 'a' ? 'Yesterday' : 'Today')}
      />,
    );
    const dividers = container.querySelectorAll('.conv-divider');
    expect(dividers).toHaveLength(2);
    const rows = container.querySelectorAll('[data-slot="conversation-message"]');
    // Same author, but a divider sits between them — a grouped row under a
    // "Today" rule would look orphaned.
    expect(rows[1]!.className).not.toContain('conv-msg-grouped');
  });

  it('renders an unread marker at the given index', () => {
    const { container, getByText } = render(
      <ConversationRenderer messages={MESSAGES} unreadAt={2} />,
    );
    expect(getByText('New messages')).toBeTruthy();
    expect(container.querySelector('.conv-divider-unread')).not.toBeNull();
  });

  it('shows the typing indicator and the empty state', () => {
    const { getByText, rerender } = render(
      <ConversationRenderer messages={MESSAGES} typing={['Ana', 'Leon']} />,
    );
    expect(getByText('Ana and Leon are typing')).toBeTruthy();

    rerender(<ConversationRenderer messages={[]} emptyState={<p>No messages yet</p>} />);
    expect(getByText('No messages yet')).toBeTruthy();
  });

  it('switches to the bubble variant', () => {
    const { container } = render(<ConversationRenderer messages={MESSAGES} variant="bubbles" />);
    expect(container.querySelector('.conversation')!.className).toContain('conversation-bubbles');
  });
});

describe('Composer', () => {
  it('sends on Enter and clears, newlines on Shift+Enter', () => {
    const onSend = vi.fn();
    const { getByLabelText } = render(<Composer onSend={onSend} label="Message" />);
    const editor = getByLabelText('Message') as HTMLTextAreaElement;

    fireEvent.change(editor, { target: { value: 'hello' } });
    fireEvent.keyDown(editor, { key: 'Enter', shiftKey: true });
    expect(onSend).not.toHaveBeenCalled();

    fireEvent.keyDown(editor, { key: 'Enter' });
    expect(onSend).toHaveBeenCalledWith('hello', []);
    expect(editor.value).toBe('');
  });

  it('requires the modifier when sendOn is "modifier"', () => {
    const onSend = vi.fn();
    const { getByLabelText } = render(<Composer onSend={onSend} sendOn="modifier" />);
    const editor = getByLabelText('Message');

    fireEvent.change(editor, { target: { value: 'draft' } });
    fireEvent.keyDown(editor, { key: 'Enter' });
    expect(onSend).not.toHaveBeenCalled();

    fireEvent.keyDown(editor, { key: 'Enter', metaKey: true });
    expect(onSend).toHaveBeenCalledWith('draft', []);
  });

  it('expands shortcodes on send', () => {
    const onSend = vi.fn();
    const { getByLabelText } = render(<Composer onSend={onSend} />);
    const editor = getByLabelText('Message');
    fireEvent.change(editor, { target: { value: 'ship it :rocket:' } });
    fireEvent.keyDown(editor, { key: 'Enter' });
    expect(onSend).toHaveBeenCalledWith('ship it 🚀', []);
  });

  it('keeps the text when onSend returns false', () => {
    const { getByLabelText } = render(<Composer onSend={() => false} />);
    const editor = getByLabelText('Message') as HTMLTextAreaElement;
    fireEvent.change(editor, { target: { value: 'will fail' } });
    fireEvent.keyDown(editor, { key: 'Enter' });
    expect(editor.value).toBe('will fail');
  });

  it('blocks send on empty and over-limit input', () => {
    const { getByLabelText, rerender } = render(<Composer maxLength={5} />);
    expect((getByLabelText('Send message') as HTMLButtonElement).disabled).toBe(true);

    const editor = getByLabelText('Message');
    fireEvent.change(editor, { target: { value: 'too long' } });
    expect((getByLabelText('Send message') as HTMLButtonElement).disabled).toBe(true);

    rerender(<Composer maxLength={50} />);
    fireEvent.change(getByLabelText('Message'), { target: { value: 'ok' } });
    expect((getByLabelText('Send message') as HTMLButtonElement).disabled).toBe(false);
  });

  it('sends when there are attachments but no text', () => {
    const onSend = vi.fn();
    const attachments = [{ id: 'f1', name: 'report.pdf' }];
    const { getByLabelText } = render(<Composer onSend={onSend} attachments={attachments} />);
    fireEvent.click(getByLabelText('Send message'));
    expect(onSend).toHaveBeenCalledWith('', attachments);
  });

  it('inserts an emoji at the caret through the imperative handle', () => {
    const ref = createRef<ComposerHandle>();
    const { getByLabelText } = render(<Composer ref={ref} defaultValue="hi there" />);
    const editor = getByLabelText('Message') as HTMLTextAreaElement;

    editor.setSelectionRange(2, 2);
    act(() => ref.current!.insert(' 🎉'));
    expect(editor.value).toBe('hi 🎉 there');

    act(() => ref.current!.clear());
    expect(editor.value).toBe('');
    expect(ref.current!.textarea).toBe(editor);
  });

  it('removes attachments and dismisses the reply context', () => {
    const onRemove = vi.fn();
    const onDismiss = vi.fn();
    const { getByLabelText } = render(
      <Composer
        attachments={[{ id: 'f1', name: 'report.pdf' }]}
        onAttachmentRemove={onRemove}
        context="Replying to Ana"
        onContextDismiss={onDismiss}
      />,
    );
    fireEvent.click(getByLabelText('Remove report.pdf'));
    expect(onRemove).toHaveBeenCalledWith('f1');

    fireEvent.click(getByLabelText('Dismiss reply context'));
    expect(onDismiss).toHaveBeenCalled();
  });

  it('inserts from the emoji picker', () => {
    const { getByLabelText, getByRole } = render(<Composer defaultValue="nice " />);
    fireEvent.click(getByLabelText('Insert emoji'));
    fireEvent.change(getByRole('combobox'), { target: { value: 'tada' } });
    fireEvent.keyDown(getByRole('combobox'), { key: 'Enter' });
    expect((getByLabelText('Message') as HTMLTextAreaElement).value).toContain('🎉');
  });
});
