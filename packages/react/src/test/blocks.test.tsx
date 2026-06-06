import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import {
  AppShell,
  AuthShell,
  BottomTabs,
  DataTable,
  DayList,
  EmptyState,
  FilterChips,
  Grabber,
  PageHeader,
  Pagination,
  RoleSwitcher,
  RowCard,
  SaveBar,
  StatCard,
  StatHero,
  Stepper,
  Tabs,
} from '../index';

afterEach(() => cleanup());

describe('AuthShell', () => {
  it('composes Brand + Card', () => {
    const { container, getByText } = render(
      <AuthShell>
        <AuthShell.Brand product="Huchu" />
        <AuthShell.Card title="Sign in">body</AuthShell.Card>
      </AuthShell>,
    );
    expect(container.querySelector('.auth-shell')).toBeTruthy();
    expect(getByText('Sign in')).toBeTruthy();
  });
});

describe('AppShell', () => {
  it('renders sidebar/main/top bar', () => {
    const { container } = render(
      <AppShell>
        <AppShell.Sidebar>nav</AppShell.Sidebar>
        <AppShell.Main>
          <AppShell.TopBar>top</AppShell.TopBar>
          content
        </AppShell.Main>
      </AppShell>,
    );
    expect(container.querySelector('.app-shell')).toBeTruthy();
    expect(container.querySelector('.sidebar')).toBeTruthy();
    expect(container.querySelector('.app-content')).toBeTruthy();
  });
});

describe('BottomTabs', () => {
  it('marks current value active and fires onChange', () => {
    const onChange = vi.fn();
    const { container } = render(
      <BottomTabs
        value="b"
        onChange={onChange}
        items={[
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
        ]}
      />,
    );
    const btns = container.querySelectorAll('button');
    expect(btns[1]!.className).toContain('active');
    fireEvent.click(btns[0]!);
    expect(onChange).toHaveBeenCalledWith('a');
  });
});

describe('StatHero', () => {
  it('renders lead value + secondaries', () => {
    const { container, getByText } = render(
      <StatHero
        label="Revenue"
        value="$10k"
        secondaries={[{ label: 'Orders', value: '120' }]}
      />,
    );
    expect(container.querySelector('.b-stat-hero')).toBeTruthy();
    expect(getByText('$10k')).toBeTruthy();
    expect(getByText('120')).toBeTruthy();
  });
});

describe('StatCard', () => {
  it('renders label/value/delta', () => {
    const { container } = render(<StatCard label="Score" value="98" delta="+2" deltaTone="up" />);
    expect(container.querySelector('.stat-tile')).toBeTruthy();
    expect(container.querySelector('.delta.up')).toBeTruthy();
  });
});

describe('DayList', () => {
  it('renders rows', () => {
    const { container } = render(
      <DayList
        rows={[
          { label: 'Mon', value: '1' },
          { label: 'Tue', value: '2', tone: 'up' },
        ]}
      />,
    );
    expect(container.querySelectorAll('.b-dl-l').length).toBe(2);
    expect(container.querySelector('.b-dl-v.up')).toBeTruthy();
  });
});

describe('PageHeader', () => {
  it('renders title and back button', () => {
    const onBack = vi.fn();
    const { getByText, getByLabelText } = render(
      <PageHeader title="Settings" onBack={onBack} />,
    );
    expect(getByText('Settings')).toBeTruthy();
    fireEvent.click(getByLabelText('Back'));
    expect(onBack).toHaveBeenCalled();
  });
});

