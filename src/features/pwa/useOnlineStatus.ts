import { useSyncExternalStore } from "react";

const subscribe = (listener: () => void) => {
  window.addEventListener("online", listener);
  window.addEventListener("offline", listener);
  return () => {
    window.removeEventListener("online", listener);
    window.removeEventListener("offline", listener);
  };
};

/** Mirrors `navigator.onLine`, re-rendering on the `online`/`offline` events. */
export const useOnlineStatus = () =>
  useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
