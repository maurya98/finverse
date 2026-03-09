import { useAuth } from "../contexts/AuthContext";

const ROLE_PERMISSIONS: Record<string, readonly string[]> = {
  ADMIN:      ["read", "write", "update", "delete"],
  MAINTAINER: ["read", "write", "update"],
  USER:       ["read"],
};

/**
 * Returns boolean flags for what the current user is allowed to do,
 * derived from the backend role-permission matrix:
 *   ADMIN      → read + write + update + delete
 *   MAINTAINER → read + write + update
 *   USER       → read only
 */
export const usePermission = () => {
  const { user } = useAuth();
  const perms = ROLE_PERMISSIONS[(user?.role ?? "USER").toUpperCase()] ?? ROLE_PERMISSIONS.USER;

  return {
    canRead:   perms.includes("read"),
    canWrite:  perms.includes("write"),
    canUpdate: perms.includes("update"),
    canDelete: perms.includes("delete"),
  };
};
