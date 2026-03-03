import { useState, useEffect } from "react";
import { clientPermissionColumns } from "../../data/tableColumns";
import { type ClientPermission } from "../../types/table";
import { httpMethodColorConfig } from "../../data/cellColorConfigs";
import {
  validateClientPermissions,
  cleanupClientPermissions,
} from "../../utils/rowManagementUtils";
import {
  generateEditableCellRenderer,
  EDITABLE_CELL_CONFIGS,
} from "../../utils/editableCellRenderer";
import TableFilterBar from "../common/TableFilterBar";
import {
  useTableFilters,
  type TableFilterConfig,
} from "../../hooks/useTableFilters";
import {
  getApplicationById,
  updateApplication,
} from "../../services/applicationsApi";
import {
  getAllPermissions,
  updatePermission,
  deletePermission,
  type Permission,
} from "../../services/permissionsApi";
import { getAllRoutes, type Route } from "../../services/routesApi";

import Input from "../common/Input";
import Table from "../common/Table";
import AddPermissionDialog from "../common/AddPermissionDialog";
import ConfirmationDialog from "../common/ConfirmationDialog";
import { Trash2Icon } from "lucide-react";

interface EditApplicationProps {
  itemId: string;
  isEditable: boolean;
}

interface ApplicationFormData {
  name: string;
  description: string;
  isActive: boolean;
}

const PERMISSION_FILTER_CONFIG: TableFilterConfig = {
  searchableFields: ["routeUrl", "description"],
  sortableFields: ["routeUrl", "routeMethod"],
  filterableFields: ["routeMethod", "isActive"],
};

/**
 * Maps API Permission to ClientPermission for table display
 */
const mapApiPermissionToTablePermission = (
  apiPerm: Permission,
  routeMap: Map<string, Route>,
): ClientPermission => {
  const route = routeMap.get(apiPerm.routeId);
  return {
    id: apiPerm.id,
    routeUrl: route?.exposedPath || apiPerm.routeId,
    routeMethod: route?.method || "GET",
    scope: apiPerm.scope,
    description: apiPerm.description,
    isActive: apiPerm.isActive,
    routeId: apiPerm.routeId,
  };
};

