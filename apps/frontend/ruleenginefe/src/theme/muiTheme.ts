import { createTheme } from "@mui/material/styles";

const accentColor = "#0d9488";

export function createAppTheme(mode: "light" | "dark") {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: accentColor,
      },
      ...(mode === "dark"
        ? {
            background: {
              default: "#1a1b20",
              paper: "#1e293b",
            },
          }
        : {
            background: {
              default: "#f1f5f9",
              paper: "#ffffff",
            },
          }),
    },
    shape: {
      borderRadius: 8,
    },
    typography: {
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
  });
}
