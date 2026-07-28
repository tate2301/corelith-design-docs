import { describe, it, expect } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import {
  ACCENT_CYCLE,
  ACCENT_HUES,
  Avatar,
  Badge,
  CHART_SERIES,
  Chip,
  IconTile,
  Status,
  Tag,
  accentFor,
  accentVar,
  chartSeriesVar,
  resolveAccent,
} from '../index';

afterEach(() => cleanup());

describe('accent tokens', () => {
  it('resolves semantic aliases onto hues', () => {
    expect(resolveAccent('success')).toBe('green');
    expect(resolveAccent('danger')).toBe('red');
    expect(resolveAccent('brand')).toBe('blue');
    expect(resolveAccent('neutral')).toBe('gray');
    // A hue passes through untouched.
    expect(resolveAccent('violet')).toBe('violet');
  });

  it('builds CSS variable references for a hue and role', () => {
    expect(accentVar('violet')).toBe('var(--accent-violet-solid)');
    expect(accentVar('warn', 'bg')).toBe('var(--accent-amber-bg)');
    expect(chartSeriesVar(0)).toBe('var(--chart-1)');
    // Wraps rather than running off the end of the palette.
    expect(chartSeriesVar(10)).toBe('var(--chart-1)');
    expect(chartSeriesVar(-1)).toBe('var(--chart-10)');
    expect(CHART_SERIES).toHaveLength(10);
  });
});

describe('accentFor', () => {
  it('is deterministic and case/whitespace insensitive', () => {
    expect(accentFor('Alicia Reed')).toBe(accentFor('Alicia Reed'));
    expect(accentFor('Alicia Reed')).toBe(accentFor('  alicia reed '));
  });

  it('only ever returns a real hue, and never gray from the cycle', () => {
    const hue = accentFor('Modal');
    expect(ACCENT_HUES).toContain(hue);
    expect(ACCENT_CYCLE).toContain(hue);
    expect(ACCENT_CYCLE).not.toContain('gray');
  });

  it('falls back to gray for an empty seed', () => {
    expect(accentFor('')).toBe('gray');
    expect(accentFor(undefined)).toBe('gray');
    expect(accentFor(null)).toBe('gray');
  });

  it('spreads similar names across different hues', () => {
    // The failure mode worth guarding: six people in one list all landing on
    // the same colour because the hash clusters short similar strings.
    const names = [
      'Nicolas Sharp',
      'Nicole Gold',
      'Nikki Meyers',
      'Alex Christie',
      'Julian Herbst',
      'Ana Gantt',
      'Lena Cremers',
      'Leon Heinrichs',
    ];
    const hues = new Set(names.map((n) => accentFor(n)));
    expect(hues.size).toBeGreaterThanOrEqual(5);
  });
});

describe('accent props', () => {
  it('Badge swaps the tone class for the accent channel', () => {
    const { getByText } = render(
      <Badge accent="violet" dot>
        Publishing
      </Badge>,
    );
    const badge = getByText('Publishing');
    expect(badge.className).toContain('badge-accent');
    expect(badge.className).toContain('badge-dot');
    // The tone class must not survive alongside it, or it wins the cascade.
    expect(badge.className).not.toContain('badge-neutral');
    expect(badge.getAttribute('data-accent')).toBe('violet');
  });

  it('Badge keeps the tone vocabulary when no accent is given', () => {
    const { getByText } = render(<Badge tone="success">Completed</Badge>);
    const badge = getByText('Completed');
    expect(badge.className).toContain('badge-success');
    expect(badge.getAttribute('data-accent')).toBeNull();
  });

  it('Avatar derives a stable hue from the name and can be overridden', () => {
    const { getByLabelText, rerender } = render(<Avatar name="Alicia Reed" />);
    const avatar = getByLabelText('Alicia Reed');
    expect(avatar.className).toContain('avatar-accent');
    expect(avatar.getAttribute('data-accent')).toBe(accentFor('Alicia Reed'));

    rerender(<Avatar name="Alicia Reed" accent="teal" solid />);
    const pinned = getByLabelText('Alicia Reed');
    expect(pinned.getAttribute('data-accent')).toBe('teal');
    expect(pinned.className).toContain('avatar-accent-solid');
  });

  it('Avatar leaves the clay/ink tones alone', () => {
    const { getByLabelText } = render(<Avatar name="Modal" tone="ink" />);
    const avatar = getByLabelText('Modal');
    expect(avatar.className).toContain('ink');
    // `ink` paints both fill and foreground; an accent on top would fight it.
    expect(avatar.className).not.toContain('avatar-accent');
    expect(avatar.getAttribute('data-accent')).toBeNull();
  });

  it('Tag hashes its own text when accent is "auto"', () => {
    const { getByText } = render(<Tag accent="auto">Engineering</Tag>);
    const tag = getByText('Engineering');
    expect(tag.className).toContain('tag-accent');
    expect(tag.getAttribute('data-accent')).toBe(accentFor('Engineering'));
  });

  it('Chip drops the inline selected style when an accent is set', () => {
    const { getByRole, rerender } = render(<Chip selected>Filter</Chip>);
    // Without an accent the brand-tinted inline style still applies.
    expect(getByRole('button').getAttribute('style')).toContain('brand-soft');

    rerender(
      <Chip selected accent="pink">
        Filter
      </Chip>,
    );
    const chip = getByRole('button');
    expect(chip.className).toContain('chip-accent');
    expect(chip.getAttribute('data-accent')).toBe('pink');
    // The inline brand style would have out-specified the accent class.
    expect(chip.getAttribute('style') ?? '').not.toContain('brand-soft');
  });

  it('Status swaps the tone class for the accent channel', () => {
    const { getByText } = render(<Status accent="indigo">Negotiation</Status>);
    const status = getByText('Negotiation');
    expect(status.className).toContain('status-accent');
    expect(status.className).not.toContain('idle');
    expect(status.getAttribute('data-accent')).toBe('indigo');
  });

  it('IconTile is decorative unless labelled, and hashes an optional seed', () => {
    const { container, rerender } = render(<IconTile accentSeed="Invoices" size="lg">IN</IconTile>);
    const tile = container.querySelector('[data-slot="icon-tile"]')!;
    expect(tile.className).toContain('icon-tile-lg');
    expect(tile.getAttribute('data-accent')).toBe(accentFor('Invoices'));
    expect(tile.getAttribute('aria-hidden')).toBe('true');

    rerender(
      <IconTile accent="teal" role="img" aria-label="Revenue">
        R
      </IconTile>,
    );
    const labelled = container.querySelector('[data-slot="icon-tile"]')!;
    expect(labelled.getAttribute('aria-hidden')).toBeNull();
    expect(labelled.getAttribute('data-accent')).toBe('teal');
  });
});
