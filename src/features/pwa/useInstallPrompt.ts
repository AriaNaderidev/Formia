import { useCallback, useEffect, useState } from "react";

/** Not in lib.dom yet: Chromium's install event. */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  // iOS Safari reports installed state here instead of the media query.
  ("standalone" in navigator && navigator.standalone === true);

/** iPadOS 13+ reports itself as a Mac, so touch support is the tell. */
const isIos = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

/**
 * Install state for the custom prompt.
 * `canInstall`: the browser handed us an install event (Chromium).
 * `needsIosHint`: iOS Safari has no event, so the user must be told how to install by hand.
 */
export const useInstallPrompt = () => {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isStandalone);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      // Stops the mini-infobar so our own prompt is the only one.
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    // The event is single-use whatever the answer was.
    setDeferred(null);
  }, [deferred]);

  return {
    canInstall: !installed && deferred !== null,
    needsIosHint: !installed && deferred === null && isIos(),
    install,
  };
};
