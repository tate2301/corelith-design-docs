"use client";

import { createContext, useContext, forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn';
import { EmptyState } from '../blocks/EmptyState';

export interface RoleContextValue {
  role?: string;
  roles?: string[];
  hasRole?: (role: string | string[]) => boolean;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function useRole() {
  const ctx = useContext(RoleContext);
  return (
    ctx || {
      role: undefined,
      roles: [],
      hasRole: () => true,
    }
  );
}

export interface RoleProviderProps {
  role?: string;
  roles?: string[];
  children?: ReactNode;
}

export function RoleProvider({ role, roles, children }: RoleProviderProps) {
  const userRoles = roles || (role ? [role] : []);

  const hasRole = (required: string | string[]) => {
    const reqArray = Array.isArray(required) ? required : [required];
    return reqArray.some((r) => userRoles.includes(r));
  };

  return <RoleContext.Provider value={{ role, roles: userRoles, hasRole }}>{children}</RoleContext.Provider>;
}

export interface RequireRoleProps extends HTMLAttributes<HTMLDivElement> {
  role: string | string[];
  fallback?: ReactNode;
  children?: ReactNode;
}

export const RequireRole = forwardRef<HTMLDivElement, RequireRoleProps>(function RequireRole(
  { role, fallback, children, className, ...props },
  ref,
) {
  const { hasRole } = useRole();
  const allowed = hasRole ? hasRole(role) : true;

  if (!allowed) {
    if (fallback !== undefined) return <>{fallback}</>;
    return (
      <div ref={ref} className={cn('x-require-role', className)} {...props}>
        <EmptyState
          title="Access Denied"
          description="You do not have permission to view this content."
        />
      </div>
    );
  }

  return <div ref={ref} className={cn('x-require-role', className)} {...props}>{children}</div>;
});
