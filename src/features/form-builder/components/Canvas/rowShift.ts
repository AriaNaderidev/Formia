const SHIFT_MS = 260;
const SHIFT_EASING = "cubic-bezier(0.25, 1, 0.5, 1)";

let before: Map<string, number> | null = null;

/** A card is measured against its row, so the row's own slide is not applied twice. */
const offsetTop = (element: HTMLElement) => {
  const parent = element.parentElement?.closest("[data-flip]");
  return (
    element.getBoundingClientRect().top -
    (parent ? parent.getBoundingClientRect().top : 0)
  );
};

const measure = () => {
  const positions = new Map<string, number>();
  document
    .querySelectorAll<HTMLElement>("[data-flip]")
    .forEach((element) =>
      positions.set(element.dataset.flip as string, offsetTop(element)),
    );
  return positions;
};

/** Call right before a removal is committed: remembers where everything is. */
export const recordRowPositions = () => {
  before = measure();
};

/**
 * Call in a layout effect after the removal rendered. Whatever moved is put back
 * where it was and slid to its new place with `transform`, which the compositor
 * handles without re-laying-out the rows below (FLIP).
 */
export const playRowShift = () => {
  if (!before) return;
  const previous = before;
  before = null;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  document.querySelectorAll<HTMLElement>("[data-flip]").forEach((element) => {
    const was = previous.get(element.dataset.flip as string);
    if (was === undefined) return;
    const delta = was - offsetTop(element);
    if (Math.abs(delta) < 1) return;
    element.animate(
      [{ transform: `translateY(${delta}px)` }, { transform: "translateY(0)" }],
      { duration: SHIFT_MS, easing: SHIFT_EASING },
    );
  });
};
