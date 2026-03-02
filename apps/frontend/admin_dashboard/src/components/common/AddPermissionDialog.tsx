import { useState, useEffect } from "react";
import Input from "./Input";
import { createPermission } from "../../services/permissionsApi";
import { getAllRoutes, type Route } from "../../services/routesApi";
import { getAllServices, type Service } from "../../services/servicesApi";

interface AddPermissionDialogProps {
  id: string;
  clientId: string;
  onPermissionCreated: () => Promise<void>;
  onClose: () => void;
}

interface PermissionFormData {
  routeId: string;
  scope: "READ" | "WRITE" | "FULL";
  description: string;
  isActive: boolean;
}

const SCOPES = ["READ", "WRITE", "FULL"] as const;

const AddPermissionDialog = ({
  id,
  clientId,
  onPermissionCreated,
  onClose,
}: AddPermissionDialogProps) => {
  const [formData, setFormData] = useState<PermissionFormData>({
    routeId: "",
    scope: "READ",
    description: "",
    isActive: true,
  });

  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [services, setServices] = useState<Service[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [allRoutes, setAllRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load services and routes on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setDataLoading(true);
        const [servicesData, routesData] = await Promise.all([
          getAllServices(),
          getAllRoutes(),
        ]);
        setServices(servicesData);
        setAllRoutes(routesData);
      } catch (err) {
        console.error("Failed to load data:", err);
        setError("Failed to load services and routes");
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter routes when service is selected
  useEffect(() => {
    if (selectedServiceId) {
      const filteredRoutes = allRoutes.filter(
        (route) => route.serviceId === selectedServiceId
      );
      setRoutes(filteredRoutes);
      // Reset routeId when service changes
      setFormData((prev) => ({
        ...prev,
        routeId: "",
      }));
    } else {
      setRoutes([]);
      setFormData((prev) => ({
        ...prev,
        routeId: "",
      }));
    }
  }, [selectedServiceId, allRoutes]);

  const handleChange = (
    field: keyof PermissionFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!selectedServiceId.trim()) {
      setError("Service is required");
      return false;
    }
    if (!formData.routeId.trim()) {
      setError("Route is required");
      return false;
    }
    if (!formData.scope) {
      setError("Scope is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create the permission
      await createPermission({
        clientId,
        routeId: formData.routeId,
        scope: formData.scope,
        description: formData.description,
        isActive: formData.isActive,
      });

      // Call the callback to refresh data
      await onPermissionCreated();

      // Close the dialog
      const dialog = document.getElementById(id) as HTMLDialogElement | null;
      dialog?.close();

      // Reset form
      setSelectedServiceId("");
      setFormData({
        routeId: "",
        scope: "READ",
        description: "",
        isActive: true,
      });
    } catch (err) {
      console.error("Failed to create permission:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create permission"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    const dialog = document.getElementById(id) as HTMLDialogElement | null;
    dialog?.close();
    onClose();
    // Reset form
    setSelectedServiceId("");
    setFormData({
      routeId: "",
      scope: "READ",
      description: "",
      isActive: true,
    });
    setError(null);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const dialog = e.currentTarget.closest("dialog") as HTMLDialogElement | null;
    if (e.currentTarget === e.target) {
      dialog?.close();
    }
  };

  return (
    <dialog id={id} className="modal modal-bottom sm:modal-middle">
      <div className="modal-box w-full max-w-md">
        <h3 className="font-bold text-lg mb-4">Add New Permission</h3>

        <div className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text text-sm">Service *</span>
            </label>
            {dataLoading ? (
              <div className="loading loading-spinner loading-sm" />
            ) : (
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                disabled={loading}
                className="select select-bordered select-sm w-full"
              >
                <option value="">Select a service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="label">
              <span className="label-text text-sm">Route *</span>
            </label>
            {dataLoading ? (
              <div className="loading loading-spinner loading-sm" />
            ) : (
              <select
                value={formData.routeId}
                onChange={(e) => handleChange("routeId", e.target.value)}
                disabled={loading || !selectedServiceId}
                className="select select-bordered select-sm w-full"
              >
                <option value="">
                  {!selectedServiceId ? "Select a service first" : "Select a route"}
                </option>
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.name || route.exposedPath} ({route.method})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="label">
              <span className="label-text text-sm">Scope *</span>
            </label>
            <select
              value={formData.scope}
              onChange={(e) => handleChange("scope", e.target.value)}
              disabled={loading}
              className="select select-bordered select-sm w-full"
            >
              {SCOPES.map((scope) => (
                <option key={scope} value={scope}>
                  {scope}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Description"
            placeholder="Optional description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            disabled={loading}
          />

          <label className="label">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={formData.isActive}
              onChange={(e) => handleChange("isActive", e.target.checked)}
              disabled={loading}
            />
            <span className="label-text text-sm">Is Active</span>
          </label>

          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading || dataLoading}
            >
              {loading ? "Creating..." : "Create Permission"}
            </button>
          </div>
        </div>
      </div>
      <div className="modal-backdrop" onClick={handleBackdropClick} />
    </dialog>
  );
};

export default AddPermissionDialog;
