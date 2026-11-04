import { useEffect, useRef } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { toast } from "@/ui/toast";
import { InstallPrompt } from "./InstallPrompt";
import { useOnlineStatus } from "./useOnlineStatus";

const UPDATE_CHECK_MS = 60 * 60 * 1000;

/** Mount once. Registers the service worker and surfaces its state: updates, offline readiness, connectivity. */
export const PwaManager = () => {
  const {
    needRefresh: [needRefresh],
    offlineReady: [offlineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      // Long-lived tabs would otherwise only notice a deploy on the next navigation.
      if (registration) {
        window.setInterval(() => void registration.update(), UPDATE_CHECK_MS);
      }
    },
  });

  useEffect(() => {
    if (!offlineReady) return;
    toast.success("Ready to work offline", {
      description: "Formia is saved on this device.",
      key: "pwa:offline-ready",
    });
  }, [offlineReady]);

  useEffect(() => {
    if (!needRefresh) return;
    // Never reloads on its own: the form is autosaved, but the user picks the moment.
    toast.info("New version available", {
      description: "Refresh to update. Your form is saved and will be restored.",
      key: "pwa:update",
      duration: null,
      action: { label: "Refresh", onClick: () => void updateServiceWorker(true) },
    });
  }, [needRefresh, updateServiceWorker]);

  const online = useOnlineStatus();
  const first = useRef(true);
  useEffect(() => {
    // Online is the normal state; only announce a change from it.
    if (first.current) {
      first.current = false;
      if (online) return;
    }
    if (online) {
      toast.dismissKey("pwa:offline");
      toast.success("Back online", { key: "pwa:online" });
    } else {
      toast.dismissKey("pwa:online");
      toast.info("You're offline", {
        description: "Everything still works. Changes are saved on this device.",
        key: "pwa:offline",
        duration: 6000,
      });
    }
  }, [online]);

  return <InstallPrompt />;
};
