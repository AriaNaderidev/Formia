import { useEffect, useRef } from "react";

type GlobalShortcutHandlers = {
  toggleHelp: () => void;
  focusSearch: () => void;
  focusFields: () => void;
  focusCanvas: () => void;
  focusPreview: () => void;
  focusTemplates: () => void;
};

export const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    target.closest("input, textarea, select") !== null);

/** A dialog, menu or drawer is open: the page behind it must not react. */
export const isModalOpen = () =>
  document.querySelector(".MuiModal-root:not(.MuiModal-hidden)") !== null;

const REGION_KEYS: Record<string, keyof GlobalShortcutHandlers> = {
  Digit1: "focusFields",
  Digit2: "focusCanvas",
  Digit3: "focusPreview",
  Digit4: "focusTemplates",
};

/**
 * The shortcuts that work from anywhere in the builder. Undo and redo live in
 * useUndoShortcuts. Keep this in step with shortcutList, which is what the guide shows.
 *
 * Alt+number is matched on `code`: on a Mac, Option+1 types "¡", so `key` is useless.
 */
export const useGlobalShortcuts = (handlers: GlobalShortcutHandlers) => {
  // The listener is attached once; it reads the latest handlers through the ref.
  const latest = useRef(handlers);
  useEffect(() => {
    latest.current = handlers;
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing) return;
      const mod = event.metaKey || event.ctrlKey;

      // Works even while typing, so it can also close the guide.
      if (mod && !event.altKey && event.key === "/") {
        event.preventDefault();
        latest.current.toggleHelp();
        return;
      }

      if (isModalOpen()) return;

      if (event.altKey && !mod && !event.shiftKey && event.code in REGION_KEYS) {
        event.preventDefault();
        latest.current[REGION_KEYS[event.code]]();
        return;
      }

      if (mod || event.altKey || isTypingTarget(event.target)) return;

      if (event.key === "?") {
        event.preventDefault();
        latest.current.toggleHelp();
      } else if (event.key === "/") {
        event.preventDefault();
        latest.current.focusSearch();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
};
