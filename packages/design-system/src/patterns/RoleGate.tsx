import { type ReactNode } from 'react';

export interface RoleGateProps<Role extends string = string> {
  /** Roles permitted to see the children. */
  allow: ReadonlyArray<Role>;
  /** The current user's role, or roles (when a user holds several). */
  role: Role | ReadonlyArray<Role> | null | undefined;
  /** Rendered when the role is not permitted. @default null */
  fallback?: ReactNode;
  /**
   * Require ALL of `allow` (instead of any). Only meaningful when `role` is an
   * array. @default false (any-of)
   */
  requireAll?: boolean;
  /** Protected content. */
  children: ReactNode;
}

/** Pure predicate — handy for imperative checks (button disabling, etc.). */
export function hasRole<Role extends string = string>(
  allow: ReadonlyArray<Role>,
  role: Role | ReadonlyArray<Role> | null | undefined,
  requireAll = false,
): boolean {
  if (role == null || allow.length === 0) return false;
  const held = Array.isArray(role) ? role : [role as Role];
  return requireAll
    ? allow.every((a) => held.includes(a))
    : allow.some((a) => held.includes(a));
}

/**
 * RoleGate — conditionally renders its children based on the current role.
 * A thin, dependency-free authorization guard for UI; not a security boundary
 * (always enforce on the server too).
 *
 * @example
 * ```tsx
 * type Role = 'admin' | 'accountant' | 'viewer';
 * const currentRole: Role = useCurrentRole();
 *
 * <RoleGate<Role> allow={['admin']} role={currentRole} fallback={<ReadOnlyNotice />}>
 *   <Button variant="danger">Delete supplier</Button>
 * </RoleGate>
 *
 * // Multi-role user, require any of the listed roles:
 * <RoleGate allow={['admin', 'accountant']} role={['accountant']}>
 *   <RecordPaymentButton />
 * </RoleGate>
 * ```
 */
export function RoleGate<Role extends string = string>({
  allow,
  role,
  fallback = null,
  requireAll = false,
  children,
}: RoleGateProps<Role>) {
  return <>{hasRole(allow, role, requireAll) ? children : fallback}</>;
}