const EditApplication = ({ itemId, isEditable }: EditApplicationProps) => {
  const [formData, setFormData] = useState<ApplicationFormData>({
    name: "",
    description: "",
    isActive: true,
  });

  const [permissions, setPermissions] = useState<ClientPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [permissionToDelete, setPermissionToDelete] =
    useState<ClientPermission | null>(null);

  // Load application data on mount
  useEffect(() => {
    const loadApplication = async () => {
      try {
        setLoading(true);
        const app = await getApplicationById(itemId);

        setFormData({
          name: app.name,
          description: app.description,
          isActive: app.isActive,
        });

        // Load all routes to create a mapping
        const allRoutes = await getAllRoutes();
        const routes = new Map<string, Route>();
        allRoutes.forEach((route) => routes.set(route.id, route));

        // Load permissions for this application
        const allPermissions = await getAllPermissions();
        const appPermissions = allPermissions.filter(
          (perm: Permission) => perm.clientId === itemId,
        );

        // Convert API permissions to table format
        const tablePermissions = appPermissions.map((perm: Permission) =>
          mapApiPermissionToTablePermission(perm, routes),
        );

        setPermissions(tablePermissions);
      } catch (error) {
        console.error("Failed to load application:", error);
        setValidationError("Failed to load application data");
      } finally {
        setLoading(false);
      }
    };

    loadApplication();
  }, [itemId]);

  const {
    filteredData: filteredPermissions,
    filterState,
    setSearchQuery,
    setSortField,
    setColumnFilter,
    clearFilters,
  } = useTableFilters(permissions, PERMISSION_FILTER_CONFIG);

  const openAddPermissionDialog = () => {
    const dialog = document.getElementById(
      "add-permission-dialog",
    ) as HTMLDialogElement | null;
    dialog?.showModal();
  };

  const refreshPermissions = async () => {
    try {
      const allRoutes = await getAllRoutes();
      const routes = new Map<string, Route>();
      allRoutes.forEach((route) => routes.set(route.id, route));

      const allPermissions = await getAllPermissions();
      const appPermissions = allPermissions.filter(
        (perm: Permission) => perm.clientId === itemId,
      );

      const tablePermissions = appPermissions.map((perm: Permission) =>
        mapApiPermissionToTablePermission(perm, routes),
      );
      setPermissions(tablePermissions);
    } catch (error) {
      console.error("Failed to refresh permissions:", error);
    }
  };

  const handleDeletePermission = async () => {
    if (!permissionToDelete?.id) return;

    try {
      setSaving(true);
      await deletePermission(permissionToDelete.id);
      await refreshPermissions();
      setPermissionToDelete(null);
    } catch (error) {
      console.error("Failed to delete permission:", error);
      setValidationError(
        error instanceof Error ? error.message : "Failed to delete permission",
      );
    } finally {
      setSaving(false);
    }
  };

  const openDeleteConfirmation = (permission: ClientPermission) => {
    setPermissionToDelete(permission);
    const dialog = document.getElementById(
      "delete-permission-dialog",
    ) as HTMLDialogElement | null;
    dialog?.showModal();
  };

  async function handleUpdate() {
    setValidationError(null);
    const error = validateClientPermissions(permissions);
    if (error) {
      setValidationError(error);
      return;
    }

    try {
      setSaving(true);

      // Update application
      await updateApplication(itemId, {
        name: formData.name,
        description: formData.description,
        isActive: formData.isActive,
      });

      // Handle permission updates (only update existing permissions that have been edited)
      const cleanedPermissions = cleanupClientPermissions(permissions);
      const existingPermissions = cleanedPermissions.filter((p) => p.id);

      // Update existing permissions
      for (const perm of existingPermissions) {
        if (perm.id) {
          await updatePermission(perm.id, {
            routeId: perm.routeId,
            scope: perm.scope,
            description: perm.description,
            isActive: perm.isActive,
          });
        }
      }

      // Fetch fresh data from backend and update state
      const allRoutes = await getAllRoutes();
      const routes = new Map<string, Route>();
      allRoutes.forEach((route) => routes.set(route.id, route));

      const allPermissions = await getAllPermissions();
      const appPermissions = allPermissions.filter(
        (perm: Permission) => perm.clientId === itemId,
      );

      const tablePermissions = appPermissions.map((perm: Permission) =>
        mapApiPermissionToTablePermission(perm, routes),
      );
      setPermissions(tablePermissions);

      setValidationError(null);
      alert("Application updated successfully!");
    } catch (error) {
      console.error("Failed to update application:", error);
      setValidationError(
        error instanceof Error ? error.message : "Failed to update application",
      );
    } finally {
      setSaving(false);
    }
  }

  const handleFormChange = (
    field: keyof ApplicationFormData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePermissionChange = (
    permissionId: string | undefined,
    _rowIndex: number,
    field: string,
    value: string | boolean,
  ) => {
    setPermissions((prev) =>
      prev.map((perm) =>
        perm.id === permissionId ? { ...perm, [field]: value } : perm,
      ),
    );
  };

  const renderPermissionCell = (
    row: ClientPermission,
    col: (typeof clientPermissionColumns)[0],
    rowIndex: number,
  ) => {
    // Show delete button on last column if editable
    if (col.key === "isActive" && isEditable) {
      return (
        <div className="flex gap-2 items-center">
          {generateEditableCellRenderer(
            row,
            col,
            handlePermissionChange,
            EDITABLE_CELL_CONFIGS.clientPermission,
            rowIndex,
          )}
          <button
            type="button"
            className="btn btn-xs btn-square btn-error"
            onClick={() => openDeleteConfirmation(row)}
            disabled={saving}
            title="Delete Permission"
          >
            <Trash2Icon className="h-4 w-4" />
          </button>
        </div>
      );
    }
    return generateEditableCellRenderer(
      row,
      col,
      handlePermissionChange,
      EDITABLE_CELL_CONFIGS.clientPermission,
      rowIndex,
    );
  };

  return (
    <div className="p-4 bg-base-300 rounded-xl flex flex-col gap-4">
      {loading && <div className="alert alert-info loading" />}

      <Input
        label="Name"
        placeholder="E.g: Mobile App"
        disabled={!isEditable || loading}
        value={formData.name}
        onChange={(e) => handleFormChange("name", e.target.value)}
      />

      <Input
        label="Description"
        placeholder="E.g: This app is for..."
        isTextarea
        rows={3}
        disabled={!isEditable || loading}
        value={formData.description}
        onChange={(e) => handleFormChange("description", e.target.value)}
      />

      <label className="label">
        <input
          type="checkbox"
          className="checkbox"
          disabled={!isEditable || loading}
          checked={formData.isActive}
          onChange={(e) => handleFormChange("isActive", e.target.checked)}
        />
        <span className="label-text text-sm">Is Active</span>
      </label>

      <div className="divider" />

      <h2 className="text-xl font-bold mb-4">Application Permissions</h2>

      <TableFilterBar
        columns={clientPermissionColumns}
        data={permissions}
        searchQuery={filterState.searchQuery}
        onSearchChange={setSearchQuery}
        sortField={filterState.sortField}
        sortDirection={filterState.sortDirection}
        onSortChange={setSortField}
        columnFilters={filterState.columnFilters}
        onColumnFilterChange={setColumnFilter}
        onClearFilters={clearFilters}
        searchableFields={PERMISSION_FILTER_CONFIG.searchableFields}
        sortableFields={PERMISSION_FILTER_CONFIG.sortableFields}
        filterableFields={PERMISSION_FILTER_CONFIG.filterableFields}
      />

      <div className="rounded-xl overflow-clip">
        <Table<ClientPermission>
          columns={clientPermissionColumns}
          data={filteredPermissions}
          rowKey="id"
          pinHeaderRows={1}
          maxHeight="300px"
          striped={true}
          hover={true}
          compact={false}
          renderCell={isEditable ? renderPermissionCell : undefined}
          cellColorConfigs={[httpMethodColorConfig]}
        />
      </div>

      {isEditable && (
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={openAddPermissionDialog}
          disabled={loading || saving}
        >
          + Add New Permission
        </button>
      )}

      <div className="divider" />

      <button
        className="btn btn-primary"
        onClick={handleUpdate}
        disabled={!isEditable || loading || saving}
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
      {validationError && (
        <div className="alert alert-error">
          <span>{validationError}</span>
        </div>
      )}

      <AddPermissionDialog
        id="add-permission-dialog"
        clientId={itemId}
        onPermissionCreated={refreshPermissions}
        onClose={() => {}}
      />

      <ConfirmationDialog
        id="delete-permission-dialog"
        title="Delete Permission"
        message={`Are you sure you want to delete this permission? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="error"
        onConfirm={handleDeletePermission}
      />
    </div>
  );
};

export default EditApplication;
