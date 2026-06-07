import { describe, it, expect, vi } from 'vitest';
import { act } from 'react';
import { render, fireEvent, cleanup, renderHook } from '@testing-library/react';
import {
  AppShell,
  DropdownMenu,
  Input,
  Menu,
  NavGroup,
  NavItem,
  usePersistedFlag,
} from '../index';

afterEach(() => {
  cleanup();
  try {
    window.localStorage.clear();
  } catch {
    /* jsdom may not have storage */
  }
});

describe('AppShell.Brand', () => {
  it('renders an anchor with the brand text', () => {
    const { container } = render(<AppShell.Brand href="/">Mukamba</AppShell.Brand>);
    const a = container.querySelector('a.sidebar-brand')!;
    expect(a).toBeTruthy();
    expect(a.getAttribute('href')).toBe('/');
    expect(a.textContent).toContain('Mukamba');
  });
});

describe('AppShell.Topbar alias', () => {
  it('is reference-equal to AppShell.TopBar', () => {
    expect(AppShell.Topbar).toBe(AppShell.TopBar);
  });
});

describe('NavGroup', () => {
  it('renders a nav element with the label as heading', () => {
    const { container } = render(
      <NavGroup label="Workspace">
        <a href="/">Item</a>
      </NavGroup>,
    );
    const nav = container.querySelector('nav.nav-group')!;
    expect(nav).toBeTruthy();
    const heading = nav.querySelector('h6.nav-group-label')!;
    expect(heading.textContent).toBe('Workspace');
  });
});

describe('NavItem', () => {
  it('renders an anchor and adds aria-current="page" when active', () => {
    const { container } = render(
      <NavItem to="/receipts" active icon={<svg />} badge={3}>
        Receipts
      </NavItem>,
    );
    const a = container.querySelector('a.nav-item')!;
    expect(a.getAttribute('aria-current')).toBe('page');
    expect(a.className).toContain('is-active');
    expect(a.getAttribute('href')).toBe('/receipts');
    expect(a.querySelector('.nav-item-badge')!.textContent).toBe('3');
  });
  it('does not set aria-current when not active', () => {
    const { container } = render(<NavItem to="/staff">Staff</NavItem>);
    const a = container.querySelector('a.nav-item')!;
    expect(a.getAttribute('aria-current')).toBeNull();
  });
});

describe('DropdownMenu', () => {
  it('is reference-equal to Menu', () => {
    expect(DropdownMenu).toBe(Menu);
  });
  it('exposes a Separator alias for Divider', () => {
    expect(DropdownMenu.Separator).toBe(DropdownMenu.Divider);
  });
});

describe('Input with leading/trailing icons', () => {
  it('renders an icon slot and wraps the input', () => {
    const { container } = render(
      <Input leadingIcon={<svg data-testid="lead" />} placeholder="Search" />,
    );
    const wrap = container.querySelector('.input-wrap')!;
    expect(wrap).toBeTruthy();
    expect(wrap.querySelector('.input-icon-leading')).toBeTruthy();
    expect(wrap.querySelector('input.input')).toBeTruthy();
  });
  it('renders trailingSlot inside the trailing icon slot', () => {
    const { container } = render(
      <Input trailingSlot={<span>K</span>} />,
    );
    expect(container.querySelector('.input-icon-trailing')!.textContent).toBe('K');
  });
  it('renders a bare input when no icons are provided', () => {
    const { container } = render(<Input placeholder="bare" />);
    expect(container.querySelector('.input-wrap')).toBeNull();
    expect(container.querySelector('input.input')).toBeTruthy();
  });
});

describe('AppShell collapsed', () => {
  it('adds data-collapsed="true" to the shell root when collapsed', () => {
    const { container } = render(
      <AppShell collapsed>
        <AppShell.Sidebar />
      </AppShell>,
    );
    const root = container.querySelector('.app-shell')!;
    expect(root.getAttribute('data-collapsed')).toBe('true');
  });
  it('omits data-collapsed when not collapsed', () => {
    const { container } = render(<AppShell><AppShell.Sidebar /></AppShell>);
    expect(container.querySelector('.app-shell')!.getAttribute('data-collapsed')).toBeNull();
  });
});

describe('AppShell.Sidebar collapsible + onToggle', () => {
  it('renders a toggle button that fires onToggle when clicked', () => {
    const onToggle = vi.fn();
    const { container } = render(
      <AppShell.Sidebar collapsible onToggle={onToggle}>
        <NavItem to="/">Home</NavItem>
      </AppShell.Sidebar>,
    );
    const aside = container.querySelector('aside.sidebar')!;
    const inner = aside.querySelector('nav.sidebar-nav')!;
    expect(inner).toBeTruthy();
    const toggle = aside.querySelector('button.sidebar-toggle') as HTMLButtonElement;
    expect(toggle).toBeTruthy();
    fireEvent.click(toggle);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
  it('omits the toggle button when not collapsible', () => {
    const { container } = render(<AppShell.Sidebar />);
    expect(container.querySelector('button.sidebar-toggle')).toBeNull();
  });
});

describe('usePersistedFlag', () => {
  it('reads the initial value and persists writes to localStorage', () => {
    const { result } = renderHook(() => usePersistedFlag('shell.collapsed', false));
    expect(result.current[0]).toBe(false);
    act(() => result.current[1](true));
    expect(result.current[0]).toBe(true);
    expect(JSON.parse(window.localStorage.getItem('shell.collapsed')!)).toBe(true);
  });
  it('reads an existing persisted value on mount', () => {
    window.localStorage.setItem('shell.flag', 'true');
    const { result } = renderHook(() => usePersistedFlag('shell.flag', false));
    expect(result.current[0]).toBe(true);
  });
});
