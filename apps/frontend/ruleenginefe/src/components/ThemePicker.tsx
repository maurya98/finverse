import { useState, useRef, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { THEME_IDS } from "../contexts/ThemeContext";
import { THEME_LABELS } from "../theme-labels";
import "./ThemePicker.css";

export function ThemePicker() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", handle, true);
    return () => document.removeEventListener("click", handle, true);
  }, [open]);

  return (
    <div className="theme-picker" ref={ref}>
      <button
        type="button"
        className="theme-picker-trigger"
        onClick={() => setOpen((o) => !o)}
        title="Choose theme"
        aria-label="Choose theme"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="theme-picker-icon" aria-hidden>
          🎨
        </span>
        <span className="theme-picker-label">{THEME_LABELS[theme]}</span>
      </button>
      {open && (
        <ul
          className="theme-picker-menu"
          role="listbox"
          aria-label="Theme"
          onMouseDown={(e) => e.preventDefault()}
        >
          {THEME_IDS.map((id) => (
            <li key={id} role="option" aria-selected={theme === id}>
              <button
                type="button"
                className={`theme-picker-option ${theme === id ? "selected" : ""}`}
                onClick={() => {
                  setTheme(id);
                  setOpen(false);
                }}
              >
                {THEME_LABELS[id]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
