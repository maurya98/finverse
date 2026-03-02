import { useState } from "react";
import { XIcon } from "lucide-react";
import Input from "../common/Input";
import { createApplication } from "../../services/applicationsApi";

const CreateApplication = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    const dialog = document.getElementById("create-app-modal") as HTMLDialogElement;
    if (dialog) {
      dialog.close();
      // Reset form on close
      setFormData({ name: "", description: "" });
      setError(null);
    }
  }

  async function handleSave() {
    try {
      setError(null);

      if (!formData.name.trim()) {
        setError("Application name is required");
        return;
      }

      setSaving(true);
      
      await createApplication({
        name: formData.name,
        description: formData.description,
      });

      // Success - close dialog and trigger page refresh
      const dialog = document.getElementById("create-app-modal") as HTMLDialogElement;
      if (dialog) {
        dialog.close();
        setFormData({ name: "", description: "" });
        // Trigger a refresh by reloading or emitting an event
        window.location.reload();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create application";
      setError(message);
      console.error("Failed to create application:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <dialog id="create-app-modal" className="modal">
      <div className="modal-box">
        <div className="flex gap-4 w-full justify-between mb-4 items-center">
          <h3 className="font-bold text-lg">Create new Application</h3>
          <button className="btn btn-ghost btn-square" onClick={handleClose} disabled={saving}>
            <XIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {/* Application Name */}
          <Input
            label="Application Name"
            isRequired
            type="text"
            placeholder="E.g: Mobile Application"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={saving}
          />

          {/* Application Description */}
          <Input
            label="Application Description"
            type="text"
            isTextarea
            rows={3}
            placeholder="E.g: This is a mobile application which is going to access the internal APIs."
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

export default CreateApplication;