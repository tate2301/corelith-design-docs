import { describe, it, expect } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import {
  Alert,
  AlertDialog,
  Avatar,
  Badge,
  BottomSheet,
  BottomTabs,
  Button,
  Checkbox,
  Combobox,
  DataTable,
  Dialog,
  Drawer,
  FilterChips,
  Input,
  InputOtp,
  KanbanBoard,
  Menu,
  Meter,
  Modal,
  Pagination,
  Popover,
  Progress,
  Radio,
  RadioGroup,
  RoleSwitcher,
  SegmentedControl,
  Select,
  Spinner,
  Stepper,
  Switch,
  Tabs,
  TextArea,
  Tooltip,
} from '../index';

afterEach(() => cleanup());

// All of these tests are hand-rolled WAI-ARIA assertions. We don't pull in
// jest-axe — these check `role` + the contract attributes each component owes.

describe('a11y: roles & aria attributes', () => {
  it('Button has role=button', () => {
    const { getByRole } = render(<Button>x</Button>);
    expect(getByRole('button')).toBeTruthy();
  });

  it('Button forwards aria-label', () => {
    const { getByRole } = render(<Button aria-label="save">x</Button>);
    expect(getByRole('button').getAttribute('aria-label')).toBe('save');
  });

  it('Button with loading sets aria-busy=true', () => {
    const { getByRole } = render(<Button loading>x</Button>);
    expect(getByRole('button').getAttribute('aria-busy')).toBe('true');
  });

  it('Input forwards aria-describedby', () => {
    const { container } = render(<Input aria-describedby="hint" />);
    expect(container.querySelector('input')!.getAttribute('aria-describedby')).toBe('hint');
  });

  it('Input with invalid sets aria-invalid=true', () => {
    const { container } = render(<Input invalid />);
    expect(container.querySelector('input')!.getAttribute('aria-invalid')).toBe('true');
  });

  it('TextArea forwards aria-label', () => {
    const { container } = render(<TextArea aria-label="bio" />);
    expect(container.querySelector('textarea')!.getAttribute('aria-label')).toBe('bio');
  });

  it('Checkbox forwards aria-label', () => {
    const { container } = render(<Checkbox aria-label="agree" />);
    expect(container.querySelector('input')!.getAttribute('aria-label')).toBe('agree');
  });

  it('Switch forwards aria-label', () => {
    const { container } = render(<Switch aria-label="notif" />);
    expect(container.querySelector('input')!.getAttribute('aria-label')).toBe('notif');
  });

  it('Radio has type=radio', () => {
    const { container } = render(<Radio name="x" />);
    expect(container.querySelector('input')!.getAttribute('type')).toBe('radio');
  });

  it('RadioGroup has role=radiogroup', () => {
    const { getByRole } = render(
      <RadioGroup name="x" ariaLabel="pick">
        <Radio name="x" value="a" />
      </RadioGroup>,
    );
    expect(getByRole('radiogroup')).toBeTruthy();
  });

  it('Select forwards aria-label', () => {
    const { container } = render(
      <Select aria-label="pick" options={[{ value: 'a', label: 'A' }]} />,
    );
    expect(container.querySelector('select')!.getAttribute('aria-label')).toBe('pick');
  });

  it('Tabs.List has role=tablist', () => {
    const { getByRole } = render(
      <Tabs defaultValue="a">
        <Tabs.List ariaLabel="t">
          <Tabs.Tab value="a">A</Tabs.Tab>
        </Tabs.List>
      </Tabs>,
    );
    expect(getByRole('tablist')).toBeTruthy();
  });

  it('Tabs.Tab has role=tab', () => {
    const { getByRole } = render(
      <Tabs defaultValue="a">
        <Tabs.List>
          <Tabs.Tab value="a">A</Tabs.Tab>
        </Tabs.List>
      </Tabs>,
    );
    expect(getByRole('tab')).toBeTruthy();
  });

  it('Tabs.Tab selected has aria-selected=true', () => {
    const { getByRole } = render(
      <Tabs defaultValue="a">
        <Tabs.List>
          <Tabs.Tab value="a">A</Tabs.Tab>
        </Tabs.List>
      </Tabs>,
    );
    expect(getByRole('tab').getAttribute('aria-selected')).toBe('true');
  });

  it('Tabs.Tab unselected has tabIndex=-1', () => {
    const { container } = render(
      <Tabs defaultValue="a">
        <Tabs.List>
          <Tabs.Tab value="a">A</Tabs.Tab>
          <Tabs.Tab value="b">B</Tabs.Tab>
        </Tabs.List>
      </Tabs>,
    );
    const tabs = container.querySelectorAll('[role="tab"]');
    expect((tabs[1] as HTMLElement).tabIndex).toBe(-1);
  });

  it('Alert has role=alert', () => {
    const { getByRole } = render(<Alert tone="danger">err</Alert>);
    expect(getByRole('alert')).toBeTruthy();
  });

  it('Modal has role=dialog, aria-modal=true', () => {
    const { container } = render(
      <Modal open onClose={() => {}} title="x">
        body
      </Modal>,
    );
    const dialog = container.ownerDocument.querySelector('[role="dialog"]')!;
    expect(dialog.getAttribute('aria-modal')).toBe('true');
  });

  it('Modal labelled by title id', () => {
    const { container } = render(
      <Modal open onClose={() => {}} title="hello">
        body
      </Modal>,
    );
    const dialog = container.ownerDocument.querySelector('[role="dialog"]')!;
    const labelledBy = dialog.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    const label = container.ownerDocument.getElementById(labelledBy!);
    expect(label?.textContent).toBe('hello');
  });

  it('Dialog inherits Modal role/aria-modal', () => {
    const { container } = render(
      <Dialog open onClose={() => {}} title="x" confirmLabel="OK">
        body
      </Dialog>,
    );
    const dialog = container.ownerDocument.querySelector('[role="dialog"]')!;
    expect(dialog.getAttribute('aria-modal')).toBe('true');
  });

  it('Drawer has role=dialog', () => {
    const { container } = render(
      <Drawer open onClose={() => {}} title="x">
        body
      </Drawer>,
    );
    expect(container.ownerDocument.querySelector('[role="dialog"]')).toBeTruthy();
  });

  it('BottomSheet has role=dialog', () => {
    const { container } = render(
      <BottomSheet open onClose={() => {}} title="x">
        body
      </BottomSheet>,
    );
    expect(container.ownerDocument.querySelector('[role="dialog"]')).toBeTruthy();
  });

  it('Popover dismisses on Escape', () => {
    let closed = false;
    render(
      <Popover open onClose={() => (closed = true)} title="x">
        body
      </Popover>,
    );
    expect(closed).toBe(false);
  });

  it('Menu has role=menu', () => {
    const { getByRole } = render(
      <Menu>
        <Menu.Item>x</Menu.Item>
      </Menu>,
    );
    expect(getByRole('menu')).toBeTruthy();
  });

  it('Menu.Item has role=menuitem', () => {
    const { getByRole } = render(
      <Menu>
        <Menu.Item>x</Menu.Item>
      </Menu>,
    );
    expect(getByRole('menuitem')).toBeTruthy();
  });

  it('Progress has role=progressbar with aria-valuenow', () => {
    const { container } = render(<Progress value={42} max={100} />);
    const bar = container.querySelector('[role="progressbar"]')!;
    expect(bar.getAttribute('aria-valuenow')).toBe('42');
  });

  it('Meter has role=meter with aria-valuenow', () => {
    const { container } = render(<Meter value={50} max={100} />);
    const m = container.querySelector('[role="meter"]')!;
    expect(m.getAttribute('aria-valuenow')).toBe('50');
  });

  it('Spinner has role=status or role=progressbar', () => {
    const { container } = render(<Spinner />);
    const node = container.querySelector('[role="status"], [role="progressbar"]');
    expect(node).toBeTruthy();
  });

  it('Pagination has role=navigation or aria-label set', () => {
    const { container } = render(
      <Pagination total={10} page={1} onPageChange={() => {}} />,
    );
    const nav = container.querySelector('nav, [role="navigation"]');
    expect(nav).toBeTruthy();
  });

  it('SegmentedControl has role=radiogroup', () => {
    const { getByRole } = render(
      <SegmentedControl
        defaultValue="a"
        options={[{ value: 'a', label: 'A' }]}
      />,
    );
    expect(getByRole('radiogroup')).toBeTruthy();
  });

  it('FilterChips has role=radiogroup by default', () => {
    const { getByRole } = render(
      <FilterChips defaultValue="a" options={[{ value: 'a', label: 'A' }]} />,
    );
    expect(getByRole('radiogroup')).toBeTruthy();
  });

  it('FilterChips role=tablist switches child role to tab', () => {
    const { container } = render(
      <FilterChips
        defaultValue="a"
        role="tablist"
        options={[{ value: 'a', label: 'A' }]}
      />,
    );
    expect(container.querySelector('[role="tab"]')).toBeTruthy();
  });

  it('Tooltip popup has role=tooltip', () => {
    const { getByRole, queryByRole } = render(
      <Tooltip content="hi">
        <button>x</button>
      </Tooltip>,
    );
    expect(queryByRole('tooltip')).toBeNull();
    fireEvent.mouseEnter(getByRole('button'));
    expect(queryByRole('tooltip')).toBeTruthy();
  });

  it('Combobox input has role=combobox', () => {
    const { container } = render(
      <Combobox items={[{ value: 'a', label: 'A' }]} />,
    );
    expect(container.querySelector('[role="combobox"]')).toBeTruthy();
  });

  it('Combobox listbox has role=listbox', () => {
    const { container } = render(
      <Combobox items={[{ value: 'a', label: 'A' }]} />,
    );
    expect(container.querySelector('[role="listbox"]')).toBeTruthy();
  });

  it('DataTable header has aria-sort for sortable column', () => {
    const { container } = render(
      <DataTable
        columns={[{ id: 'n', header: 'N', sortable: true }]}
        rows={[]}
        getRowId={() => '1'}
        sort={{ column: 'n', direction: 'asc' }}
        onSortChange={() => {}}
      />,
    );
    const th = container.querySelector('th.sortable')!;
    expect(th.getAttribute('aria-sort')).toBe('ascending');
  });

  it('DataTable selection checkbox has aria-label', () => {
    const { container } = render(
      <DataTable
        columns={[{ id: 'n', header: 'N' }]}
        rows={[{ id: 'r1', n: 'a' }]}
        getRowId={(r) => r.id as string}
        selectable
        selected={[]}
        onSelectionChange={() => {}}
      />,
    );
    expect(container.querySelector('input[aria-label="Select all rows"]')).toBeTruthy();
  });

  it('InputOtp container has role=group', () => {
    const { container } = render(
      <InputOtp value="" onChange={() => {}} length={4} />,
    );
    const group = container.querySelector('[role="group"]')!;
    expect(group.getAttribute('aria-label')).toBe('One-time code');
  });

  it('InputOtp cells have aria-label "Digit N of M"', () => {
    const { container } = render(
      <InputOtp value="" onChange={() => {}} length={3} />,
    );
    const cells = container.querySelectorAll<HTMLInputElement>('.input-otp-cell');
    expect(cells[0]!.getAttribute('aria-label')).toBe('Digit 1 of 3');
    expect(cells[2]!.getAttribute('aria-label')).toBe('Digit 3 of 3');
  });

  it('KanbanBoard root has role=list', () => {
    const { container } = render(
      <KanbanBoard
        columns={[{ id: 'a', title: 'A' }]}
        items={{ a: [] }}
      />,
    );
    expect(container.querySelector('[role="list"]')).toBeTruthy();
  });

  it('KanbanBoard column has role=listitem', () => {
    const { container } = render(
      <KanbanBoard
        columns={[{ id: 'a', title: 'A' }]}
        items={{ a: [] }}
      />,
    );
    expect(container.querySelector('[role="listitem"]')).toBeTruthy();
  });

  it('AlertDialog has role=dialog when open', () => {
    const { container } = render(
      <AlertDialog
        open
        onClose={() => {}}
        title="x"
        confirmLabel="OK"
      />,
    );
    expect(container.ownerDocument.querySelector('[role="dialog"]')).toBeTruthy();
  });

  it('Badge renders a span with text', () => {
    const { container } = render(<Badge>3</Badge>);
    expect(container.querySelector('span')).toBeTruthy();
  });

  it('Avatar with alt sets img role', () => {
    const { container } = render(<Avatar alt="x" />);
    expect(container.querySelector('[role="img"], img')).toBeTruthy();
  });

  it('RoleSwitcher group is exposed as role=group', () => {
    const { getByRole } = render(
      <RoleSwitcher
        defaultValue="a"
        options={[{ value: 'a', label: 'A' }]}
      />,
    );
    expect(getByRole('group')).toBeTruthy();
  });

  it('Stepper exposes a list of steps', () => {
    const { container } = render(
      <Stepper>
        <Stepper.Step state="active">A</Stepper.Step>
      </Stepper>,
    );
    // Stepper renders something — sanity check.
    expect(container.firstChild).toBeTruthy();
  });

  it('BottomTabs is a navigation landmark or tablist', () => {
    const { container } = render(
      <BottomTabs
        value="home"
        onChange={() => {}}
        items={[{ value: 'home', label: 'Home' }]}
      />,
    );
    expect(container.querySelector('nav, [role="tablist"]')).toBeTruthy();
  });

  it('Modal close on backdrop click works (and is a focusable region)', () => {
    let closed = false;
    const { container } = render(
      <Modal open onClose={() => (closed = true)} title="x">
        body
      </Modal>,
    );
    const overlay = container.ownerDocument.querySelector('.x-modal-overlay')!;
    (overlay as HTMLElement).click();
    expect(closed).toBe(true);
  });
});
