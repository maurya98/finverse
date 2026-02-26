import type { ReactNode } from "react";
import { useRepoRole } from "../contexts/RepoRoleContext";
import type { RepositoryMemberRole } from "../services/api";

export interface CanProps {
  oneOf: RepositoryMemberRole[];
  role?: RepositoryMemberRole | null;
  repositoryId?: string | null;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renders children only when the current user has one of the allowed roles.
 * Use `role` when the parent already has it (e.g. from list); otherwise uses RepoRoleContext or pass repositoryId to resolve.
 */
export function Can({ oneOf, role: roleProp, repositoryId: _repoId, children, fallback = null }: CanProps) {
  const { currentUserRole } = useRepoRole();
  const role = roleProp ?? currentUserRole;
  const allowed = role != null && oneOf.includes(role);
  return allowed ? <>{children}</> : <>{fallback}</>;
}
