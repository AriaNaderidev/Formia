import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import IosShareRoundedIcon from "@mui/icons-material/IosShareRounded";
import { useLocalStorageState } from "@/utils/useLocalStorageState";
import { useInstallPrompt } from "./useInstallPrompt";

const DISMISSED_KEY = "pwa:install-dismissed";

/** Offers installation: a button where the browser supports it, written steps on iOS. */
export const InstallPrompt = () => {
  const { canInstall, needsIosHint, install } = useInstallPrompt();
  const [dismissed, setDismissed] = useLocalStorageState(DISMISSED_KEY, false);

  if (dismissed || (!canInstall && !needsIosHint)) return null;

  return (
    <section
      aria-label="Install Formia"
      className="animate-fade-up border-line fixed start-4 bottom-4 z-[1400] w-[calc(100%-2rem)] rounded-2xl border bg-white/95 p-3.5 pe-10 shadow-[0_12px_40px_-12px_rgba(42,22,51,0.35)] backdrop-blur sm:w-80"
    >
      <p className="text-ink text-sm leading-5 font-semibold">Install Formia</p>
      {canInstall ? (
        <>
          <p className="text-ink-muted mt-0.5 text-xs leading-5">
            Open it like an app and keep working without a connection.
          </p>
          <button
            type="button"
            onClick={() => void install()}
            className="bg-plum hover:bg-plum-dark focus-visible:outline-plum mt-2.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Install
          </button>
        </>
      ) : (
        <p className="text-ink-muted mt-0.5 text-xs leading-5">
          Tap <IosShareRoundedIcon sx={{ fontSize: 14, verticalAlign: "-2px" }} />{" "}
          <strong className="text-ink">Share</strong> in Safari, then choose{" "}
          <strong className="text-ink">Add to Home Screen</strong>.
        </p>
      )}
      <button
        type="button"
        aria-label="Dismiss install prompt"
        onClick={() => setDismissed(true)}
        className="text-ink-muted hover:bg-plum/5 hover:text-ink focus-visible:outline-plum absolute end-2 top-2 grid size-7 place-items-center rounded-full transition-colors focus-visible:outline-2"
      >
        <CloseRoundedIcon sx={{ fontSize: 16 }} />
      </button>
    </section>
  );
};
