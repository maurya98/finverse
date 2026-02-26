import { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { KEYBOARD_SHORTCUTS, type ShortcutDef } from "../constants/keyboardShortcuts";

export interface KeyboardShortcutsHelpHandle {
  open: () => void;
}

export const KeyboardShortcutsHelp = forwardRef<KeyboardShortcutsHelpHandle>(function KeyboardShortcutsHelp(_, ref) {
  const [open, setOpen] = useState(false);

  const openHelp = useCallback(() => setOpen(true), []);
  const closeHelp = useCallback(() => setOpen(false), []);

  useImperativeHandle(ref, () => ({ open: openHelp }), [openHelp]);

  useKeyboardShortcuts([{ key: "/", ctrlKey: true, handler: openHelp }]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeHelp();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, closeHelp]);

  return (
    <Dialog open={open} onClose={closeHelp} maxWidth="sm" fullWidth>
      <DialogTitle>Keyboard shortcuts</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Press <kbd>Ctrl + /</kbd> anytime to open this help, or use the keyboard icon in the top bar.
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 2.5, "& li": { mb: 1.5 } }}>
          {KEYBOARD_SHORTCUTS.map((s: ShortcutDef) => (
            <Box component="li" key={s.keys} sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
              <Box
                component="kbd"
                sx={{
                  px: 1,
                  py: 0.5,
                  fontSize: "0.75rem",
                  fontFamily: "monospace",
                  bgcolor: "action.hover",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  whiteSpace: "nowrap",
                }}
              >
                {s.keys}
              </Box>
              <Typography variant="body2">{s.description}</Typography>
              {s.scope !== "global" && (
                <Typography variant="caption" color="text.secondary">
                  ({s.scope})
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
});

export function KeyboardShortcutsTrigger({ onClick }: { onClick: () => void }) {
  return (
    <IconButton
      color="inherit"
      onClick={onClick}
      size="small"
      title="Keyboard shortcuts (Ctrl + /)"
      aria-label="Show keyboard shortcuts"
    >
      <KeyboardIcon fontSize="small" />
    </IconButton>
  );
}
