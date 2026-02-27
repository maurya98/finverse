import { useEffect, useCallback } from "react";

export function useKeyboardShortcuts(
  shortcuts: Array<{
    key: string;
    ctrlKey?: boolean;
    shiftKey?: boolean;
    metaKey?: boolean;
    /** When true, handler runs even when focus is in INPUT, TEXTAREA, or contentEditable (e.g. editor). */
    triggerInInput?: boolean;
    handler: () => void;
  }>
) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      for (const s of shortcuts) {
        const keyMatch = e.key === s.key || e.key.toLowerCase() === s.key.toLowerCase();
        const ctrl = s.ctrlKey ?? false;
        const shift = s.shiftKey ?? false;
        const meta = s.metaKey ?? false;
        if (
          keyMatch &&
          e.ctrlKey === ctrl &&
          e.shiftKey === shift &&
          e.metaKey === meta &&
          !e.repeat
        ) {
          const target = e.target as HTMLElement;
          if (
            !s.triggerInInput &&
            (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
          ) {
            if (s.key !== "Escape") return;
          }
          e.preventDefault();
          s.handler();
          return;
        }
      }
    },
    [shortcuts]
  );
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
