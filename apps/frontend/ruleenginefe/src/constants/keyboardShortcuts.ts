/**
 * App-wide keyboard shortcut definitions.
 * Used by useKeyboardShortcuts and the Keyboard shortcuts help dialog.
 */

export type ShortcutScope = "global" | "dashboard" | "repo-editor";

export interface ShortcutDef {
  /** Display key combo, e.g. "/" or "Ctrl+Shift+D" */
  keys: string;
  description: string;
  scope: ShortcutScope;
}

/** Human-readable list of all shortcuts for the help dialog. */
export const KEYBOARD_SHORTCUTS: ShortcutDef[] = [
  { keys: "Ctrl + /", description: "Show keyboard shortcuts", scope: "global" },
  { keys: "Ctrl + Shift + D", description: "Go to Repositories (dashboard)", scope: "global" },
  { keys: "Ctrl + Shift + L", description: "Go to Logs", scope: "global" },
  { keys: "/", description: "Focus repository search", scope: "dashboard" },
  { keys: "Ctrl + S (or ⌘ + S)", description: "Save current file", scope: "repo-editor" },
  { keys: "Ctrl + Shift + C (or ⌘ + Shift + C)", description: "Open commit dialog", scope: "repo-editor" },
];
