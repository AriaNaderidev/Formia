import { useEffect, type RefObject } from "react";

/**
 * Calls `onDismiss` when the user presses Escape or clicks/taps outside `ref`.
 * Only listens while `enabled` is true.
 */
export const useDismiss = (
  ref: RefObject<HTMLElement | null>,
  enabled: boolean,
  onDismiss: () => void,
) => {
  useEffect(() => {
    if (!enabled) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onDismiss();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [ref, enabled, onDismiss]);
};
