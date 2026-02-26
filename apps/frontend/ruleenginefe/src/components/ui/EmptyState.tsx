import type { ReactNode } from "react";
import { AppButton } from "./AppButton";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

export function EmptyState({ message, actionLabel, onAction, icon }: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        py: 4,
        px: 2,
        color: "text.secondary",
        textAlign: "left",
      }}
    >
      {icon != null && <Box sx={{ mb: 1, fontSize: 48, lineHeight: 1 }}>{icon}</Box>}
      <Typography variant="body2" sx={{ mb: actionLabel ? 2 : 0 }}>
        {message}
      </Typography>
      {actionLabel != null && onAction != null && (
        <AppButton variant="primary" onClick={onAction}>
          {actionLabel}
        </AppButton>
      )}
    </Box>
  );
}
