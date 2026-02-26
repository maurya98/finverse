import MuiDialog, { type DialogProps } from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import type { ReactNode } from "react";
import { AppButton } from "./AppButton";

export interface AppModalProps extends Omit<DialogProps, "title"> {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  submitLabel?: string;
  onSubmit?: () => void;
  submitDisabled?: boolean;
  cancelLabel?: string;
}

export function AppModal({
  open,
  onClose,
  title,
  children,
  actions,
  submitLabel,
  onSubmit,
  submitDisabled,
  cancelLabel = "Cancel",
  ...dialogProps
}: AppModalProps) {
  const resolvedActions =
    actions ??
    (submitLabel != null ? (
      <>
        <AppButton variant="secondary" onClick={onClose}>
          {cancelLabel}
        </AppButton>
        <AppButton variant="primary" onClick={onSubmit ?? onClose} disabled={submitDisabled}>
          {submitLabel}
        </AppButton>
      </>
    ) : null);

  return (
    <MuiDialog open={open} onClose={onClose} maxWidth="sm" fullWidth {...dialogProps}>
      {title != null && <DialogTitle>{title}</DialogTitle>}
      <DialogContent>{children}</DialogContent>
      {resolvedActions != null && <DialogActions sx={{ px: 2, pb: 2 }}>{resolvedActions}</DialogActions>}
    </MuiDialog>
  );
}
