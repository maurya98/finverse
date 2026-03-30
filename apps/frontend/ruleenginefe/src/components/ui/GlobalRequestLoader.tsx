import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { useTheme as useMuiTheme } from "@mui/material/styles";

export function GlobalRequestLoader({ open }: { open: boolean }) {
  const theme = useMuiTheme();
  const isLight = theme.palette.mode === "light";

  return (
    <Backdrop
      open={open}
      sx={{
        zIndex: (t) => t.zIndex.modal + 1,
        color: "primary.main",
        backgroundColor: isLight ? "rgba(15, 23, 42, 0.08)" : "rgba(0, 0, 0, 0.35)",
        backdropFilter: "blur(2px)",
      }}
      aria-label="Loading"
    >
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
        <CircularProgress color="inherit" size={28} />
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Loading...
        </Typography>
      </Box>
    </Backdrop>
  );
}