/** Id of the button that opens a field's editor. It is also the card's focus target. */
export const fieldTriggerId = (fieldId: string) => `field-edit-${fieldId}`;

/** Where focus lands when there is no field to land on. */
export const MAIN_ID = "main-content";

/**
 * Focuses an element that may not exist yet (it is about to render, or its pane is
 * about to be shown). Retries for a few frames, then gives up quietly.
 */
export const focusWhenReady = (
  find: () => HTMLElement | null | undefined,
  frames = 12,
) => {
  const attempt = (left: number) => {
    const element = find();
    element?.focus();
    if (element && document.activeElement === element) return;
    if (left > 0) requestAnimationFrame(() => attempt(left - 1));
  };
  requestAnimationFrame(() => attempt(frames));
};

export const focusById = (id: string) =>
  focusWhenReady(() => document.getElementById(id));
