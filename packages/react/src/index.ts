// @corelithzw/react
// Public surface. Recipes in /cookbook import from here.

import './styles.css';

export * from './primitives';
export * from './blocks';
export * from './shells';
export * from './patterns';
export { cn } from './utils/cn';

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

export { useGallery } from './hooks/useGallery';
export { useToast, ToastProvider } from './hooks/useToast';
export { useRole } from './hooks/useRole';
export { useT, useI18n } from './hooks/useT';
export { useDateRange } from './hooks/useDateRange';
export { useKanban } from './hooks/useKanban';
export { useComments } from './hooks/useComments';
export { usePreferences } from './hooks/usePreferences';
export { useCommandPalette } from './hooks/useCommandPalette';
