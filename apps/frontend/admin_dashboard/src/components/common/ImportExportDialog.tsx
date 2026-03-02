import { useState, useRef } from "react";
import { Upload, Download, Loader } from "lucide-react";
import { importExportService } from "../../services/importExportService";

type Action = "export" | "import";
type Scope = "all" | "services_routes" | "applications_permissions";

interface ImportExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ImportExportDialog = ({ isOpen, onClose }: ImportExportDialogProps) => {
  const [action, setAction] = useState<Action>("export");
  const [scope, setScope] = useState<Scope>("all");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    // Show confirmation dialog
    const message = `Are you sure you want to ${action} ${getScopeLabel(scope)}?`;
    
    if (window.confirm(message)) {
      if (action === "export") {
        handleExport();
      } else {
        handleImport();
      }
    }
  };

  const resetDialog = () => {
    setSelectedFile(null);
    setError(null);
    setSuccessMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  const handleExport = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let response;

      if (scope === "all") {
        response = await importExportService.exportAllData();
      } else if (scope === "services_routes") {
        response = await importExportService.exportServices();
      } else if (scope === "applications_permissions") {
        response = await importExportService.exportApplications();
      }

      if (response) {
        // Download the exported data
        const filename = `export-${scope}-${new Date().toISOString().split("T")[0]}.json`;
        importExportService.downloadAsFile(response.data, filename);
        setSuccessMessage("Data exported successfully!");
        // Auto close after success
        setTimeout(resetDialog, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await importExportService.importData(selectedFile);

      if (response.data.success) {
        setSuccessMessage(response.data.message);
        // Auto close after success
        setTimeout(resetDialog, 2000);
      } else {
        setError("Import failed: " + response.data.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedFile(file || null);
  };

  const getScopeLabel = (scope: Scope): string => {
    const labels: Record<Scope, string> = {
      all: "all data",
      services_routes: "services & routes",
      applications_permissions: "applications & permissions",
    };
    return labels[scope];
  };

  return (
    <>
      {isOpen && (
        <div className="modal modal-open">
          <div className="modal-box w-full max-w-md">
            <div className="flex items-center gap-2 mb-4">
              {action === "import" ? (
                <Upload className="h-5 w-5" />
              ) : (
                <Download className="h-5 w-5" />
              )}
              <h2 className="text-lg font-bold">
                {action === "import" ? "Import Data" : "Export Data"}
              </h2>
            </div>

            {/* Error Message */}
            {error && (
              <div className="alert alert-error mb-4">
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="alert alert-success mb-4">
                <span className="text-sm">{successMessage}</span>
              </div>
            )}

            {/* Action Dropdown */}
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Action</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={action}
                onChange={(e) => {
                  setAction(e.target.value as Action);
                  setSelectedFile(null);
                }}
                disabled={isLoading}
              >
                <option value="export">Export</option>
                <option value="import">Import</option>
              </select>
            </div>

            {/* Scope Dropdown */}
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Scope</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={scope}
                onChange={(e) => setScope(e.target.value as Scope)}
                disabled={isLoading}
              >
                <option value="all">All</option>
                <option value="services_routes">Services & Routes</option>
                <option value="applications_permissions">
                  Applications & Permissions
                </option>
              </select>
            </div>

            {/* File Picker for Import */}
            {action === "import" && (
              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text">Select File</span>
                </label>
                <button
                  type="button"
                  className="btn btn-outline w-full"
                  onClick={handleFileSelect}
                  disabled={isLoading}
                >
                  Choose File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.csv,.xlsx"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
                {selectedFile && (
                  <p className="text-sm text-gray-500 mt-2">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={resetDialog}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={action === "import" && !selectedFile || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                    {action === "import" ? "Importing..." : "Exporting..."}
                  </>
                ) : (
                  <>{action === "import" ? "Import" : "Export"}</>
                )}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={resetDialog} />
        </div>
      )}
    </>
  );
};

export default ImportExportDialog;
