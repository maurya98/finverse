import { useState } from "react";
import Input from "./Input";
import { createRoute } from "../../services/routesApi";

interface AddRouteDialogProps {
  id: string;
  serviceId: string;
  onRouteCreated: () => Promise<void>;
  onClose: () => void;
}

interface RouteFormData {
  name: string;
  method: string;
  actualPath: string;
  exposedPath: string;
  description: string;
}

const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"];

const AddRouteDialog = ({
  id,
  serviceId,
  onRouteCreated,
  onClose,
}: AddRouteDialogProps) => {
  const [formData, setFormData] = useState<RouteFormData>({
    name: "",
    method: "GET",
    actualPath: "",
    exposedPath: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    field: keyof RouteFormData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError("Route name is required");
      return false;
    }
    if (!formData.actualPath.trim()) {
      setError("Actual path is required");
      return false;
    }
    if (!formData.exposedPath.trim()) {
      setError("Exposed path is required");
      return false;
    }
    if (!formData.method) {
      setError("HTTP method is required");
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

      // Create the route
      await createRoute({
        serviceId,
        name: formData.name,
        method: formData.method,
        actualPath: formData.actualPath,
        exposedPath: formData.exposedPath,
        description: formData.description,
      });

      // Call the callback to refresh data
      await onRouteCreated();

      // Close the dialog
      const dialog = document.getElementById(id) as HTMLDialogElement | null;
      dialog?.close();

      // Reset form
      setFormData({
        name: "",
        method: "GET",
        actualPath: "",
        exposedPath: "",
        description: "",
      });
    } catch (err) {
      console.error("Failed to create route:", err);
      setError(err instanceof Error ? err.message : "Failed to create route");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    const dialog = document.getElementById(id) as HTMLDialogElement | null;
    dialog?.close();
    onClose();
    // Reset form
    setFormData({
      name: "",
      method: "GET",
      actualPath: "",
      exposedPath: "",
      description: "",
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
        <h3 className="font-bold text-lg mb-4">Add New Route</h3>

        <div className="space-y-4">
          <Input
            label="Route Name"
            placeholder="E.g: Get User"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            disabled={loading}
          />

          <div>
            <label className="label">
              <span className="label-text text-sm">HTTP Method</span>
            </label>
            <select
              value={formData.method}
              onChange={(e) => handleChange("method", e.target.value)}
              disabled={loading}
              className="select select-bordered select-sm w-full"
            >
              {HTTP_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Exposed Path"
            placeholder="E.g: /users/:id"
            value={formData.exposedPath}
            onChange={(e) => handleChange("exposedPath", e.target.value)}
            disabled={loading}
          />

          <Input
            label="Actual Path"
            placeholder="E.g: /api/v1/users/:id"
            value={formData.actualPath}
            onChange={(e) => handleChange("actualPath", e.target.value)}
            disabled={loading}
          />

          <Input
            label="Description"
            placeholder="Optional description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            disabled={loading}
          />

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
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Route"}
            </button>
          </div>
        </div>
      </div>
      <div className="modal-backdrop" onClick={handleBackdropClick} />
    </dialog>
  );
};

export default AddRouteDialog;
