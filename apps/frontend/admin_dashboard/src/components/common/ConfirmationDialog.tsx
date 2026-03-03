interface ConfirmationDialogProps {
  id: string;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "error" | "warning" | "success";
  onConfirm?: () => void;
  onCancel?: () => void;
}

const ConfirmationDialog = ({
  id,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "error",
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) => {
  const handleConfirm = () => {
    onConfirm?.();
    const dialog = document.getElementById(id) as HTMLDialogElement | null;
    dialog?.close();
  };

  const handleCancel = () => {
    onCancel?.();
    const dialog = document.getElementById(id) as HTMLDialogElement | null;
    dialog?.close();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const dialog = e.currentTarget.closest("dialog") as HTMLDialogElement | null;
    if (e.currentTarget === e.target) {
      dialog?.close();
    }
  };

  return (
    <dialog id={id} className="modal modal-bottom sm:modal-middle">
      <div className="modal-box">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="py-4">{message}</p>
        <div className="modal-action">
          <div className="flex gap-2">
            <button type="button" className="btn btn-ghost" onClick={handleCancel}>
              {cancelText}
            </button>
            <button
              type="button"
              className={`btn ${
                confirmVariant === "error"
                  ? "btn-error"
                  : confirmVariant === "warning"
                    ? "btn-warning"
                    : "btn-success"
              }`}
              onClick={handleConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
      <div className="modal-backdrop" onClick={handleBackdropClick} />
    </dialog>
  );
};

export default ConfirmationDialog;
