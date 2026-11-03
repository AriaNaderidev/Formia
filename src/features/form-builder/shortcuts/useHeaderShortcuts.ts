import { useEffect, useRef } from "react";
import { announce } from "@/ui/announce";
import { toast } from "@/ui/toast";
import { isModalOpen, isTypingTarget } from "./useGlobalShortcuts";

type HeaderShortcutHandlers = {
  importSchema: () => void;
  exportSchema: () => void;
  saveTemplate: () => void;
  clearForm: () => void;
};

/** Press A, then one of these. Keep in step with shortcutList. */
const ACTIONS: Record<string, keyof HeaderShortcutHandlers> = {
  i: "importSchema",
  e: "exportSchema",
  t: "saveTemplate",
  c: "clearForm",
};

const LEADER = "a";
/** How long the second key may take. */
const WINDOW_MS = 2500;
const HINT_KEY = "header-shortcuts";
const HINT = "I import · E export · T template · C clear";

/**
 * Header actions as a two-key sequence: A, then a letter. Browsers reserve most
 * modifier combinations (Alt+Shift+I opens developer tools, Ctrl+S saves the page),
 * so a sequence of plain keys is the one thing the page can rely on. It also needs
 * no chorded fingers. Undo and redo are in useUndoShortcuts.
 */
export const useHeaderShortcuts = (handlers: HeaderShortcutHandlers) => {
  const latest = useRef(handlers);
  useEffect(() => {
    latest.current = handlers;
  });

  useEffect(() => {
    let timer: number | undefined;

    const stop = () => {
      window.clearTimeout(timer);
      timer = undefined;
      toast.dismissKey(HINT_KEY);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing) return;
      // Pressing Shift on its own must not cancel a sequence that is waiting.
      if (["Shift", "Alt", "Control", "Meta"].includes(event.key)) return;

      const waiting = timer !== undefined;
      if (waiting) stop();

      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (isModalOpen() || isTypingTarget(event.target)) return;

      const key = event.key.toLowerCase();
      if (waiting) {
        const action = ACTIONS[key];
        if (action) {
          event.preventDefault();
          latest.current[action]();
        }
        return;
      }

      if (key === LEADER) {
        timer = window.setTimeout(stop, WINDOW_MS);
        announce(`Actions. ${HINT}.`);
        toast.info("Actions", {
          description: HINT,
          duration: WINDOW_MS,
          key: HINT_KEY,
        });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      stop();
    };
  }, []);
};
