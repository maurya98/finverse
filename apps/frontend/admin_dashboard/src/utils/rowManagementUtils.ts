import type { ClientPermission, ServiceRoute } from "../types/table";

// Generate a unique ID for new rows
export const generateId = (prefix: string, existingIds: string[]): string => {
  const numbers = existingIds
    .filter((id) => id.startsWith(prefix))
    .map((id) => {
      const num = parseInt(id.replace(prefix, ""), 10);
      return isNaN(num) ? 0 : num;
    });
  const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
  return `${prefix}${maxNum + 1}`;
};

// Create a default empty ClientPermission row (no ID - will be assigned after backend creation)
export const createEmptyClientPermission = (id?: string): ClientPermission => ({
  id,
  routeUrl: "",
  routeMethod: "",
  scope: "READ",
  routeId: "",
  description: "",
  isActive: true,
});

// Create a default empty ServiceRoute row (no ID - will be assigned after backend creation)
export const createEmptyServiceRoute = (id?: string): ServiceRoute => ({
  id,
  name: "",
  description: "",
  isActive: true,
  exposedPath: "",
  actualPath: "",
  method: "",
});

// Check if a ClientPermission row is populated (has required fields)
export const isClientPermissionPopulated = (perm: ClientPermission): boolean => {
  return perm.routeUrl.trim() !== "" && perm.routeMethod.trim() !== "";
};

// Check if a ClientPermission is a new empty row (no ID and no data)
export const isNewEmptyClientPermission = (perm: ClientPermission): boolean => {
  return !perm.id && !isClientPermissionPopulated(perm);
};

// Check if a ServiceRoute row is populated (has required fields)
export const isServiceRoutePopulated = (route: ServiceRoute): boolean => {
  return (
    route.exposedPath.trim() !== "" &&
    route.method.trim() !== ""
  );
};

// Check if a ServiceRoute is a new empty row (no ID and no data)
export const isNewEmptyServiceRoute = (route: ServiceRoute): boolean => {
  return !route.id && !isServiceRoutePopulated(route);
};

// Validate all ClientPermission rows before saving
export const validateClientPermissions = (permissions: ClientPermission[]): string | null => {
  for (const perm of permissions) {
    // Skip empty rows
    if (!isClientPermissionPopulated(perm)) {
      continue;
    }
    // Check for required fields
    if (!perm.routeUrl.trim()) {
      return "All Route URLs must be filled";
    }
    if (!perm.routeMethod.trim()) {
      return "All Route Methods must be filled";
    }
  }
  return null;
};

// Validate all ServiceRoute rows before saving
export const validateServiceRoutes = (routes: ServiceRoute[]): string | null => {
  for (const route of routes) {
    // Skip empty rows
    if (!isServiceRoutePopulated(route)) {
      continue;
    }
    // Check for required fields
    if (!route.exposedPath.trim()) {
      return "All Exposed Paths must be filled";
    }
    if (!route.method.trim()) {
      return "All Methods must be filled";
    }
  }
  return null;
};

// Clean up empty rows for saving (remove fully empty rows)
export const cleanupClientPermissions = (permissions: ClientPermission[]): ClientPermission[] => {
  return permissions.filter((perm) => isClientPermissionPopulated(perm));
};

// Clean up empty rows for saving (remove fully empty rows)
export const cleanupServiceRoutes = (routes: ServiceRoute[]): ServiceRoute[] => {
  return routes.filter((route) => isServiceRoutePopulated(route));
};
