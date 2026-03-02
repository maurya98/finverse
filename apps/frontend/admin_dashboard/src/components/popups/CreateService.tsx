import { useState } from "react";
import { XIcon } from "lucide-react";
import Input from "../common/Input";
import { createService } from "../../services/servicesApi";

const CreateService = () => {
  const [formData, setFormData] = useState({
    name: "",
    baseUrl: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    const dialog = document.getElementById("create-service-modal") as HTMLDialogElement;
    if (dialog) {
      dialog.close();
      // Reset form on close
      setFormData({ name: "", baseUrl: "", description: "" });
      setError(null);
    }
  }

  async function handleSave() {
    try {
      setError(null);

      if (!formData.name.trim()) {
        setError("Service name is required");
        return;
      }

      if (!formData.baseUrl.trim()) {
        setError("Base URL is required");
        return;
      }

      setSaving(true);
      
      await createService({
        name: formData.name,
        baseUrl: formData.baseUrl,
        description: formData.description,
      });

      // Success - close dialog and trigger page refresh
      const dialog = document.getElementById("create-service-modal") as HTMLDialogElement;
      if (dialog) {
        dialog.close();
        setFormData({ name: "", baseUrl: "", description: "" });
        // Trigger a refresh by reloading or emitting an event
        window.location.reload();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create service";
      setError(message);
      console.error("Failed to create service:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <dialog id="create-service-modal" className="modal">
      <div className="modal-box">
        <div className="flex gap-4 w-full justify-between mb-4 items-center">
          <h3 className="font-bold text-lg">Create new Service</h3>
          <button className="btn btn-ghost btn-square" onClick={handleClose} disabled={saving}>
            <XIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {/* Service Name */}
          <Input
            label="Service Name"
            isRequired
            type="text"
            placeholder="E.g: Mobile Service"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={saving}
          />

          {/* Base URL */}
          <Input
            label="Base URL"
            isRequired
            type="url"
            placeholder="E.g: http://localhost:4000"
            value={formData.baseUrl}
            onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
            disabled={saving}
          />

          {/* Service Description */}
          <Input
            label="Service Description"
            type="text"
            isTextarea
            rows={3}
            placeholder="E.g: This is a mobile service which is going to access the internal APIs."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            disabled={saving}
          />

          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}
        </div>
        <div className="modal-action">
          <button 
            className="btn" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default CreateService;
