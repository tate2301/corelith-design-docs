import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import {
  CellPill,
  DataTable,
  RecordChip,
  RecordChipGroup,
  SelectionBar,
  Table,
  accentFor,
  type DataTableColumn,
} from '../index';

afterEach(() => cleanup());

type Contact = { id: string; name: string; added: string; email: string };

const CONTACTS: Contact[] = [
  { id: 'c1', name: 'Nicolas Sharp', added: '1hr ago', email: 'nick@attio.com' },
  { id: 'c2', name: 'Nicole Gold', added: 'Yesterday', email: 'n.gold@gmail.com' },
  { id: 'c3', name: 'Alex Christie', added: 'Yesterday', email: 'alex@attio.com' },
];

const COLUMNS: DataTableColumn<Contact>[] = [
  {
    key: 'name',
    header: 'Contact',
    icon: <span data-testid="contact-icon" />,
    sortable: true,
    render: (r) => <RecordChip name={r.name} href={`/people/${r.id}`} />,
  },
  { key: 'added', header: 'Date added', sortable: true },
  {
    key: 'email',
    header: 'Email',
    render: (r) => (
      <CellPill accent="violet" href={`mailto:${r.email}`}>
        {r.email}
      </CellPill>
    ),
  },
];

describe('Table grid density', () => {
  it('layers the grid classes onto the dense table', () => {
    const { container } = render(
      <Table density="grid" gridDensity="dense" zebra borderless>
        <tbody>
          <tr>
            <td>x</td>
          </tr>
        </tbody>
      </Table>,
    );
    const table = container.querySelector('table')!;
    // `grid` builds on `.dtable` so it inherits sticky-head and row-action rules.
    expect(table.className).toContain('dtable');
    expect(table.className).toContain('dtable-grid');
    expect(table.className).toContain('dtable-grid-dense');
    expect(table.className).toContain('dtable-grid-zebra');
    expect(table.className).toContain('dtable-grid-borderless');
    expect(table.getAttribute('data-density')).toBe('grid');
  });

  it('exposes row height as a CSS variable', () => {
    const { container } = render(
      <Table density="grid" rowHeight={32}>
        <tbody />
      </Table>,
    );
    expect(container.querySelector('table')!.getAttribute('style')).toContain('--grid-row-h: 32px');
  });

  it('leaves the reading densities untouched', () => {
    const { container, rerender } = render(
      <Table>
        <tbody />
      </Table>,
    );
    expect(container.querySelector('table')!.className).toContain('table');
    expect(container.querySelector('table')!.className).not.toContain('dtable');

    rerender(
      <Table density="compact">
        <tbody />
      </Table>,
    );
    expect(container.querySelector('table')!.className).toContain('dtable');
    expect(container.querySelector('table')!.className).not.toContain('dtable-grid');
  });

  it('wraps a header icon with its label', () => {
    const { container } = render(
      <Table density="grid">
        <thead>
          <tr>
            <Table.HeaderCell icon={<span data-testid="ic" />}>Contact</Table.HeaderCell>
          </tr>
        </thead>
      </Table>,
    );
    expect(container.querySelector('.grid-th')).not.toBeNull();
    expect(container.querySelector('.grid-th-label')!.textContent).toBe('Contact');
    // The glyph is decorative — the label carries the column name.
    expect(container.querySelector('.grid-th-icon')!.getAttribute('aria-hidden')).toBe('true');
  });
});

describe('RecordChip', () => {
  it('renders a link with an accent-tinted avatar derived from the name', () => {
    const { getByRole } = render(<RecordChip name="Nicolas Sharp" href="/people/c1" />);
    const chip = getByRole('link');
    expect(chip.className).toContain('record-chip');
    expect(chip.getAttribute('href')).toBe('/people/c1');
    expect(chip.getAttribute('data-accent')).toBe(accentFor('Nicolas Sharp'));
    expect(chip.textContent).toContain('Nicolas Sharp');
  });

  it('renders a button when there is no href', () => {
    const onClick = vi.fn();
    const { getByRole } = render(<RecordChip name="Modal" onClick={onClick} />);
    fireEvent.click(getByRole('button', { name: /Modal/ }));
    expect(onClick).toHaveBeenCalled();
  });

  it('stops the remove click from reaching the chip', () => {
    const onClick = vi.fn();
    const onRemove = vi.fn();
    const { getByLabelText } = render(
      <RecordChip name="Ana Gantt" onClick={onClick} onRemove={onRemove} />,
    );
    fireEvent.click(getByLabelText('Remove Ana Gantt'));
    expect(onRemove).toHaveBeenCalled();
    // Removing a reference must not also open it.
    expect(onClick).not.toHaveBeenCalled();
  });

  it('collapses overflow in a group', () => {
    const { container, getByText } = render(
      <RecordChipGroup max={2}>
        <RecordChip name="Alicia Reed" />
        <RecordChip name="Tyler Robinson" />
        <RecordChip name="Olivia Johnson" />
        <RecordChip name="Leon Heinrichs" />
      </RecordChipGroup>,
    );
    expect(container.querySelectorAll('[data-slot="record-chip"]')).toHaveLength(2);
    expect(getByText('+2')).toBeTruthy();
  });
});

describe('CellPill', () => {
  it('tints through the accent channel and links when given an href', () => {
    const { getByRole } = render(
      <CellPill accent="violet" href="mailto:nick@attio.com">
        nick@attio.com
      </CellPill>,
    );
    const pill = getByRole('link');
    expect(pill.className).toContain('cell-pill');
    expect(pill.getAttribute('data-accent')).toBe('violet');
  });
});

