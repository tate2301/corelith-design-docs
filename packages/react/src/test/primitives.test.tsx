import { describe, it, expect, vi } from 'vitest';
import { createRef } from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Checkbox,
  Field,
  Form,
  Input,
  InputOtp,
  Kbd,
  Radio,
  RadioGroup,
  Select,
  Skeleton,
  Spinner,
  Stack,
  Switch,
} from '../index';

afterEach(() => cleanup());

describe('Button', () => {
  it('renders, forwards ref, fires onClick', () => {
    const ref = createRef<HTMLButtonElement>();
    const onClick = vi.fn();
    const { getByRole } = render(
      <Button ref={ref} onClick={onClick}>
        Save
      </Button>,
    );
    const btn = getByRole('button');
    expect(btn.className).toContain('btn');
    expect(btn.className).toContain('btn-primary');
    expect(ref.current).toBe(btn);
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
  it('applies tone and fullWidth classes', () => {
    const { getByRole } = render(<Button tone="danger" fullWidth>Delete</Button>);
    const btn = getByRole('button');
    expect(btn.className).toContain('btn-danger');
    expect(btn.className).toContain('btn-full');
  });
  it('marks loading as aria-busy and disabled', () => {
    const { getByRole } = render(<Button loading>Loading</Button>);
    const btn = getByRole('button');
    expect(btn.getAttribute('aria-busy')).toBe('true');
    expect((btn as HTMLButtonElement).disabled).toBe(true);
  });
});

describe('Field + Input', () => {
  it('wires label htmlFor to input id via context', () => {
    const { container } = render(
      <Field label="Email" description="We never share">
        <Input type="email" />
      </Field>,
    );
    const label = container.querySelector('label')!;
    const input = container.querySelector('input')!;
    expect(label.getAttribute('for')).toBe(input.id);
    expect(input.getAttribute('aria-describedby')).toBe(`${input.id}-desc`);
  });
  it('marks input invalid when Field has error', () => {
    const { container } = render(
      <Field label="Name" error="Required">
        <Input />
      </Field>,
    );
    const input = container.querySelector('input')!;
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });
});

describe('Input', () => {
  it('forwards ref and onChange', () => {
    const ref = createRef<HTMLInputElement>();
    const onChange = vi.fn();
    const { getByRole } = render(<Input ref={ref} role="textbox" onChange={onChange} />);
    expect(ref.current).toBe(getByRole('textbox'));
    fireEvent.change(getByRole('textbox'), { target: { value: 'x' } });
    expect(onChange).toHaveBeenCalled();
  });
});

describe('InputOtp', () => {
  it('renders length cells and calls onChange when typing', () => {
    const onChange = vi.fn();
    const { container } = render(<InputOtp length={4} value="" onChange={onChange} />);
    const cells = container.querySelectorAll('input');
    expect(cells.length).toBe(4);
    fireEvent.change(cells[0]!, { target: { value: '1' } });
    expect(onChange).toHaveBeenCalledWith('1');
  });
});

describe('Alert', () => {
  it('uses role=alert for danger, role=status for info', () => {
    const { container, rerender } = render(<Alert tone="danger">Bad</Alert>);
    expect((container.firstChild as HTMLElement).getAttribute('role')).toBe('alert');
    rerender(<Alert tone="info">Hi</Alert>);
    expect((container.firstChild as HTMLElement).getAttribute('role')).toBe('status');
  });
});

describe('Stack', () => {
  it('renders with flex direction styles', () => {
    const { container } = render(<Stack direction="horizontal">a</Stack>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('x-stack');
    expect(el.style.flexDirection).toBe('row');
  });
});

describe('Form', () => {
  it('renders a form with noValidate and onSubmit', () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    const { container } = render(
      <Form onSubmit={onSubmit}>
        <button type="submit">go</button>
      </Form>,
    );
    const form = container.querySelector('form')!;
    expect(form.noValidate).toBe(true);
    fireEvent.submit(form);
    expect(onSubmit).toHaveBeenCalled();
  });
});

describe('Checkbox', () => {
  it('fires onChange', () => {
    const onChange = vi.fn();
    const { container } = render(<Checkbox label="Agree" onChange={onChange} />);
    const input = container.querySelector('input[type="checkbox"]')!;
    fireEvent.click(input);
    expect(onChange).toHaveBeenCalled();
  });
});

describe('Radio + RadioGroup', () => {
  it('selects via group value', () => {
    const onChange = vi.fn();
    const { container } = render(
      <RadioGroup value="b" onChange={onChange}>
        <Radio value="a" label="A" />
        <Radio value="b" label="B" />
      </RadioGroup>,
    );
    const inputs = container.querySelectorAll<HTMLInputElement>('input[type="radio"]');
    expect(inputs[1]!.checked).toBe(true);
    fireEvent.click(inputs[0]!);
    expect(onChange).toHaveBeenCalledWith('a');
  });
});

describe('Switch', () => {
  it('renders role=switch', () => {
    const { container } = render(<Switch label="On" />);
    const sw = container.querySelector('input[role="switch"]')!;
    expect(sw).toBeTruthy();
    expect(sw.className).toContain('switch');
  });
});

describe('Select', () => {
  it('renders options', () => {
    const { container } = render(
      <Select
        options={[
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
        ]}
      />,
    );
    expect(container.querySelectorAll('option').length).toBe(2);
  });
});

describe('Badge', () => {
  it('applies tone class', () => {
    const { container } = render(<Badge tone="success">OK</Badge>);
    expect((container.firstChild as HTMLElement).className).toContain('badge-success');
  });
});

describe('Avatar', () => {
  it('derives initials from name', () => {
    const { container } = render(<Avatar name="Ada Lovelace" />);
    expect(container.textContent).toBe('AL');
  });
});

describe('Spinner', () => {
  it('renders role=status', () => {
    const { container } = render(<Spinner label="Saving" />);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute('role')).toBe('status');
    expect(el.getAttribute('aria-label')).toBe('Saving');
  });
});

describe('Skeleton', () => {
  it('renders multiple lines', () => {
    const { container } = render(<Skeleton lines={3} width={200} />);
    expect(container.querySelectorAll('.skeleton').length).toBe(3);
  });
});

describe('Kbd', () => {
  it('renders a kbd element', () => {
    const { container } = render(<Kbd>⌘K</Kbd>);
    expect((container.firstChild as HTMLElement).tagName).toBe('KBD');
  });
});
