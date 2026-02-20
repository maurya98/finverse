import { useTheme } from "../contexts/ThemeContext";
import "./ThemeToggle.css";

export function ThemeToggle() {
  const { setTheme, appliedTheme } = useTheme();
  const isDark = appliedTheme === "dark";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? (
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
