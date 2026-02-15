import { useState, useEffect, useRef } from "react";
import "./NameInputModal.css";

type NameInputModalProps = {
  title: string;
  placeholder?: string;
  submitLabel?: string;
  initialValue?: string;
  onConfirm: (name: string) => void;
  onClose: () => void;
};

export function NameInputModal({
  title,
  placeholder = "Name",
  submitLabel = "Create",
  initialValue = "",
  onConfirm,
  onClose,
}: NameInputModalProps) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Name is required");
      return;
    }
    setError(null);
    onConfirm(trimmed);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };

  return (
    <div className="name-input-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="name-input-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="name-input-modal-title"
      >
        <h2 id="name-input-modal-title" className="name-input-modal-title">
          {title}
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            className="name-input-modal-input"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-invalid={!!error}
            aria-describedby={error ? "name-input-modal-error" : undefined}
          />
          {error && (
            <p id="name-input-modal-error" className="name-input-modal-error">
              {error}
            </p>
          )}
          <div className="name-input-modal-actions">
            <button type="button" className="name-input-modal-btn secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="name-input-modal-btn primary">
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
