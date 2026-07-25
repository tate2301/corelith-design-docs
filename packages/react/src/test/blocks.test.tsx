import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import {
  Activity,
  AppShell,
  Button,
  Card,
  DataTable,
  DataToolbar,
  EmptyState,
  KpiGrid,
  ModuleMatrix,
  PageHeader,
  QuickLinks,
  StatCard,
  StatusState,
} from '../index';

afterEach(() => cleanup());

describe('AppShell', () => {
  it('composes sidebar, topbar, page content, and footer slots', () => {
    const { container, getByText } = render(
      <AppShell sidebar="nav" topbar="top" footer="foot">
        content
      </AppShell>,
    );

    expect(container.querySelector('.app-shell')).toBeTruthy();
    expect(container.querySelector('.app-shell-side')!.textContent).toBe('nav');
    expect(container.querySelector('.app-shell-topbar')!.textContent).toBe('top');
    expect(container.querySelector('.app-shell-content')!.textContent).toContain('content');
    expect(getByText('foot')).toBeTruthy();
  });
});

describe('Card', () => {
  it('renders prop-driven header, body, actions, footer, and polymorphic root', () => {
    const { container, getByText } = render(
      <Card
        as="article"
        title="Revenue"
        subtitle="Today"
        actions={<Button variant="quiet">Export</Button>}
        footer="Synced"
      >
        Body
      </Card>,
    );

    expect(container.querySelector('article.card')).toBeTruthy();
    expect(container.querySelector('.card-head')).toBeTruthy();
    expect(container.querySelector('.card-actions')).toBeTruthy();
    expect(container.querySelector('.card-foot')!.textContent).toBe('Synced');
    expect(getByText('Revenue')).toBeTruthy();
  });
});

describe('DataToolbar', () => {
  it('renders search, filters, and action slots', () => {
    const { container } = render(
      <DataToolbar
        search={<input aria-label="Search" />}
        filters={<span>Active</span>}
        actions={<button type="button">Add</button>}
      />,
    );

    expect(container.querySelector('.search-input')).toBeTruthy();
    expect(container.querySelector('.data-toolbar-filters')!.textContent).toBe('Active');
    expect(container.querySelector('.data-toolbar-actions')!.textContent).toBe('Add');
  });
});

describe('PageHeader', () => {
  it('renders crumbs, lede, meta pills, and action slots', () => {
    const { container, getByText } = render(
      <PageHeader
        title="Settings"
        lede="Manage workspace defaults"
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Settings' }]}
        metaPills={[{ label: 'Live', tone: 'success' }]}
        secondaryActions={<Button variant="quiet">Cancel</Button>}
        primaryAction={<Button variant="primary">Save</Button>}
      />,
    );

    expect(container.querySelector('.dash-page-h')).toBeTruthy();
    expect(container.querySelector('.crumbs')).toBeTruthy();
    expect(container.querySelector('.h-pills')!.textContent).toContain('Live');
    expect(getByText('Manage workspace defaults')).toBeTruthy();
  });
});

describe('Status Blocks', () => {
  it('renders EmptyState and StatusState with appropriate roles', () => {
    const { container, rerender, getByText } = render(
      <EmptyState title="No invoices" body="Create one to get started." action={<Button>New</Button>} />,
    );
    expect(container.querySelector('.empty-state')).toBeTruthy();
    expect(getByText('Create one to get started.')).toBeTruthy();

    rerender(<StatusState variant="error" title="Upload failed" body="Try again." />);
    expect(container.firstChild).toHaveProperty('role');
    expect((container.firstChild as HTMLElement).getAttribute('role')).toBe('alert');
  });
});

describe('KPI and Launcher Blocks', () => {
  it('renders StatCard delta objects and KpiGrid items', () => {
    const { container, getByText } = render(
      <>
        <StatCard label="Score" value="98" delta={{ direction: 'up', label: '+2' }} tone="success" />
        <KpiGrid items={[{ label: 'Receipts', value: '147', delta: '+12%' }]} />
      </>,
    );

    expect(container.querySelector('.stat-tile')).toBeTruthy();
    expect(container.querySelector('.delta.up')).toBeTruthy();
    expect(container.querySelector('.kpi-grid')).toBeTruthy();
    expect(getByText('147')).toBeTruthy();
  });

  it('renders QuickLinks and ModuleMatrix from item data', () => {
    const { container, getByText } = render(
      <>
        <QuickLinks items={[{ title: 'New sale', meta: 'Retail', href: '/sale' }]} />
        <ModuleMatrix items={[{ name: 'Retail', metric: '$11.4k', status: 'attention' }]} />
      </>,
    );

    expect(container.querySelector('.quick-links')).toBeTruthy();
    expect(container.querySelector('.module-matrix')).toBeTruthy();
    expect(container.querySelector('.status-dot.attention')).toBeTruthy();
    expect(getByText('New sale')).toBeTruthy();
  });
});

describe('Activity', () => {
  it('accepts both items and compound Item children', () => {
    const { container, getByText, rerender } = render(
      <Activity title="Activity" items={[{ text: 'System synced', time: 'now' }]} />,
    );
    expect(container.querySelector('.activity-card')).toBeTruthy();
    expect(getByText('System synced')).toBeTruthy();

    rerender(
      <Activity>
        <Activity.Item text="Manual override" tone="brand" bordered={false} />
      </Activity>,
    );
    expect(getByText('Manual override')).toBeTruthy();
  });
});

describe('DataTable', () => {
  type Row = { id: string; name: string; amount: number };
  const rows: Row[] = [
    { id: '1', name: 'B', amount: 20 },
    { id: '2', name: 'A', amount: 10 },
  ];

  it('renders current data/rowKey/columns contract and sorts sortable columns', () => {
    const { container, getByText } = render(
      <DataTable
        data={rows}
        rowKey={(row) => row.id}
        sortable
        columns={[
          { key: 'name', header: 'Name', sortable: true },
          { key: 'amount', header: 'Amount', align: 'right' },
        ]}
      />,
    );

    expect(container.querySelectorAll('thead th').length).toBe(2);
    expect(container.querySelectorAll('tbody tr').length).toBe(2);
    fireEvent.click(getByText('Name'));
    expect(container.querySelector('tbody tr')!.textContent).toContain('A');
  });

  it('composes Checkbox and Pagination primitives', () => {
    const onSelectionChange = vi.fn();
    const onPageChange = vi.fn();
    const { container } = render(
      <DataTable
        data={rows}
        rowKey={(row) => row.id}
        columns={[{ key: 'name', header: 'Name' }]}
        selectable
        selectedKeys={[]}
        onSelectionChange={onSelectionChange}
        pagination={{ page: 1, pageSize: 1, onPageChange }}
      />,
    );

    const checkboxes = container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
    fireEvent.click(checkboxes[1]!);
    expect(onSelectionChange).toHaveBeenCalledWith(['1']);

    fireEvent.click(container.querySelector('button[aria-label="Next page"]')!);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
