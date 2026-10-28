import { useEffect, useRef, useState } from "react";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import { toast } from "./toast";

type CopyButtonProps = {
  text: string;
  /** What is being copied, e.g. "code". Used for the accessible label. */
  label?: string;
  showText?: boolean;
  tone?: "light" | "dark";
};

/** Copies `text` and morphs its icon into a check mark for a moment. */
export const CopyButton = ({
  text,
  label = "text",
  showText = false,
  tone = "light",
}: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Couldn't copy", {
        description: "Your browser blocked clipboard access.",
      });
    }
  };

  const colors =
    tone === "dark"
      ? "text-white/70 hover:bg-white/10 hover:text-white"
      : "text-ink-muted hover:bg-plum/[0.07] hover:text-plum";

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : `Copy ${label}`}
      className={`focus-visible:outline-plum inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-medium transition-[color,background-color,scale] duration-150 focus-visible:outline-2 active:scale-95 ${colors}`}
    >
      <span className="relative grid size-4 place-items-center">
        <ContentCopyRoundedIcon
          sx={{ fontSize: 16 }}
          className={`col-start-1 row-start-1 transition-[opacity,scale,rotate] duration-200 ${
            copied ? "scale-50 -rotate-45 opacity-0" : "scale-100 opacity-100"
          }`}
        />
        <CheckRoundedIcon
          sx={{ fontSize: 17 }}
          className={`col-start-1 row-start-1 text-emerald-500 transition-[opacity,scale] duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            copied ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        />
      </span>
      {showText ? <span aria-live="polite">{copied ? "Copied" : "Copy"}</span> : null}
    </button>
  );
};
