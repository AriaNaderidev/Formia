import { useDroppable } from "@dnd-kit/core";
import EmptyStateImage from "@/assets/images/Empty.png";
import { CANVAS_DROPPABLE_ID } from "../hooks/Dnd.config";

export const DropEmptyState = () => {
  const { setNodeRef, isOver, active } = useDroppable({ id: CANVAS_DROPPABLE_ID });
  const isDragging = Boolean(active);

  const caption = isOver
    ? "Release to add your first field"
    : isDragging
      ? "Drop it here"
      : "Drag a field here to start building";

  return (
    <div
      ref={setNodeRef}
      className={`relative m-1 flex min-h-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-colors duration-300 ${
        isOver
          ? "border-plum bg-plum/5"
          : isDragging
            ? "border-line"
            : "border-transparent"
      }`}
    >
      {/* ripple rings, only while hovering */}
      {isOver && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 grid place-items-center motion-reduce:hidden"
        >
          <span className="border-plum/40 motion-safe:animate-ripple col-start-1 row-start-1 size-64 rounded-full border-2" />
          <span className="border-mauve/30 motion-safe:animate-ripple col-start-1 row-start-1 size-64 rounded-full border-2 [animation-delay:750ms]" />
        </div>
      )}

      <div
        className="relative flex h-full max-h-112 min-h-0 flex-col items-center justify-center gap-4 select-none"
        draggable={false}
      >
        <div
          className={`min-h-0 flex-1 transition-[scale,translate,opacity,filter] duration-300 ease-out ${
            isOver
              ? "-translate-y-1 scale-110 drop-shadow-xl"
              : isDragging
                ? "scale-95 opacity-70"
                : "motion-safe:animate-float"
          }`}
        >
          <img
            src={EmptyStateImage}
            alt="empty_state"
            className="h-full w-full rounded-md object-contain"
          />
        </div>

        <p
          aria-live="polite"
          className={`shrink-0 text-lg font-semibold transition-colors duration-300 ${
            isOver ? "text-plum" : "text-ink-muted"
          }`}
        >
          {caption}
        </p>
      </div>
    </div>
  );
};
