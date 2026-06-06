// @tate2301/corelith — v0.1.2
// Public surface. Recipes in /cookbook import from here.

import './styles.css';

// ── Primitives (existing) ─────────────────────────────────────
export { Button } from './components/Button';
export type { ButtonProps, ButtonVariant, ButtonTone, ButtonSize } from './components/Button';

export { Field, useFieldContext } from './components/Field';
export type { FieldProps } from './components/Field';

export { Input } from './components/Input';
export type { InputProps } from './components/Input';

export { InputOtp } from './components/InputOtp';
export type { InputOtpProps, InputOtpHandle } from './components/InputOtp';

export { Alert } from './components/Alert';
export type { AlertProps, AlertTone } from './components/Alert';

export { Stack } from './components/Stack';
export type { StackProps, StackDirection, StackGap, StackAlign, StackJustify } from './components/Stack';

export { Form } from './components/Form';
export type { FormProps } from './components/Form';

export { Toast, ToastProvider, useToast } from './components/Toast';
export type { ToastInput, ToastItem, ToastTone, ToastProviderProps } from './components/Toast';

export { BottomSheet } from './components/BottomSheet';
export type { BottomSheetProps } from './components/BottomSheet';

export { RowCard } from './components/RowCard';
export type { RowCardProps, RowCardDeltaTone } from './components/RowCard';

export { FilterChips } from './components/FilterChips';
export type { FilterChipsProps, FilterChipOption } from './components/FilterChips';

export { AuthShell } from './components/AuthShell';
export type { AuthShellProps, AuthShellBrandProps, AuthShellCardProps } from './components/AuthShell';

// ── Primitives (new in 0.1.0) ─────────────────────────────────
export { Checkbox } from './components/Checkbox';
export type { CheckboxProps } from './components/Checkbox';

export { Radio, RadioGroup } from './components/Radio';
export type { RadioProps, RadioGroupProps } from './components/Radio';

export { Switch } from './components/Switch';
export type { SwitchProps } from './components/Switch';

export { Select } from './components/Select';
export type { SelectProps, SelectOption } from './components/Select';

export { Combobox } from './components/Combobox';
export type { ComboboxProps, ComboboxItem } from './components/Combobox';

export { Badge } from './components/Badge';
export type { BadgeProps, BadgeTone } from './components/Badge';

export { Avatar } from './components/Avatar';
export type { AvatarProps, AvatarSize, AvatarTone } from './components/Avatar';

export { Spinner } from './components/Spinner';
export type { SpinnerProps } from './components/Spinner';

export { Skeleton } from './components/Skeleton';
export type { SkeletonProps } from './components/Skeleton';

export { Tooltip } from './components/Tooltip';
export type { TooltipProps, TooltipPlacement } from './components/Tooltip';

export { Kbd } from './components/Kbd';
export type { KbdProps } from './components/Kbd';

export { Popover } from './components/Popover';
export type { PopoverProps } from './components/Popover';

export { Drawer } from './components/Drawer';
export type { DrawerProps } from './components/Drawer';

export { Tabs } from './components/Tabs';
export type { TabsProps, TabsListProps, TabsTabProps, TabsPanelProps } from './components/Tabs';

export { Stepper } from './components/Stepper';
export type { StepperProps, StepperStepProps, StepperStepState } from './components/Stepper';

export { RoleSwitcher } from './components/RoleSwitcher';
export type { RoleSwitcherProps, RoleSwitcherOption } from './components/RoleSwitcher';

export { Pagination } from './components/Pagination';
export type { PaginationProps } from './components/Pagination';

export { SaveBar } from './components/SaveBar';
export type { SaveBarProps } from './components/SaveBar';

export { Grabber } from './components/Grabber';
export type { GrabberProps } from './components/Grabber';

export { EmptyState } from './components/EmptyState';
export type { EmptyStateProps } from './components/EmptyState';

export { Menu } from './components/Menu';
export type { MenuProps, MenuItemProps, MenuLabelProps } from './components/Menu';

export { CommandPalette } from './components/CommandPalette';
export type { CommandPaletteProps, CommandItem } from './components/CommandPalette';

// ── Blocks ────────────────────────────────────────────────────
export { BottomTabs } from './components/BottomTabs';
export type { BottomTabsProps, BottomTabItem } from './components/BottomTabs';

