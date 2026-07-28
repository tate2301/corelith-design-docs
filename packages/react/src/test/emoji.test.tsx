import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import {
  EMOJI,
  EMOJI_CATEGORIES,
  Emoji,
  EmojiPicker,
  EmojiProvider,
  EmojiSelect,
  EmojiText,
  SKIN_TONES,
  applySkinTone,
  countEmoji,
  emojiByShortcode,
  emojiFromChar,
  emojiUnified,
  isEmojiOnly,
  replaceShortcodes,
  searchEmoji,
  stripSkinTone,
  tokenizeEmojiText,
} from '../index';

afterEach(() => cleanup());

describe('emoji dataset', () => {
  it('parses every category with unique glyphs', () => {
    expect(EMOJI.length).toBeGreaterThan(900);
    const chars = new Set(EMOJI.map((e) => e.char));
    // A glyph listed in two categories (🙈 is a smiley and an animal) must
    // survive only once, or the picker shows a duplicate.
    expect(chars.size).toBe(EMOJI.length);

    for (const category of EMOJI_CATEGORIES) {
      if (category.id === 'recent') continue;
      expect(EMOJI.some((e) => e.category === category.id)).toBe(true);
    }
  });

  it('resolves shortcodes and the aliases people actually type', () => {
    expect(emojiByShortcode('thumbs_up')?.char).toBe('👍');
    expect(emojiByShortcode(':tada:')?.char).toBe('🎉');
    expect(emojiByShortcode('+1')?.char).toBe('👍');
    expect(emojiByShortcode('white_check_mark')?.char).toBe('✅');
    expect(emojiByShortcode('100')?.char).toBe('💯');
    expect(emojiByShortcode('not_a_real_code')).toBeUndefined();
  });

  it('looks up entries by glyph, tone modifiers included', () => {
    expect(emojiFromChar('🎉')?.shortcode).toBe('party_popper');
    expect(emojiFromChar('👋🏽')?.shortcode).toBe('waving_hand');
  });
});

describe('skin tone', () => {
  it('inserts the modifier after the first codepoint', () => {
    expect(applySkinTone('👋', 'medium')).toBe('👋\u{1F3FD}');
    // ZWJ sequence: the modifier belongs to the person, not the laptop.
    expect(applySkinTone('🧑‍💻', 'dark')).toBe('🧑\u{1F3FF}‍💻');
  });

  it('leaves tone-incapable glyphs alone', () => {
    expect(applySkinTone('🎉', 'dark')).toBe('🎉');
    expect(applySkinTone('👋', 'default')).toBe('👋');
  });

  it('strips modifiers back off', () => {
    expect(stripSkinTone('👋\u{1F3FD}')).toBe('👋');
    expect(SKIN_TONES).toHaveLength(6);
  });
});

describe('search', () => {
  it('ranks exact shortcodes above substring matches', () => {
    expect(searchEmoji('tada')[0]?.char).toBe('🎉');
    expect(searchEmoji('fire')[0]?.char).toBe('🔥');
    expect(searchEmoji('rocket')[0]?.char).toBe('🚀');
  });

  it('matches on keywords, not just names', () => {
    const results = searchEmoji('lgtm');
    expect(results[0]?.char).toBe('👍');
  });

  it('returns the glyph itself when the query is an emoji', () => {
    expect(searchEmoji('🎉')).toHaveLength(1);
    expect(searchEmoji('🎉')[0]?.char).toBe('🎉');
  });

  it('returns the unfiltered pool for an empty query', () => {
    expect(searchEmoji('  ', { limit: 5 })).toHaveLength(5);
    expect(searchEmoji('', { category: 'flags', limit: 3 }).every((e) => e.category === 'flags')).toBe(true);
  });

  it('returns nothing for gibberish', () => {
    expect(searchEmoji('zzzzqqqq')).toHaveLength(0);
  });
});

