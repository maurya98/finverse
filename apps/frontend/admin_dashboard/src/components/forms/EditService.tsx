import { useState, useEffect } from "react";
import { serviceRouteColumns } from "../../data/tableColumns";
import { type ServiceRoute } from "../../types/table";
import { httpMethodColorConfig } from "../../data/cellColorConfigs";
import {
  validateServiceRoutes,
  cleanupServiceRoutes,
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
import { getServiceById, updateService } from "../../services/servicesApi";
import {
  getAllRoutes,
  createRoute,
  updateRoute,
  deleteRoute,
  type Route,
} from "../../services/routesApi";

import Input from "../common/Input";
import Table from "../common/Table";
import AddRouteDialog from "../common/AddRouteDialog";
import ConfirmationDialog from "../common/ConfirmationDialog";
import { Trash2Icon } from "lucide-react";

interface EditServiceProps {
  itemId: string;
  isEditable: boolean;
}

interface ServiceFormData {
  name: string;
  description: string;
  baseUrl: string;
  isActive: boolean;
}

const ROUTE_FILTER_CONFIG: TableFilterConfig = {
  searchableFields: ["exposedPath", "actualPath", "description"],
  sortableFields: ["exposedPath", "method"],
  filterableFields: ["method", "isActive"],
};

const EditService = ({ itemId, isEditable }: EditServiceProps) => {
  const [formData, setFormData] = useState<ServiceFormData>({
    name: "",
    description: "",
    baseUrl: "",
    isActive: true,
  });

  const [routes, setRoutes] = useState<ServiceRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [routeToDelete, setRouteToDelete] = useState<ServiceRoute | null>(null);

  // Load service data on mount
  useEffect(() => {
    const loadService = async () => {
      try {
        setLoading(true);
        const service = await getServiceById(itemId);

        setFormData({
          name: service.name,
          description: service.description,
          baseUrl: service.baseUrl,
          isActive: service.isActive,
        });

        // Load routes for this service
        const allRoutes = await getAllRoutes();
        const serviceRoutes = allRoutes.filter(
          (route: Route) => route.serviceId === itemId,
        ) as ServiceRoute[];
        setRoutes(serviceRoutes);
      } catch (error) {
        console.error("Failed to load service:", error);
        setValidationError("Failed to load service data");
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [itemId]);

  const {
    filteredData: filteredRoutes,
    filterState,
    setSearchQuery,
    setSortField,
    setColumnFilter,
    clearFilters,
  } = useTableFilters(routes, ROUTE_FILTER_CONFIG);

  // When a row is populated, add a new empty row if one doesn't exist
  const openAddRouteDialog = () => {
    const dialog = document.getElementById(
      "add-route-dialog",
    ) as HTMLDialogElement | null;
    dialog?.showModal();
  };

  const refreshRoutes = async () => {
    try {
      const allRoutes = await getAllRoutes();
      const serviceRoutes = allRoutes.filter(
        (route: Route) => route.serviceId === itemId,
      ) as ServiceRoute[];
      setRoutes(serviceRoutes);
    } catch (error) {
      console.error("Failed to refresh routes:", error);
    }
  };

  const handleDeleteRoute = async () => {
    if (!routeToDelete?.id) return;

    try {
      setSaving(true);
      await deleteRoute(routeToDelete.id);
      await refreshRoutes();
      setRouteToDelete(null);
    } catch (error) {
      console.error("Failed to delete route:", error);
      setValidationError(
        error instanceof Error ? error.message : "Failed to delete route",
      );
    } finally {
      setSaving(false);
    }
  };

  const openDeleteConfirmation = (route: ServiceRoute) => {
    setRouteToDelete(route);
    const dialog = document.getElementById(
      "delete-route-dialog",
    ) as HTMLDialogElement | null;
    dialog?.showModal();
  };

  async function handleUpdate() {
    setValidationError(null);
    const error = validateServiceRoutes(routes);
    if (error) {
      setValidationError(error);
      return;
    }

    try {
      setSaving(true);

      // Update service
      await updateService(itemId, {
        name: formData.name,
        description: formData.description,
        baseUrl: formData.baseUrl,
        isActive: formData.isActive,
      });

      // Handle routes
      const cleanedRoutes = cleanupServiceRoutes(routes);

      // Separate new and existing routes by whether they have an ID
      const newRoutes = cleanedRoutes.filter((r) => !r.id);
      const existingRoutes = cleanedRoutes.filter((r) => r.id);

      console.log("Routes to create (new):", newRoutes);
      console.log("Routes to update (existing):", existingRoutes);
      console.log("Service ID:", itemId);

      // Create new routes via POST endpoint (backend generates IDs)
      for (const route of newRoutes) {
        if (
          route.name &&
          route.method &&
          route.actualPath &&
          route.exposedPath
        ) {
          try {
            console.log("Creating route:", route);
            const response = await createRoute({
              serviceId: itemId,
              name: route.name,
              method: route.method,
              actualPath: route.actualPath,
              exposedPath: route.exposedPath,
              description: route.description || "",
            });
            console.log("Route created:", response);
          } catch (err) {
            console.error("Failed to create route:", err);
            throw err;
          }
        }
      }

      // Update existing routes via PUT endpoint (upsert)
      for (const route of existingRoutes) {
        if (route.id) {
          try {
            console.log("Updating route:", route);
            await updateRoute(route.id, {
              serviceId: itemId,
              name: route.name,
              method: route.method,
              actualPath: route.actualPath,
              exposedPath: route.exposedPath,
              description: route.description,
              isActive: route.isActive,
            });
            console.log("Route updated");
          } catch (err) {
            console.error("Failed to update route:", err);
            throw err;
          }
        }
      }

      // Fetch fresh data from backend and update state
      console.log("Fetching routes for service:", itemId);
      const allRoutes = await getAllRoutes();
      console.log("All routes from backend:", allRoutes);
      const serviceRoutes = allRoutes.filter(
        (route: Route) => route.serviceId === itemId,
      ) as ServiceRoute[];
      console.log("Filtered service routes:", serviceRoutes);
      setRoutes(serviceRoutes);

      setValidationError(null);
      alert("Service updated successfully!");
    } catch (error) {
      console.error("Failed to update service:", error);
      setValidationError(
        error instanceof Error ? error.message : "Failed to update service",
      );
    } finally {
      setSaving(false);
    }
  }

  const handleFormChange = (
    field: keyof ServiceFormData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRouteChange = (
    routeId: string | undefined,
    _rowIndex: number,
    field: string,
    value: string | boolean,
  ) => {
    setRoutes((prev) =>
      prev.map((route) =>
        route.id === routeId ? { ...route, [field]: value } : route,
      ),
    );
  };

  const renderRouteCell = (
    row: ServiceRoute,
    col: (typeof serviceRouteColumns)[0],
    rowIndex: number,
  ) => {
    // Show delete button on last column if editable
    if (col.key === "isActive" && isEditable) {
      return (
        <div className="flex gap-2 items-center">
          {generateEditableCellRenderer(
            row,
            col,
            handleRouteChange,
            EDITABLE_CELL_CONFIGS.serviceRoute,
            rowIndex,
          )}
          <button
            type="button"
            className="btn btn-xs btn-square btn-error"
            onClick={() => openDeleteConfirmation(row)}
            disabled={saving}
            title="Delete route"
          >
            <Trash2Icon className="h-4 w-4" />
          </button>
        </div>
      );
    }
    return generateEditableCellRenderer(
      row,
      col,
      handleRouteChange,
      EDITABLE_CELL_CONFIGS.serviceRoute,
      rowIndex,
    );
  };

  return (
    <div className="p-4 bg-base-300 rounded-xl flex flex-col gap-4">
      {loading && <div className="alert alert-info loading" />}

      <Input
        label="Name"
        placeholder="E.g: User Service"
        disabled={!isEditable || loading}
        value={formData.name}
        onChange={(e) => handleFormChange("name", e.target.value)}
      />

      <Input
        label="Base URL"
        placeholder="E.g: http://localhost:4000"
        disabled={!isEditable || loading}
        value={formData.baseUrl}
        onChange={(e) => handleFormChange("baseUrl", e.target.value)}
      />

      <Input
        label="Description"
        placeholder="E.g: This service manages..."
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

      <h2 className="text-xl font-bold mb-4">Service Routes</h2>

      <TableFilterBar
        columns={serviceRouteColumns}
        data={routes}
        searchQuery={filterState.searchQuery}
        onSearchChange={setSearchQuery}
        sortField={filterState.sortField}
        sortDirection={filterState.sortDirection}
        onSortChange={setSortField}
        columnFilters={filterState.columnFilters}
        onColumnFilterChange={setColumnFilter}
        onClearFilters={clearFilters}
        searchableFields={ROUTE_FILTER_CONFIG.searchableFields}
        sortableFields={ROUTE_FILTER_CONFIG.sortableFields}
        filterableFields={ROUTE_FILTER_CONFIG.filterableFields}
      />

      <div className="rounded-xl overflow-clip">
        <Table<ServiceRoute>
          columns={serviceRouteColumns}
          data={filteredRoutes}
          rowKey="id"
          pinHeaderRows={1}
          maxHeight="300px"
          striped={true}
          hover={true}
          compact={false}
          renderCell={isEditable ? renderRouteCell : undefined}
          cellColorConfigs={[httpMethodColorConfig]}
        />
      </div>

      {isEditable && (
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={openAddRouteDialog}
          disabled={loading || saving}
        >
          + Add New Route
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

      <AddRouteDialog
        id="add-route-dialog"
        serviceId={itemId}
        onRouteCreated={refreshRoutes}
        onClose={() => {}}
      />

      <ConfirmationDialog
        id="delete-route-dialog"
        title="Delete Route"
        message={`Are you sure you want to delete the route "${routeToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="error"
        onConfirm={handleDeleteRoute}
      />
    </div>
  );
};

export default EditService;
