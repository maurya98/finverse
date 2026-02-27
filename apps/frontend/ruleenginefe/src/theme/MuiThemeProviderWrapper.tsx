import { useMemo, type ReactNode } from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { useTheme } from "../contexts/ThemeContext";
import { createAppTheme } from "./muiTheme";

export function MuiThemeProviderWrapper({ children }: { children: ReactNode }) {
  const { appliedTheme } = useTheme();
  const mode = appliedTheme === "light" ? "light" : "dark";
  const theme = useMemo(() => createAppTheme(mode), [mode]);
  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
}
