import { createContext, useContext, type ReactNode } from "react";
import type { RepositoryMemberRole } from "../services/api";

export type RepoRoleContextValue = {
  repositoryId: string | null;
  currentUserRole: RepositoryMemberRole | null;
};

const RepoRoleContext = createContext<RepoRoleContextValue | null>(null);

export function RepoRoleProvider({
  repositoryId,
  currentUserRole,
  children,
}: {
  repositoryId: string | null;
  currentUserRole: RepositoryMemberRole | null;
  children: ReactNode;
}) {
  const value: RepoRoleContextValue = { repositoryId, currentUserRole };
  return (
    <RepoRoleContext.Provider value={value}>{children}</RepoRoleContext.Provider>
  );
}

export function useRepoRole(): RepoRoleContextValue {
  const ctx = useContext(RepoRoleContext);
  return ctx ?? { repositoryId: null, currentUserRole: null };
}
