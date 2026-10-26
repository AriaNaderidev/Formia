import { useEffect } from "react";

export const IS_MAC =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
export const MOD_KEY = IS_MAC ? "⌘" : "Ctrl";

/** Text fields and dialogs keep their own native undo. */
const isOwnUndoTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    target.closest("input, textarea, select, [role='dialog']") !== null);

/** Ctrl/⌘+Z undoes; Ctrl/⌘+Shift+Z and Ctrl+Y redo. */
export const useUndoShortcuts = (undo: () => void, redo: () => void) => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.altKey) return;
      if (isOwnUndoTarget(event.target)) return;

      const key = event.key.toLowerCase();
      if (key === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if ((key === "z" && event.shiftKey) || (key === "y" && !IS_MAC)) {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo, redo]);
};
