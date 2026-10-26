import { memo, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import { toast, toastStore, type Toast, type ToastVariant } from "./toastStore";

const VARIANTS: Record<
  ToastVariant,
  { icon: typeof InfoRoundedIcon; tone: string; bar: string }
> = {
  success: {
    icon: CheckCircleRoundedIcon,
    tone: "text-emerald-600 bg-emerald-50",
    bar: "bg-emerald-500",
  },
  error: {
    icon: ErrorRoundedIcon,
    tone: "text-red-600 bg-red-50",
    bar: "bg-red-500",
  },
  info: {
    icon: InfoRoundedIcon,
    tone: "text-plum bg-plum/10",
    bar: "bg-plum",
  },
};

const ToastCard = memo(function ToastCard({ item }: { item: Toast }) {
  const { icon: Icon, tone, bar } = VARIANTS[item.variant];

  return (
    <li
      role={item.variant === "error" ? "alert" : "status"}
      onAnimationEnd={(event) => {
        if (item.leaving && event.target === event.currentTarget) {
          toastStore.remove(item.id);
        }
      }}
      // Hover or keyboard focus pauses the countdown (the progress bar's animation).
      className={`group/toast border-line pointer-events-auto relative w-full overflow-hidden rounded-2xl border bg-white/95 shadow-[0_12px_40px_-12px_rgba(42,22,51,0.35)] backdrop-blur ${
        item.wide ? "sm:w-[26rem]" : "sm:w-[22rem]"
      } ${item.leaving ? "animate-toast-out" : "animate-toast-in"}`}
    >
      <div className="flex gap-3 p-3.5 pe-10">
        <span className={`grid size-8 shrink-0 place-items-center rounded-full ${tone}`}>
          <Icon fontSize="small" />
        </span>
        <div className="min-w-0 flex-1 pt-1">
          <p className="text-ink text-sm leading-5 font-semibold">{item.title}</p>
          {item.description ? (
            <p className="text-ink-muted mt-0.5 text-xs leading-5">{item.description}</p>
          ) : null}
          {item.content ? <div className="mt-2.5">{item.content}</div> : null}
          {item.action ? (
            <button
              type="button"
              onClick={() => {
                item.action?.onClick();
                toast.dismiss(item.id);
              }}
              className="text-plum hover:bg-plum/10 focus-visible:outline-plum -ms-2 mt-1.5 rounded-md px-2 py-1 text-xs font-semibold transition-colors focus-visible:outline-2"
            >
              {item.action.label}
            </button>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => toast.dismiss(item.id)}
        className="text-ink-muted hover:bg-plum/5 hover:text-ink focus-visible:outline-plum absolute end-2 top-2 grid size-7 place-items-center rounded-full transition-[color,background-color,rotate] duration-200 hover:rotate-90 focus-visible:outline-2"
      >
        <CloseRoundedIcon sx={{ fontSize: 16 }} />
      </button>

      {item.duration !== null && !item.leaving ? (
        <span
          aria-hidden
          onAnimationEnd={(event) => {
            event.stopPropagation();
            toast.dismiss(item.id);
          }}
          style={{ animationDuration: `${item.duration}ms` }}
          className={`animate-toast-timer absolute inset-x-0 bottom-0 h-0.5 origin-left opacity-60 group-focus-within/toast:[animation-play-state:paused] group-hover/toast:[animation-play-state:paused] ${bar}`}
        />
      ) : null}
    </li>
  );
});

/** Mount once. Toasts stack bottom-right, newest at the bottom. */
export const Toaster = () => {
  const items = useSyncExternalStore(toastStore.subscribe, toastStore.getSnapshot);

  return createPortal(
    <ol
      aria-label="Notifications"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[1500] flex flex-col items-end gap-2.5 sm:inset-x-auto sm:end-5 sm:bottom-5"
    >
      {items.map((item) => (
        <ToastCard key={item.id} item={item} />
      ))}
    </ol>,
    document.body,
  );
};
