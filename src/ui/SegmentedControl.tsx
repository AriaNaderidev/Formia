import { useRef, type KeyboardEvent, type ReactNode } from "react";

export type Segment<T extends string> = {
  value: T;
  label: ReactNode;
  /** Shown instead of `label` when the control is narrower than `fullLabelFrom`. Needs a string `label`. */
  shortLabel?: string;
  icon?: ReactNode;
  /** Optional accessible name when `label` isn't plain text. */
  ariaLabel?: string;
};

type SegmentedControlProps<T extends string> = {
  segments: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  /** "tabs" renders a tablist (pair it with aria-controlled panels); "radio" a radiogroup. */
  kind?: "tabs" | "radio";
  ariaLabel: string;
  size?: "sm" | "md";
  /** Id prefix used to link tabs to their panels: `${idPrefix}-tab-${value}`. */
  idPrefix?: string;
  /** Width (of the control itself, not the screen) from which full labels replace short ones. */
  fullLabelFrom?: keyof typeof FULL_LABEL;
  className?: string;
};

// Literal class names, so Tailwind can see them.
const FULL_LABEL = {
  "14rem": { full: "hidden @min-[14rem]:inline", short: "@min-[14rem]:hidden" },
  "24rem": { full: "hidden @min-[24rem]:inline", short: "@min-[24rem]:hidden" },
} as const;

/**
 * Equal-width segments with a thumb that slides to the selected one.
 * Arrow keys / Home / End move the selection, like native tabs and radios.
 */
export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  kind = "radio",
  ariaLabel,
  size = "md",
  idPrefix,
  fullLabelFrom = "24rem",
  className = "",
}: SegmentedControlProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = Math.max(
    0,
    segments.findIndex((segment) => segment.value === value),
  );
  const isTabs = kind === "tabs";

  const select = (next: number) => {
    const wrapped = (next + segments.length) % segments.length;
    onChange(segments[wrapped].value);
    refs.current[wrapped]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const moves: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowDown: index + 1,
      ArrowLeft: index - 1,
      ArrowUp: index - 1,
      Home: 0,
      End: segments.length - 1,
    };
    if (event.key in moves) {
      event.preventDefault();
      select(moves[event.key]);
    }
  };

  return (
    <div
      role={isTabs ? "tablist" : "radiogroup"}
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={`@container bg-plum/[0.06] relative grid rounded-xl p-1 ${className}`}
      style={{ gridTemplateColumns: `repeat(${segments.length}, minmax(0, 1fr))` }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-1 start-1 rounded-lg bg-white shadow-[0_1px_3px_rgba(42,22,51,0.12),0_1px_1px_rgba(42,22,51,0.06)] transition-transform duration-300 ease-[cubic-bezier(0.34,1.36,0.64,1)] motion-reduce:transition-none"
        style={{
          width: `calc((100% - 0.5rem) / ${segments.length})`,
          transform: `translateX(${index * 100}%)`,
        }}
      />
      {segments.map((segment, i) => {
        const selected = i === index;
        return (
          <button
            key={segment.value}
            ref={(element) => {
              refs.current[i] = element;
            }}
            type="button"
            role={isTabs ? "tab" : "radio"}
            id={idPrefix ? `${idPrefix}-tab-${segment.value}` : undefined}
            aria-controls={isTabs && idPrefix ? `${idPrefix}-panel-${segment.value}` : undefined}
            aria-selected={isTabs ? selected : undefined}
            aria-checked={isTabs ? undefined : selected}
            aria-label={
              segment.ariaLabel ?? (segment.shortLabel ? String(segment.label) : undefined)
            }
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(segment.value)}
            className={`focus-visible:outline-plum relative z-10 flex min-w-0 items-center justify-center gap-1.5 rounded-lg font-medium whitespace-nowrap transition-colors duration-200 focus-visible:outline-2 ${
              size === "sm" ? "h-7 px-2 text-xs" : "h-8 px-3 text-sm"
            } ${selected ? "text-ink" : "text-ink-muted hover:text-ink"}`}
          >
            {segment.icon}
            {segment.shortLabel ? (
              <>
                <span className={`truncate ${FULL_LABEL[fullLabelFrom].full}`}>{segment.label}</span>
                <span aria-hidden className={`truncate ${FULL_LABEL[fullLabelFrom].short}`}>
                  {segment.shortLabel}
                </span>
              </>
            ) : (
              <span className="truncate">{segment.label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
