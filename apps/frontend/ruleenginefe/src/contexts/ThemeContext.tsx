import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from "react";

const STORAGE_KEY = "ruleenginefe-theme";

/** All selectable theme IDs. "system" follows OS light/dark. */
export const THEME_IDS = [
  "light",
  "dark",
  "system",
  // "ocean",
  // "forest",
  // "violet",
  // "sunset",
  // "rose",
  // "lavender",
  // "sky",
] as const;

export type ThemeId = (typeof THEME_IDS)[number];

const THEME_IDS_SET = new Set<string>(THEME_IDS);

function getStoredTheme(): ThemeId | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v && THEME_IDS_SET.has(v)) return v as ThemeId;
  } catch {
    /* ignore */
  }
  return null;
}

function getSystemResolved(): "light" | "dark" {
  if (typeof window === "undefined" || !window.matchMedia) return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Resolve theme to the value applied to the document (data-theme). */
function getAppliedTheme(theme: ThemeId): string {
  if (theme === "system") return getSystemResolved();
  return theme;
}

function getInitialTheme(): ThemeId {
  return getStoredTheme() ?? "system";
}

function applyTheme(theme: ThemeId) {
  document.documentElement.setAttribute("data-theme", getAppliedTheme(theme));
}

const ThemeContext = createContext<{
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  /** Resolved theme actually applied (light/dark for system, else theme). */
  appliedTheme: string;
} | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(getInitialTheme);
  const appliedTheme = theme === "system" ? getSystemResolved() : theme;

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") return;
    const m = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      document.documentElement.setAttribute("data-theme", getSystemResolved());
    };
    m.addEventListener("change", handler);
    return () => m.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = useMemo(() => (next: ThemeId) => setThemeState(next), []);

  const value = useMemo(
    () => ({ theme, setTheme, appliedTheme }),
    [theme, setTheme, appliedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
