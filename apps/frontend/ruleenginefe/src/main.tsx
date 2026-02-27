import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./styles/tokens.css";
import "./theme.css";
import { ThemeProvider } from "./contexts/ThemeContext";
import { MuiThemeProviderWrapper } from "./theme/MuiThemeProviderWrapper";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <MuiThemeProviderWrapper>
        <App />
      </MuiThemeProviderWrapper>
    </ThemeProvider>
  </StrictMode>,
)
