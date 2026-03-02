import { useState } from "react";
import { CopyIcon, CheckIcon } from "lucide-react";

interface RotateKeyDialogProps {
  id: string;
  applicationId: string;
  applicationName: string;
}

const RotateKeyDialog = ({ id, applicationId, applicationName }: RotateKeyDialogProps) => {
  // Static key for now - will come from backend later
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRegenerateKey = () => {
    // For now, generate a static key - replace with backend call later
    const newKey = `app_${applicationId}_${Math.random().toString(36).substr(2, 32)}`;
    setGeneratedKey(newKey);
    setCopied(false);
  };

  const handleCopyKey = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleClose = () => {
    setGeneratedKey(null);
    setCopied(false);
    const dialog = document.getElementById(id) as HTMLDialogElement;
    dialog?.close();
  };

  return (
    <dialog id={id} className="modal modal-middle">
      <div className="modal-box w-full max-w-md">
        <h3 className="font-bold text-lg mb-2">Rotate Key</h3>
        <p className="text-sm text-base-content/70 mb-4">
          Generate a new API key for <span className="font-semibold">{applicationName}</span>
        </p>

        <div className="divider my-2" />

        {generatedKey ? (
          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-sm">Generated Key</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedKey}
                  className="input input-bordered input-sm flex-1 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className={`btn btn-sm ${copied ? "btn-success" : "btn-ghost"}`}
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    <CopyIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
              <label className="label">
                <span className="label-text-alt text-xs text-warning">
                  ⚠️ Store this key safely. You won't be able to see it again.
                </span>
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleRegenerateKey}
                className="btn btn-sm btn-outline flex-1"
              >
                Generate Again
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-sm btn-primary flex-1"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-base-content/70">
              A new key will be generated and replace the existing one. The old key will no longer work.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleRegenerateKey}
                className="btn btn-sm btn-primary flex-1"
              >
                Generate New Key
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-sm btn-ghost flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={handleClose}>
          close
        </button>
      </form>
    </dialog>
  );
};

export default RotateKeyDialog;
