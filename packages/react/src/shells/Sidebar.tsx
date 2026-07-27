"use client";

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ButtonHTMLAttributes,
  type LiHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { cn } from '../utils/cn';
import { Slot } from '../utils/Slot';
import { Button, type ButtonProps } from '../primitives/Button';
import { Input, type InputProps } from '../primitives/Input';
import { Drawer } from '../primitives/Drawer';
import { Tooltip } from '../primitives/Tooltip';
import { useMediaQuery } from '../hooks/useMediaQuery';

const SIDEBAR_COOKIE_NAME = 'sidebar:state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = '17.5rem';
const SIDEBAR_WIDTH_ICON = '3.75rem';
const SIDEBAR_WIDTH_MOBILE = 'min(19rem, calc(100vw - 1rem))';
const SIDEBAR_MOBILE_QUERY = '(max-width: 767px)';

export interface SidebarContextValue {
  /** Derived from `open` — `'collapsed'` drives the icon-rail styling. */
  state: 'expanded' | 'collapsed';
  /** Desktop open state. */
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Mobile drawer open state. */
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  /** True below 768px. `false` during SSR and the first client render. */
  isMobile: boolean;
  /** Flips the mobile drawer on mobile, the desktop rail otherwise. */
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

/**
 * Reads the sidebar state. Throws when rendered outside `<SidebarProvider>`,
 * because every sidebar part depends on the shared open/collapsed state.
 */
export function useSidebar(): SidebarContextValue {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

export interface SidebarProviderProps extends HTMLAttributes<HTMLDivElement> {
  /** Uncontrolled initial open state. @default true */
  defaultOpen?: boolean;
  /** Controlled open state. Pair with `onOpenChange`. */
  open?: boolean;
  /** Fires whenever the sidebar wants to open or close. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Cookie name used to remember the open state for a week. Pass
   * `persistKey={undefined}` to opt out of persistence entirely.
   * @default 'sidebar:state'
   */
  persistKey?: string;
}

/**
 * SidebarProvider — owns the open/collapsed state and the layout frame.
 *
 * Wrap the whole page: the provider is the flex row that holds `<Sidebar>` and
 * `<SidebarInset>`, and it publishes the `--sidebar-width*` custom properties
 * that nav.css measures against.
 *
 * @example
 * ```tsx
 * <SidebarProvider defaultOpen>
 *   <Sidebar collapsible="icon">
 *     <SidebarHeader><SidebarTrigger /></SidebarHeader>
 *     <SidebarContent>
 *       <SidebarGroup>
 *         <SidebarGroupLabel>Workspace</SidebarGroupLabel>
 *         <SidebarGroupContent>
 *           <SidebarMenu>
 *             <SidebarMenuItem>
 *               <SidebarMenuButton isActive tooltip="Overview">Overview</SidebarMenuButton>
 *             </SidebarMenuItem>
 *           </SidebarMenu>
 *         </SidebarGroupContent>
 *       </SidebarGroup>
 *     </SidebarContent>
 *     <SidebarRail />
 *   </Sidebar>
 *   <SidebarInset>{children}</SidebarInset>
 * </SidebarProvider>
 * ```
 */
export const SidebarProvider = forwardRef<HTMLDivElement, SidebarProviderProps>(
  function SidebarProvider(
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange,
      persistKey = SIDEBAR_COOKIE_NAME,
      className,
      style,
      children,
      ...rest
    },
    ref,
  ) {
    const isMobile = useMediaQuery(SIDEBAR_MOBILE_QUERY);
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const [openMobile, setOpenMobile] = useState(false);

    const isControlled = openProp !== undefined;
    const open = isControlled ? openProp! : uncontrolledOpen;

    const setOpen = useCallback(
      (value: boolean) => {
        if (isControlled) onOpenChange?.(value);
        else {
          setUncontrolledOpen(value);
          onOpenChange?.(value);
        }
      },
      [isControlled, onOpenChange],
    );

    useEffect(() => {
      // Persistence is opt-out (`persistKey={undefined}`) and SSR-guarded.
      if (!persistKey) return;
      if (typeof document === 'undefined') return;
      document.cookie = `${persistKey}=${open}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    }, [persistKey, open]);

    const toggleSidebar = useCallback(() => {
      if (isMobile) setOpenMobile((prev) => !prev);
      else setOpen(!open);
    }, [isMobile, open, setOpen]);

    const state: SidebarContextValue['state'] = open ? 'expanded' : 'collapsed';

    return (
      <SidebarContext.Provider
        value={{ state, open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar }}
      >
        <div
          ref={ref}
          className={cn('sidebar-provider', className)}
          data-state={state}
          style={
            {
              '--sidebar-width': SIDEBAR_WIDTH,
              '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
              '--sidebar-width-mobile': SIDEBAR_WIDTH_MOBILE,
              ...style,
            } as CSSProperties
          }
          {...rest}
        >
          {children}
        </div>
      </SidebarContext.Provider>
    );
  },
);

export type SidebarCollapsible = 'offcanvas' | 'icon' | 'none';
export type SidebarVariant = 'sidebar' | 'inset';

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  /** How the rail behaves when closed. @default 'icon' */
  collapsible?: SidebarCollapsible;
  /** `inset` floats the rail as a rounded panel. @default 'sidebar' */
  variant?: SidebarVariant;
}

/**
 * Sidebar — the app rail itself. On mobile it renders inside the DS `Drawer`
 * (left) so it never eats the viewport; on desktop it is a plain `<aside>` that
 * animates between `--sidebar-width` and `--sidebar-width-icon`.
 *
 * Emits `data-state`, `data-collapsible` and `data-variant` for nav.css.
 */
export const Sidebar = forwardRef<HTMLElement, SidebarProps>(function Sidebar(
  { collapsible = 'icon', variant = 'sidebar', className, children, ...rest },
  ref,
) {
  const { isMobile, openMobile, setOpenMobile, state } = useSidebar();

  const aside = (
    <aside
      ref={ref}
      data-sidebar="sidebar"
      data-state={state}
      data-collapsible={collapsible}
      data-variant={variant}
      className={cn('sidebar', className)}
      {...rest}
    >
      {children}
    </aside>
  );

  if (collapsible === 'none') return aside;

  if (isMobile) {
    return (
      <Drawer
        open={openMobile}
        onClose={() => setOpenMobile(false)}
        position="left"
        width={SIDEBAR_WIDTH_MOBILE}
        className="sidebar-drawer"
        aria-label="Sidebar"
      >
        {aside}
      </Drawer>
    );
  }

  return aside;
});

export const SidebarHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function SidebarHeader({ className, ...rest }, ref) {
    return <div ref={ref} data-sidebar="header" className={cn('sidebar-header', className)} {...rest} />;
  },
);

export const SidebarFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function SidebarFooter({ className, ...rest }, ref) {
    return <div ref={ref} data-sidebar="footer" className={cn('sidebar-footer', className)} {...rest} />;
  },
);

export const SidebarContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function SidebarContent({ className, ...rest }, ref) {
    return <div ref={ref} data-sidebar="content" className={cn('sidebar-content', className)} {...rest} />;
  },
);

export const SidebarGroup = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function SidebarGroup({ className, ...rest }, ref) {
    return <div ref={ref} data-sidebar="group" className={cn('sidebar-group', className)} {...rest} />;
  },
);

export const SidebarGroupLabel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function SidebarGroupLabel({ className, ...rest }, ref) {
    return (
      <div ref={ref} data-sidebar="group-label" className={cn('sidebar-group-label', className)} {...rest} />
    );
  },
);

export const SidebarGroupContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function SidebarGroupContent({ className, ...rest }, ref) {
    return (
      <div ref={ref} data-sidebar="group-content" className={cn('sidebar-group-content', className)} {...rest} />
    );
  },
);

/** The page column beside the rail. Fills the rest of the provider row. */
export const SidebarInset = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function SidebarInset({ className, ...rest }, ref) {
    return <div ref={ref} className={cn('sidebar-inset', className)} {...rest} />;
  },
);

export const SidebarMenu = forwardRef<HTMLUListElement, HTMLAttributes<HTMLUListElement>>(
  function SidebarMenu({ className, ...rest }, ref) {
    return <ul ref={ref} data-sidebar="menu" className={cn('sidebar-menu', className)} {...rest} />;
  },
);

export const SidebarMenuItem = forwardRef<HTMLLIElement, LiHTMLAttributes<HTMLLIElement>>(
  function SidebarMenuItem({ className, ...rest }, ref) {
    return <li ref={ref} data-sidebar="menu-item" className={cn('sidebar-menu-item', className)} {...rest} />;
  },
);

export type SidebarMenuButtonSize = 'sm' | 'default' | 'lg';
export type SidebarMenuButtonVariant = 'default' | 'outline';

export interface SidebarMenuButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Render the row styles onto the supplied child (a router `<Link>`, say). */
  asChild?: boolean;
  /** Marks the current route. */
  isActive?: boolean;
  /** Shown as a tooltip on the right — only while the rail is collapsed. */
  tooltip?: ReactNode;
  /** Row density. @default 'default' */
  size?: SidebarMenuButtonSize;
  /** `outline` draws the row on a framed surface. @default 'default' */
  variant?: SidebarMenuButtonVariant;
}

/**
 * SidebarMenuButton — one row in the rail.
 *
 * A sidebar row is navigation, not a control: no outline, no shadow, and it
 * does not shift on hover. Hover and active are the same soft fill, separated
 * by the weight of the label — the same contract as `.rail-item`.
 */
export const SidebarMenuButton = forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  function SidebarMenuButton(
    {
      asChild = false,
      isActive,
      tooltip,
      size = 'default',
      variant = 'default',
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const { state } = useSidebar();
    const collapsed = state === 'collapsed';
    const classes = cn(
      'sidebar-menu-button',
      size !== 'default' && `sidebar-menu-button-${size}`,
      variant !== 'default' && `sidebar-menu-button-${variant}`,
      isActive && 'is-active',
      className,
    );

    const activeAttr = isActive ? 'true' : undefined;
    const collapsedAttr = collapsed ? 'true' : 'false';

    const button = asChild ? (
      <Slot
        ref={ref as Ref<HTMLElement>}
        className={classes}
        data-sidebar="menu-button"
        data-active={activeAttr}
        data-collapsed={collapsedAttr}
        {...(rest as HTMLAttributes<HTMLElement>)}
      >
        {children as ReactElement}
      </Slot>
    ) : (
      <button
        ref={ref}
        type="button"
        className={classes}
        data-sidebar="menu-button"
        data-active={activeAttr}
        data-collapsed={collapsedAttr}
        {...rest}
      >
        {children}
      </button>
    );

    if (!tooltip || !collapsed) return button;

    return (
      <Tooltip content={tooltip} side="right">
        {button}
      </Tooltip>
    );
  },
);

/** A hairline between groups of rows. */
export const SidebarSeparator = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function SidebarSeparator({ className, ...rest }, ref) {
    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation="horizontal"
        data-sidebar="separator"
        className={cn('sidebar-separator', className)}
        {...rest}
      />
    );
  },
);

/** The rail's search box — the DS `Input` with sidebar metrics. */
export const SidebarInput = forwardRef<HTMLInputElement, InputProps>(function SidebarInput(
  { className, ...rest },
  ref,
) {
  return <Input ref={ref} size="sm" data-sidebar="input" className={cn('sidebar-input', className)} {...rest} />;
});

/** The default glyph for `<SidebarTrigger>` — a panel with its left column filled. */
function SidebarLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <rect x="1.75" y="2.75" width="12.5" height="10.5" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6 3v10" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

/**
 * SidebarTrigger — the button that opens and closes the rail. Renders the DS
 * `Button` in its icon-only ghost form and always carries an accessible name.
 */
export const SidebarTrigger = forwardRef<HTMLButtonElement, ButtonProps>(function SidebarTrigger(
  { className, onClick, children, ...rest },
  ref,
) {
  const { toggleSidebar } = useSidebar();
  return (
    <Button
      ref={ref}
      variant="ghost"
      size="sm"
      iconOnly
      aria-label="Toggle sidebar"
      data-sidebar="trigger"
      className={cn('sidebar-trigger', className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...rest}
    >
      {children ?? <SidebarLeftIcon />}
    </Button>
  );
});

/**
 * SidebarRail — the thin strip on the rail's trailing edge. Invisible until the
 * sidebar is hovered, then it becomes a wide, easy toggle target.
 */
export const SidebarRail = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function SidebarRail({ className, onClick, ...rest }, ref) {
    const { toggleSidebar } = useSidebar();
    return (
      <button
        ref={ref}
        type="button"
        tabIndex={-1}
        aria-label="Toggle sidebar"
        data-sidebar="rail"
        className={cn('sidebar-rail', className)}
        onClick={(event) => {
          onClick?.(event);
          toggleSidebar();
        }}
        {...rest}
      />
    );
  },
);
