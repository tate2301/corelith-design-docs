import { describe, it, expect, vi } from 'vitest';
import { createRef } from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Checkbox,
  Chip,
  Input,
  InputOTP,
  Kbd,
  Pagination,
  Select,
  Skeleton,
  Spinner,
  Switch,
} from '../index';

afterEach(() => cleanup());

describe('Button', () => {
  it('renders the new secondary default and forwards refs', () => {
    const ref = createRef<HTMLButtonElement>();
    const onClick = vi.fn();
    const { getByRole } = render(
      <Button ref={ref} onClick={onClick}>
        Save
      </Button>,
    );

    const btn = getByRole('button');
    expect(btn.className).toContain('btn');
    expect(btn.className).toContain('btn-secondary');
    expect(btn.getAttribute('data-slot')).toBe('button');
    expect(ref.current).toBe(btn);
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('supports variant, block, loading, and Radix-style asChild', () => {
    const { getByRole, rerender } = render(
      <Button variant="destructive" block loading>
        Delete
      </Button>,
    );
    const btn = getByRole('button');
    expect(btn.className).toContain('btn-destructive');
    expect(btn.className).toContain('btn-block');
    expect(btn.getAttribute('aria-busy')).toBe('true');
    expect((btn as HTMLButtonElement).disabled).toBe(true);

    rerender(
      <Button asChild variant="primary">
        <a href="/docs">Docs</a>
      </Button>,
    );
    const link = getByRole('link');
    expect(link.className).toContain('btn-primary');
    expect(link.getAttribute('data-slot')).toBe('button');
  });
});

describe('Input', () => {
  it('wires label, hint, error, and refs from the component itself', () => {
    const ref = createRef<HTMLInputElement>();
    const { container, rerender } = render(
      <Input ref={ref} label="Email" hint="Used for receipts" type="email" />,
    );

    const input = container.querySelector('input')!;
    const label = container.querySelector('label')!;
    expect(label.getAttribute('for')).toBe(input.id);
    expect(input.getAttribute('aria-describedby')).toBe(`${input.id}-hint`);
    expect(ref.current).toBe(input);

    rerender(<Input label="Email" error="Required" />);
    const invalid = container.querySelector('input')!;
    expect(invalid.getAttribute('aria-invalid')).toBe('true');
    expect(invalid.getAttribute('aria-describedby')).toBe(`${invalid.id}-error`);
  });
});

describe('InputOTP', () => {
  it('renders character cells and emits onValueChange', () => {
    const onValueChange = vi.fn();
    const { container } = render(<InputOTP length={4} value="" onValueChange={onValueChange} />);
    const cells = container.querySelectorAll('input');
    expect(cells.length).toBe(4);
    fireEvent.change(cells[0]!, { target: { value: '1' } });
    expect(onValueChange).toHaveBeenCalledWith('1');
  });
});

describe('Selection Primitives', () => {
  it('renders Checkbox and Switch with native inputs', () => {
    const onCheckboxChange = vi.fn();
    const onSwitchChange = vi.fn();
    const { container } = render(
      <>
        <Checkbox label="Agree" onChange={onCheckboxChange} />
        <Switch label="Enabled" onChange={onSwitchChange} />
      </>,
    );

    const checkbox = container.querySelector<HTMLInputElement>('input[type="checkbox"]:not([role])')!;
    const sw = container.querySelector<HTMLInputElement>('input[role="switch"]')!;
    fireEvent.click(checkbox);
    fireEvent.click(sw);
    expect(onCheckboxChange).toHaveBeenCalled();
    expect(onSwitchChange).toHaveBeenCalled();
  });

  it('renders Select children with label and helper wiring', () => {
    const { container } = render(
      <Select label="Role" hint="Choose access">
        <option value="admin">Admin</option>
        <option value="viewer">Viewer</option>
      </Select>,
    );

    const select = container.querySelector('select')!;
    expect(container.querySelectorAll('option').length).toBe(2);
    expect(container.querySelector('label')!.getAttribute('for')).toBe(select.id);
    expect(select.getAttribute('aria-describedby')).toBe(`${select.id}-hint`);
  });
});

describe('Display Primitives', () => {
  it('renders Alert roles, Avatar initials, Spinner, Skeleton, and Kbd', () => {
    const { container, rerender } = render(<Alert tone="warn">Heads up</Alert>);
    expect((container.firstChild as HTMLElement).getAttribute('role')).toBe('alert');

    rerender(<Alert tone="info">FYI</Alert>);
    expect((container.firstChild as HTMLElement).getAttribute('role')).toBe('status');

    rerender(<Avatar name="Ada Lovelace" />);
    expect(container.textContent).toBe('AL');

    rerender(<Spinner label="Saving" />);
    expect((container.firstChild as HTMLElement).getAttribute('role')).toBe('status');
    expect(container.textContent).toContain('Saving');

    rerender(<Skeleton variant="circle" width={32} />);
    expect((container.firstChild as HTMLElement).className).toContain('skeleton');
    expect((container.firstChild as HTMLElement).style.borderRadius).toBe('9999px');

    rerender(<Kbd>Ctrl K</Kbd>);
    expect((container.firstChild as HTMLElement).tagName).toBe('KBD');
  });

  it('supports asChild on Badge and Chip state hooks', () => {
    const onRemove = vi.fn();
    const { getByRole, getByLabelText } = render(
      <>
        <Badge asChild tone="success">
          <a href="/status">Active</a>
        </Badge>
        <Chip selected onRemove={onRemove}>
          Paid
        </Chip>
      </>,
    );

    expect(getByRole('link').className).toContain('badge-success');
    expect(getByRole('button', { name: /paid/i }).getAttribute('data-state')).toBe('on');
    fireEvent.click(getByLabelText('Remove'));
    expect(onRemove).toHaveBeenCalled();
  });
});

describe('Pagination', () => {
  it('uses count and onPageChange without leaking legacy props', () => {
    const onPageChange = vi.fn();
    const { container } = render(<Pagination page={2} count={5} onPageChange={onPageChange} />);

    fireEvent.click(container.querySelector('button[aria-label="Next page"]')!);
    expect(onPageChange).toHaveBeenCalledWith(3);
    expect(container.querySelector('nav')!.hasAttribute('pageCount')).toBe(false);
  });
});
