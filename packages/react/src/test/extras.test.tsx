import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, fireEvent, cleanup } from '@testing-library/react';
import {
  Calendar,
  DatePicker,
  FormShell,
  Input,
  ListPageShell,
  MasterDataShell,
  MobileActionBar,
  MobileList,
  PageSection,
  Progress,
  ScrollContainer,
  SegmentedControl,
  SettingsShell,
  useMediaQuery,
} from '../index';

afterEach(() => cleanup());

describe('Foundation exports', () => {
  it('ships styles, token, and component CSS entrypoints', () => {
    const pkg = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8'));

    expect(pkg.name).toBe('@corelithzw/react');
    expect(pkg.exports['./styles.css']).toBe('./dist/styles.css');
    expect(pkg.exports['./tokens.css']).toBe('./dist/tokens.css');
    expect(pkg.exports['./components.css']).toBe('./dist/components.css');
  });

  it('exposes shadcn-compatible token aliases', () => {
    const tokens = readFileSync(resolve(process.cwd(), 'src/styles/tokens.css'), 'utf8');

    for (const name of [
      '--background',
      '--foreground',
      '--card',
      '--card-foreground',
      '--popover',
      '--popover-foreground',
      '--primary',
      '--primary-foreground',
      '--secondary',
      '--muted',
      '--accent',
      '--destructive',
      '--input',
      '--ring',
      '--radius',
    ]) {
      expect(tokens).toContain(name);
    }
  });
});

describe('Calendar and DatePicker', () => {
  it('uses onValueChange and ARIA grid cells for date selection', () => {
    const onValueChange = vi.fn();
    const month = new Date(2026, 5, 1);
    const { getAllByRole } = render(<Calendar month={month} onValueChange={onValueChange} />);

    const fifteenth = getAllByRole('gridcell').find((cell) => cell.textContent === '15');
    expect(fifteenth).toBeTruthy();
    fireEvent.click(fifteenth!);
    expect(onValueChange).toHaveBeenCalled();
  });

  it('composes DatePicker from Button, Popover, and Calendar', () => {
    const onValueChange = vi.fn();
    const { getByRole } = render(<DatePicker value={new Date(2026, 5, 15)} onValueChange={onValueChange} />);

    fireEvent.click(getByRole('textbox'));
    expect(document.body.querySelector('[role="dialog"]')).toBeTruthy();
    const day = Array.from(document.body.querySelectorAll<HTMLButtonElement>('[role="gridcell"]')).find(
      (cell) => cell.textContent === '16',
    );
    fireEvent.click(day!);
    expect(onValueChange).toHaveBeenCalled();
  });
});

describe('Progress and SegmentedControl', () => {
  it('renders determinate and indeterminate progress state hooks', () => {
    const { container, rerender } = render(<Progress value={50} label="Upload" />);
    const el = container.querySelector('.progress')!;
    expect(el.getAttribute('role')).toBe('progressbar');
    expect(el.getAttribute('aria-valuenow')).toBe('50');
    expect(el.getAttribute('data-state')).toBe('determinate');
    expect((el.firstChild as HTMLElement).style.width).toBe('50%');

    rerender(<Progress value={null} label="Upload" />);
    expect(container.querySelector('.progress')!.getAttribute('data-state')).toBe('indeterminate');
  });

  it('emits onValueChange from the current segmented control contract', () => {
    const onValueChange = vi.fn();
    const { getByRole } = render(
      <SegmentedControl
        value="list"
        onValueChange={onValueChange}
        options={[
          { value: 'list', label: 'List' },
          { value: 'grid', label: 'Grid' },
        ]}
      />,
    );

    expect(getByRole('radio', { name: 'List' }).getAttribute('aria-checked')).toBe('true');
    fireEvent.click(getByRole('radio', { name: 'Grid' }));
    expect(onValueChange).toHaveBeenCalledWith('grid');
  });
});

describe('Mobile and Layout primitives', () => {
  it('renders MobileList and MobileActionBar item APIs', () => {
    const action = vi.fn();
    const { container, getByText } = render(
      <>
        <MobileList>
          <MobileList.Row title="Mukamba Group" subtitle="Supplier" trailing="$48k" />
        </MobileList>
        <MobileActionBar fixed={false}>
          <button type="button" onClick={action}>
            Save
          </button>
        </MobileActionBar>
      </>,
    );

    expect(container.querySelector('.mobile-list')).toBeTruthy();
    expect(container.querySelector('.action-bar')).toBeTruthy();
    fireEvent.click(getByText('Save'));
    expect(action).toHaveBeenCalled();
  });

  it('renders PageSection and ScrollContainer structural classes', () => {
    const { container, getByText } = render(
      <ScrollContainer>
        <PageSection title="Overview" description="Today">
          Body
        </PageSection>
      </ScrollContainer>,
    );

    expect(container.querySelector('.scroll-area')).toBeTruthy();
    expect(container.querySelector('.page-section')).toBeTruthy();
    expect(getByText('Overview')).toBeTruthy();
  });
});

describe('Shells', () => {
  it('renders list, form, settings, and master-data shells with current slots', () => {
    const { container, getByText } = render(
      <>
        <ListPageShell header="Suppliers" toolbar={<Input placeholder="Search" />}>
          rows
        </ListPageShell>
        <FormShell header="Edit supplier" footer={<button type="button">Save</button>} className="dirty">
          <FormShell.Section title="Identity">fields</FormShell.Section>
        </FormShell>
        <SettingsShell
          title="Settings"
          sections={[{ label: 'General', items: [{ id: 'profile', label: 'Profile' }] }]}
        >
          profile panel
        </SettingsShell>
        <MasterDataShell list="list" detail="detail" />
      </>,
    );

    expect(getByText('Suppliers')).toBeTruthy();
    expect(container.querySelector('.form-shell.dirty')).toBeTruthy();
    expect(container.querySelector('.settings-shell')).toBeTruthy();
    expect(container.querySelector('.master-data-shell')).toBeTruthy();
  });
});

describe('useMediaQuery', () => {
  it('returns a boolean in jsdom', () => {
    function Probe() {
      const matches = useMediaQuery('(min-width: 0px)');
      return <span>{String(matches)}</span>;
    }

    const { container } = render(<Probe />);
    expect(['true', 'false']).toContain(container.textContent);
  });
});
