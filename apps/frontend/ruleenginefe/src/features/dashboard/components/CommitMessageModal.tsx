import { useState, useEffect, useRef } from "react";
import "./CommitMessageModal.css";

type CommitMessageModalProps = {
  onConfirm: (message: string) => void;
  onClose: () => void;
  isCommitting?: boolean;
  hasUnsavedChanges?: boolean;
};

export function CommitMessageModal({
  onConfirm,
  onClose,
  isCommitting = false,
  hasUnsavedChanges = false,
}: CommitMessageModalProps) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) {
      setError("Commit message is required");
      return;
    }
    setError(null);
    onConfirm(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };

  return (
    <div className="commit-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="commit-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="commit-modal-title"
      >
        <h2 id="commit-modal-title" className="commit-modal-title">
          Commit changes
        </h2>
        {hasUnsavedChanges && (
          <p className="commit-modal-warning">
            You have unsaved changes. Save your current file first, or it won&apos;t be included in the commit.
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            className="commit-modal-textarea"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Enter commit message..."
            rows={3}
            disabled={isCommitting}
            aria-invalid={!!error}
            aria-describedby={error ? "commit-modal-error" : undefined}
          />
          {error && (
            <p id="commit-modal-error" className="commit-modal-error">
              {error}
            </p>
          )}
          <div className="commit-modal-actions">
            <button
              type="button"
              className="commit-modal-btn secondary"
              onClick={onClose}
              disabled={isCommitting}
            >
              Cancel
            </button>
            <button type="submit" className="commit-modal-btn primary" disabled={isCommitting}>
              {isCommitting ? "Committing…" : "Commit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