describe('SelectionBar', () => {
  it('renders nothing with an empty selection', () => {
    const { container } = render(<SelectionBar count={0} />);
    expect(container.firstChild).toBeNull();
  });

  it('announces the count and fires its actions', () => {
    const onSelect = vi.fn();
    const onClear = vi.fn();
    const { getByRole, getByLabelText } = render(
      <SelectionBar
        count={3}
        onClear={onClear}
        actions={[{ id: 'add', label: 'Add to collection', onSelect }]}
      />,
    );
    const bar = getByRole('toolbar');
    expect(bar.getAttribute('aria-label')).toBe('3 selected');
    expect(bar.getAttribute('aria-live')).toBe('polite');

    fireEvent.click(getByLabelText('Add to collection'));
    expect(onSelect).toHaveBeenCalled();

    fireEvent.click(getByLabelText('Clear selection'));
    expect(onClear).toHaveBeenCalled();
  });
});

describe('DataTable', () => {
  it('defaults to the compact grid density', () => {
    const { container } = render(
      <DataTable columns={COLUMNS} data={CONTACTS} rowKey={(r) => r.id} />,
    );
    expect(container.querySelector('table')!.className).toContain('dtable-grid');
  });

  it('can opt back into the reading densities', () => {
    const { container } = render(
      <DataTable columns={COLUMNS} data={CONTACTS} rowKey={(r) => r.id} density="compact" />,
    );
    const table = container.querySelector('table')!;
    expect(table.className).toContain('dtable');
    expect(table.className).not.toContain('dtable-grid');
  });

  it('renders linked records and value pills in cells', () => {
    const { container } = render(
      <DataTable columns={COLUMNS} data={CONTACTS} rowKey={(r) => r.id} />,
    );
    expect(container.querySelectorAll('[data-slot="record-chip"]')).toHaveLength(3);
    expect(container.querySelectorAll('[data-slot="cell-pill"]')).toHaveLength(3);
    expect(container.querySelector('[data-testid="contact-icon"]')).not.toBeNull();
  });

  it('gives the selection column its own class in grid density', () => {
    const { container } = render(
      <DataTable columns={COLUMNS} data={CONTACTS} rowKey={(r) => r.id} selectable />,
    );
    expect(container.querySelectorAll('.grid-select')).toHaveLength(CONTACTS.length + 1);
  });

  it('shows quick actions once rows are selected and passes the keys through', () => {
    const onSelect = vi.fn();

    function Harness() {
      const [selected, setSelected] = useState<Array<string | number>>([]);
      return (
        <DataTable
          columns={COLUMNS}
          data={CONTACTS}
          rowKey={(r) => r.id}
          selectable
          selectedKeys={selected}
          onSelectionChange={setSelected}
          selectionActions={[{ id: 'email', label: 'Send email', onSelect }]}
        />
      );
    }

    const { queryByRole, getAllByLabelText, getByLabelText, getByRole } = render(<Harness />);
    // Nothing selected — no bar competing with the table's own bottom edge.
    expect(queryByRole('toolbar')).toBeNull();

    fireEvent.click(getAllByLabelText('Select row')[0]!);
    fireEvent.click(getAllByLabelText('Select row')[2]!);

    expect(getByRole('toolbar').getAttribute('aria-label')).toBe('2 selected');

    fireEvent.click(getByLabelText('Send email'));
    expect(onSelect).toHaveBeenCalledWith(['c1', 'c3']);

    fireEvent.click(getByLabelText('Clear selection'));
    expect(queryByRole('toolbar')).toBeNull();
  });

  it('select-all covers the page and toggles back off', () => {
    function Harness() {
      const [selected, setSelected] = useState<Array<string | number>>([]);
      return (
        <DataTable
          columns={COLUMNS}
          data={CONTACTS}
          rowKey={(r) => r.id}
          selectable
          selectedKeys={selected}
          onSelectionChange={setSelected}
          selectionActions={[{ id: 'x', label: 'Export' }]}
        />
      );
    }

    const { getByLabelText, queryByRole, getByRole } = render(<Harness />);
    const all = getByLabelText('Select all rows on this page');

    fireEvent.click(all);
    expect(getByRole('toolbar').getAttribute('aria-label')).toBe('3 selected');

    fireEvent.click(all);
    expect(queryByRole('toolbar')).toBeNull();
  });

  it('caps the scroll port and pins the leading column on request', () => {
    const { container } = render(
      <DataTable
        columns={COLUMNS}
        data={CONTACTS}
        rowKey={(r) => r.id}
        maxHeight={320}
        stickyHeader
        stickyFirstColumn
      />,
    );
    const scroll = container.querySelector('.table-scroll')!;
    expect(scroll.className).toContain('capped');
    expect(scroll.getAttribute('style')).toContain('--table-scroll-max-h: 320px');
    expect(scroll.hasAttribute('data-sticky-first')).toBe(true);
    expect(container.querySelector('table')!.className).toContain('sticky-head');
  });

  it('still sorts through the header', () => {
    const { getAllByRole, container } = render(
      <DataTable columns={COLUMNS} data={CONTACTS} rowKey={(r) => r.id} sortable />,
    );
    const header = getAllByRole('columnheader')[0]!;
    expect(header.getAttribute('aria-sort')).toBe('none');

    fireEvent.click(header);
    expect(header.getAttribute('aria-sort')).toBe('ascending');
    expect(container.querySelectorAll('tbody tr')[0]!.textContent).toContain('Alex Christie');

    fireEvent.click(header);
    expect(header.getAttribute('aria-sort')).toBe('descending');
    expect(container.querySelectorAll('tbody tr')[0]!.textContent).toContain('Nicole Gold');
  });
});
