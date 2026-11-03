let region: HTMLElement | null = null;

const getRegion = () => {
  if (region?.isConnected) return region;
  region = document.createElement("div");
  region.setAttribute("role", "status");
  region.setAttribute("aria-live", "polite");
  region.setAttribute("aria-atomic", "true");
  region.className = "sr-only";
  document.body.append(region);
  return region;
};

/**
 * Says something to screen readers without showing it. For results that have no
 * visible message of their own, like a row moving or a field being added.
 */
export const announce = (message: string) => {
  const target = getRegion();
  // Clearing first makes a repeated message get read again.
  target.textContent = "";
  window.setTimeout(() => {
    target.textContent = message;
  }, 50);
};
