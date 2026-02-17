import { useTheme } from "../contexts/ThemeContext";
import "./ThemeToggle.css";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
    >
      {theme === "dark" ? (
        <span className="theme-toggle-icon" aria-hidden>
          ☀️
        </span>
      ) : (
        <span className="theme-toggle-icon" aria-hidden>
          🌙
        </span>
      )}
    </button>
  );
}