describe('tokenizer', () => {
  it('splits text, unicode emoji and shortcodes', () => {
    const tokens = tokenizeEmojiText('Shipped it :tada: nice 👏');
    expect(tokens.map((t) => t.type)).toEqual(['text', 'emoji', 'text', 'emoji']);
    expect(tokens[1]).toMatchObject({ value: '🎉', shortcode: 'tada' });
    expect(tokens[3]).toMatchObject({ value: '👏' });
  });

  it('leaves unrecognised colon-words as plain text', () => {
    // Colons are common in prose; eating "note:" would be worse than not
    // expanding a typo'd shortcode.
    const tokens = tokenizeEmojiText('note: see below :nope: done');
    expect(tokens).toHaveLength(1);
    expect(tokens[0]).toMatchObject({ type: 'text', value: 'note: see below :nope: done' });
  });

  it('keeps multi-codepoint clusters whole', () => {
    // ZWJ sequence, flag pair and keycap must each count as one emoji, not
    // as their component codepoints.
    expect(countEmoji('🧑‍💻')).toBe(1);
    expect(countEmoji('🇿🇼')).toBe(1);
    expect(countEmoji('#️⃣')).toBe(1);
    expect(countEmoji('🏳️‍🌈 and 👋🏽')).toBe(2);
  });

  it('detects emoji-only text', () => {
    expect(isEmojiOnly('🎉')).toBe(true);
    expect(isEmojiOnly('🎉 👏 🔥')).toBe(true);
    expect(isEmojiOnly(':tada:')).toBe(true);
    expect(isEmojiOnly('nice 🎉')).toBe(false);
    expect(isEmojiOnly('')).toBe(false);
    expect(isEmojiOnly('   ')).toBe(false);
  });

  it('expands shortcodes in place', () => {
    expect(replaceShortcodes('ship it :rocket:')).toBe('ship it 🚀');
    expect(replaceShortcodes(':wave:', 'dark')).toBe(applySkinTone('👋', 'dark'));
  });
});

describe('Emoji', () => {
  it('renders Apple artwork by default, addressed by codepoint', () => {
    const { container } = render(<Emoji emoji="👍" />);
    const img = container.querySelector('img')!;
    expect(img.getAttribute('src')).toContain('1f44d.png');
    // The label lives on the wrapper so it reads the same in both paths.
    expect(img.getAttribute('alt')).toBe('');
    const wrapper = container.querySelector('[data-slot="emoji"]')!;
    expect(wrapper.getAttribute('role')).toBe('img');
    expect(wrapper.getAttribute('aria-label')).toBe('thumbs up');
  });

  it('derives filenames for ZWJ sequences, flags, keycaps and tones', () => {
    expect(emojiUnified('🧑‍💻')).toBe('1f9d1-200d-1f4bb');
    expect(emojiUnified('🇺🇸')).toBe('1f1fa-1f1f8');
    expect(emojiUnified('❤️')).toBe('2764-fe0f');
    expect(emojiUnified('#️⃣')).toBe('0023-fe0f-20e3');
    expect(emojiUnified('👋🏽')).toBe('1f44b-1f3fd');
  });

  it('honours the provider set and asset host', () => {
    const { container } = render(
      <EmojiProvider assetBase="/emoji">
        <Emoji emoji="🎉" />
      </EmojiProvider>,
    );
    expect(container.querySelector('img')!.getAttribute('src')).toBe('/emoji/1f389.png');
  });

  it('falls back to the native glyph in native mode', () => {
    const { container } = render(
      <EmojiProvider set="native">
        <Emoji emoji="🎉" />
      </EmojiProvider>,
    );
    expect(container.querySelector('img')).toBeNull();
    expect(container.textContent).toBe('🎉');
  });

  it('falls back to the native glyph when the image fails to load', () => {
    const { container } = render(<Emoji emoji="🎉" />);
    fireEvent.error(container.querySelector('img')!);
    expect(container.querySelector('img')).toBeNull();
    expect(container.textContent).toBe('🎉');
  });

  it('accepts a shortcode and hides itself when decorative', () => {
    const { container } = render(<Emoji shortcode="rocket" label="" />);
    const wrapper = container.querySelector('[data-slot="emoji"]')!;
    expect(wrapper.getAttribute('data-emoji')).toBe('🚀');
    expect(wrapper.getAttribute('aria-hidden')).toBe('true');
    expect(wrapper.getAttribute('role')).toBeNull();
  });
});

describe('EmojiText', () => {
  it('keeps text runs as text and turns emoji into elements', () => {
    const { container } = render(<EmojiText>Shipped it :tada: 👏</EmojiText>);
    expect(container.textContent).toContain('Shipped it ');
    expect(container.querySelectorAll('[data-slot="emoji"]')).toHaveLength(2);
  });

  it('renders jumbo for a short emoji-only message', () => {
    const { container } = render(<EmojiText>🎉</EmojiText>);
    expect(container.querySelector('.emoji-jumbo')).not.toBeNull();
  });

  it('stays inline for emoji mixed with words, or past the jumbo limit', () => {
    const { container, rerender } = render(<EmojiText>nice 🎉</EmojiText>);
    expect(container.querySelector('.emoji-jumbo')).toBeNull();

    rerender(<EmojiText jumboLimit={2}>🎉 👏 🔥</EmojiText>);
    expect(container.querySelector('.emoji-jumbo')).toBeNull();
  });
});