describe('RowCard', () => {
  it('renders as button when onClick provided', () => {
    const onClick = vi.fn();
    const { getByRole } = render(<RowCard title="Hello" onClick={onClick} />);
    fireEvent.click(getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });
});

describe('FilterChips', () => {
  it('marks selected option and fires onChange', () => {
    const onChange = vi.fn();
    const { container } = render(
      <FilterChips
        value="b"
        onChange={onChange}
        options={[
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
        ]}
      />,
    );
    const chips = container.querySelectorAll('button');
    expect(chips[1]!.getAttribute('aria-checked')).toBe('true');
    fireEvent.click(chips[0]!);
    expect(onChange).toHaveBeenCalledWith('a');
  });
});

describe('Tabs', () => {
  it('switches panel on tab click', () => {
    function Wrap() {
      const [v, setV] = (window as unknown as { React: typeof import('react') }).React.useState('a');
      return (
        <Tabs value={v} onValueChange={setV}>
          <Tabs.List>
            <Tabs.Tab value="a">A</Tabs.Tab>
            <Tabs.Tab value="b">B</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="a">Panel A</Tabs.Panel>
          <Tabs.Panel value="b">Panel B</Tabs.Panel>
        </Tabs>
      );
    }
    // Stash react on window for the inline hook above.
    // (Easier than importing { useState } at the top of this test file.)
    (window as unknown as { React: typeof import('react') }).React = require('react');
    const { getByText, queryByText } = render(<Wrap />);
    expect(getByText('Panel A')).toBeTruthy();
    fireEvent.click(getByText('B'));
    expect(queryByText('Panel A')).toBeNull();
    expect(getByText('Panel B')).toBeTruthy();
  });
});

describe('Stepper', () => {
  it('renders total steps with current state', () => {
    const { container } = render(<Stepper total={4} current={2} />);
    const steps = container.querySelectorAll('.p-step');
    expect(steps.length).toBe(4);
    expect(steps[0]!.className).toContain('done');
    expect(steps[1]!.className).toContain('current');
    expect(steps[2]!.className).toContain('pending');
  });
});

describe('RoleSwitcher', () => {
  it('marks pressed and emits change', () => {
    const onChange = vi.fn();
    const { container } = render(
      <RoleSwitcher
        value="a"
        onChange={onChange}
        options={[
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
        ]}
      />,
    );
    const btns = container.querySelectorAll('button');
    expect(btns[0]!.getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(btns[1]!);
    expect(onChange).toHaveBeenCalledWith('b');
  });
});

describe('Pagination', () => {
  it('disables prev on page 1', () => {
    const onChange = vi.fn();
    const { container } = render(
      <Pagination page={1} pageCount={5} onChange={onChange} />,
    );
    const prev = container.querySelector('button[aria-label="Previous page"]') as HTMLButtonElement;
    expect(prev.disabled).toBe(true);
  });
  it('emits next page', () => {
    const onChange = vi.fn();
    const { container } = render(
      <Pagination page={2} pageCount={5} onChange={onChange} />,
    );
    fireEvent.click(container.querySelector('button[aria-label="Next page"]')!);
    expect(onChange).toHaveBeenCalledWith(3);
  });
});

describe('SaveBar', () => {
  it('adds dirty class when dirty', () => {
    const { container, rerender } = render(<SaveBar dirty={false} onSave={() => {}} />);
    expect(container.querySelector('.p-save-bar')!.className).not.toContain('dirty');
    rerender(<SaveBar dirty onSave={() => {}} />);
    expect(container.querySelector('.p-save-bar')!.className).toContain('dirty');
  });
});

describe('Grabber', () => {
  it('renders aria-label', () => {
    const { getByLabelText } = render(<Grabber />);
    expect(getByLabelText('Drag to reorder')).toBeTruthy();
  });
});

describe('EmptyState', () => {
  it('renders inline variant with .p-empty-inline', () => {
    const { container } = render(
      <EmptyState variant="inline" title="No results" description="Try another query" />,
    );
    expect(container.querySelector('.p-empty-inline')).toBeTruthy();
  });
  it('renders full variant by default', () => {
    const { container } = render(<EmptyState title="Nothing" />);
    expect(container.querySelector('.empty-state')).toBeTruthy();
  });
});

describe('DataTable', () => {
  it('renders headers and rows', () => {
    const { container } = render(
      <DataTable
        getRowId={(r) => r.id}
        rows={[{ id: '1', name: 'A' }, { id: '2', name: 'B' }]}
        columns={[
          { id: 'id', header: 'ID' },
          { id: 'name', header: 'Name' },
        ]}
      />,
    );
    expect(container.querySelectorAll('thead th').length).toBe(2);
    expect(container.querySelectorAll('tbody tr').length).toBe(2);
  });
  it('toggles selection', () => {
    const onSelectionChange = vi.fn();
    const { container } = render(
      <DataTable
        getRowId={(r) => r.id}
        rows={[{ id: '1', name: 'A' }]}
        columns={[{ id: 'name', header: 'Name' }]}
        selectable
        selected={[]}
        onSelectionChange={onSelectionChange}
      />,
    );
    const checkboxes = container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
    fireEvent.click(checkboxes[1]!); // first row
    expect(onSelectionChange).toHaveBeenCalledWith(['1']);
  });
});
