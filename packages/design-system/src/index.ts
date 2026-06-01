// Huchu Design System — root barrel.
// Consumers can either import everything from here:
//   import { Button, PageHeader } from '@corelith/design-system';
// Or import from the more focused sub-paths:
//   import { Button } from '@corelith/design-system/primitives';
//   import { PageHeader } from '@corelith/design-system/blocks';
//   import { AppShell } from '@corelith/design-system/shells';
//   import { Modal } from '@corelith/design-system/patterns';

export * from './primitives';
export * from './blocks';
export * from './shells';
export * from './patterns';
export { cn } from './utils/cn';