export { StatHero } from './components/StatHero';
export type { StatHeroProps, StatHeroSecondary } from './components/StatHero';

export { StatCard } from './components/StatCard';
export type { StatCardProps, StatCardTone, StatCardDeltaTone } from './components/StatCard';

export { DayList } from './components/DayList';
export type { DayListProps, DayListRow, DayListTone } from './components/DayList';

export { PageHeader } from './components/PageHeader';
export type { PageHeaderProps } from './components/PageHeader';

// ── Patterns ──────────────────────────────────────────────────
export { AppShell } from './components/AppShell';
export type {
  AppShellProps,
  AppShellSidebarProps,
  AppShellMainProps,
  AppShellTopBarProps,
} from './components/AppShell';

export { DataTable } from './components/DataTable';
export type {
  DataTableProps,
  DataTableColumn,
  DataTableSortState,
  DataTableSortDir,
} from './components/DataTable';

export { Modal } from './components/Modal';
export type { ModalProps } from './components/Modal';

export { Dialog } from './components/Dialog';
export type { DialogProps } from './components/Dialog';

// ── Primitives & blocks (new in 0.1.1) ───────────────────────
export { Card } from './components/Card';
export type {
  CardProps,
  CardHeaderProps,
  CardTitleProps,
  CardBodyProps,
  CardFooterProps,
} from './components/Card';

export { Calendar } from './components/Calendar';
export type { CalendarProps } from './components/Calendar';

export { Chart } from './components/Chart';
export type {
  ChartPoint,
  ChartCategoricalDatum,
  ChartBaseProps,
  ChartLineProps,
  ChartBarProps,
  ChartDonutProps,
  ChartSparklineProps,
} from './components/Chart';

export { Checklist } from './components/Checklist';
export type { ChecklistProps, ChecklistItemProps } from './components/Checklist';

export { Meter } from './components/Meter';
export type { MeterProps, MeterTone } from './components/Meter';

export { Progress } from './components/Progress';
export type { ProgressProps } from './components/Progress';

export { SegmentedControl } from './components/SegmentedControl';
export type { SegmentedControlProps, SegmentedControlOption } from './components/SegmentedControl';

export { MobileShell, Tab, NavItem } from './components/MobileShell';
export type {
  MobileShellProps,
  MobileShellHeaderProps,
  MobileShellBodyProps,
  MobileShellTabProps,
  MobileShellNavItemProps,
} from './components/MobileShell';

export { InlineEdit } from './components/InlineEdit';
export type { InlineEditProps } from './components/InlineEdit';

export { TextArea } from './components/TextArea';
export type { TextAreaProps } from './components/TextArea';

export { DataToolbar } from './components/DataToolbar';
export type {
  DataToolbarProps,
  DataToolbarSearchProps,
  DataToolbarFiltersProps,
  DataToolbarActionsProps,
} from './components/DataToolbar';

export { I18nProvider, useI18n, useT } from './components/I18nProvider';
export type {
  I18nProviderProps,
  I18nContextValue,
  I18nLocale,
  I18nMessages,
} from './components/I18nProvider';

export { LocalePicker } from './components/LocalePicker';
export type { LocalePickerProps } from './components/LocalePicker';

export { Lightbox, useGallery } from './components/Lightbox';
export type { LightboxProps, LightboxImage, UseGalleryResult } from './components/Lightbox';

export { FileUpload } from './components/FileUpload';
export type { FileUploadProps } from './components/FileUpload';

export { KpiGrid } from './components/KpiGrid';
export type { KpiGridProps } from './components/KpiGrid';

// `Stat` is an alias for `StatCard` — recipes use both names.
export { StatCard as Stat } from './components/StatCard';

// ── Hooks ─────────────────────────────────────────────────────
export { useInterval } from './hooks/useInterval';
export type { UseIntervalOptions } from './hooks/useInterval';

export { useUrlState } from './hooks/useUrlState';

export { useOptimistic } from './hooks/useOptimistic';
export type { UseOptimisticResult } from './hooks/useOptimistic';

export { useMatchMedia } from './hooks/useMatchMedia';
export { useMediaQuery } from './hooks/useMediaQuery';

export { useUpload } from './hooks/useUpload';
export type { UploadStatus, UploadState, UploadOptions } from './hooks/useUpload';