describe('EmojiPicker', () => {
  it('filters as you search and reports the active option', () => {
    const { getByRole, container } = render(<EmojiPicker autoFocus={false} />);
    const search = getByRole('combobox');
    fireEvent.change(search, { target: { value: 'rocket' } });

    const options = container.querySelectorAll('[role="option"]');
    expect(options).toHaveLength(1);
    expect(options[0]!.getAttribute('title')).toBe('rocket');
    expect(search.getAttribute('aria-activedescendant')).toBe('emoji-opt-rocket');
  });

  it('selects with the keyboard without leaving the search field', () => {
    const onSelect = vi.fn();
    const { getByRole } = render(<EmojiPicker autoFocus={false} onSelect={onSelect} />);
    const search = getByRole('combobox');

    fireEvent.change(search, { target: { value: 'fire' } });
    fireEvent.keyDown(search, { key: 'Enter' });

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0]![0]).toBe('🔥');
  });

  it('steps by one column per left/right and by a row per up/down', () => {
    const onSelect = vi.fn();
    const { getByRole } = render(
      <EmojiPicker autoFocus={false} columns={8} onSelect={onSelect} emoji={EMOJI.slice(0, 24)} />,
    );
    const search = getByRole('combobox');

    fireEvent.keyDown(search, { key: 'ArrowRight' });
    fireEvent.keyDown(search, { key: 'ArrowDown' });
    fireEvent.keyDown(search, { key: 'Enter' });

    // index 0 → +1 → +8 = 9
    expect(onSelect.mock.calls[0]![0]).toBe(EMOJI[9]!.char);
  });

  it('applies the active skin tone to tone-capable glyphs only', () => {
    const onSelect = vi.fn();
    const { getByRole } = render(
      <EmojiPicker autoFocus={false} defaultTone="dark" onSelect={onSelect} />,
    );
    const search = getByRole('combobox');

    fireEvent.change(search, { target: { value: 'wave' } });
    fireEvent.keyDown(search, { key: 'Enter' });
    expect(onSelect.mock.calls[0]![0]).toBe(applySkinTone('👋', 'dark'));

    fireEvent.change(search, { target: { value: 'tada' } });
    fireEvent.keyDown(search, { key: 'Enter' });
    expect(onSelect.mock.calls[1]![0]).toBe('🎉');
  });

  it('leaves Space typable in the search field', () => {
    const onSelect = vi.fn();
    const { getByRole } = render(<EmojiPicker autoFocus onSelect={onSelect} />);
    const search = getByRole('combobox');
    search.focus();
    fireEvent.keyDown(search, { key: ' ' });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('shows an empty state for a query with no matches', () => {
    const { getByRole, container } = render(<EmojiPicker autoFocus={false} />);
    fireEvent.change(getByRole('combobox'), { target: { value: 'zzzzqqqq' } });
    expect(container.querySelector('.emoji-picker-empty')?.textContent).toContain('zzzzqqqq');
  });

  it('leads with a recents group when given one', () => {
    const { container } = render(<EmojiPicker autoFocus={false} recent={['🎉', '👍']} />);
    const firstLabel = container.querySelector('.emoji-picker-group-label')!;
    expect(firstLabel.textContent).toBe('Frequently used');
  });
});

describe('EmojiSelect', () => {
  it('opens the picker and commits the chosen glyph', () => {
    const onChange = vi.fn();
    const { getByLabelText, getByRole } = render(<EmojiSelect onChange={onChange} />);

    fireEvent.click(getByLabelText('Pick an emoji'));
    fireEvent.change(getByRole('combobox'), { target: { value: 'rocket' } });
    fireEvent.keyDown(getByRole('combobox'), { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith('🚀');
  });

  it('offers a clear action once a value is set', () => {
    const onChange = vi.fn();
    const { getByLabelText, getByText } = render(
      <EmojiSelect value="📊" onChange={onChange} />,
    );

    fireEvent.click(getByLabelText('Pick an emoji — currently 📊'));
    fireEvent.click(getByText('Remove emoji'));
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
