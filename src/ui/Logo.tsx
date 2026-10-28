import { useId } from "react";

/**
 * The Formia mark: an "F" built from form inputs, with a text caret waiting in the second one.
 * The bars draw in on load and the caret blinks (both stop under prefers-reduced-motion).
 */
export const Logo = ({ className = "" }: { className?: string }) => {
  const gradient = useId();

  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden
      className={`shadow-plum/50 rounded-[9px] shadow-[0_4px_12px_-4px] ${className}`}
    >
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#522d60" />
          <stop offset="1" stopColor="#80426e" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${gradient})`} />
      <g fill="#fff">
        <rect
          x="9"
          y="8"
          width="4"
          height="16"
          rx="2"
          className="animate-logo-stem origin-top [transform-box:fill-box]"
        />
        <rect
          x="9"
          y="8"
          width="14"
          height="4"
          rx="2"
          className="animate-logo-bar origin-left [transform-box:fill-box]"
        />
        <rect
          x="9"
          y="14.5"
          width="9"
          height="4"
          rx="2"
          fillOpacity=".9"
          style={{ animationDelay: "120ms" }}
          className="animate-logo-bar origin-left [transform-box:fill-box]"
        />
      </g>
      <rect x="21" y="14" width="2.5" height="5" rx="1.25" fill="#ffd38b" className="animate-caret" />
    </svg>
  );
};
