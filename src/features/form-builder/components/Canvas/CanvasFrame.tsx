import type { ReactNode } from "react";
import { useDndContext, useDroppable } from "@dnd-kit/core";
import { isPaletteId } from "@/features/form-schema";
import { CANVAS_DROPPABLE_ID } from "@/features/form-builder/hooks/dnd_config";
import { SegmentedControl } from "@/ui/SegmentedControl";
import {
  useFormBuilderActions,
  useFormDirection,
} from "../../context/useFormBuilderContext";
import { getKeyLabel } from "../../shortcuts/shortcutList";

type CanvasFrameProps = {
  count: number;
  children: ReactNode;
};

/**
 * The only part of the canvas that subscribes to drag state.
 * `children` is created by <Canvas>, so React skips re-rendering the field list
 * when only the drag state (over / active) changes.
 */
export const CanvasFrame = ({ count, children }: CanvasFrameProps) => {
  const { setNodeRef } = useDroppable({ id: CANVAS_DROPPABLE_ID });
  const direction = useFormDirection();
  const { setDirection } = useFormBuilderActions();
  const { active, over } = useDndContext();

  // A new field is being dragged in from the palette (not a reorder).
  const isAddingField = active ? isPaletteId(active.id) : false;
  const isOverCanvas = isAddingField && over !== null;
  const isOverEnd = isAddingField && over?.id === CANVAS_DROPPABLE_ID;

  return (
    <section
      ref={setNodeRef}
      aria-label="Form canvas"
      className="flex min-h-full flex-col p-2 sm:p-4"
    >
      <div
        className={`flex flex-1 flex-col rounded-2xl border bg-white px-2 py-3 shadow-sm sm:px-5 sm:py-5 transition-[border-color,box-shadow] duration-300 ${
          isOverCanvas
            ? "border-plum ring-plum/10 shadow-lg ring-4"
            : isAddingField
              ? "border-mauve/50 border-dashed"
              : "border-line"
        }`}
      >
        <header className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="flex min-w-0 items-baseline gap-4">
            <h2 className="text-ink text-base font-semibold">Form</h2>
            <p className="text-ink-muted truncate text-xs">
              {count} {count === 1 ? "field" : "fields"}
              {count > 1 && ` · drag or press ${getKeyLabel("Alt").text} + ↑ ↓ to reorder`}
            </p>
          </div>
          <SegmentedControl
            ariaLabel="Form direction"
            size="sm"
            value={direction}
            onChange={setDirection}
            className="w-28 shrink-0"
            segments={[
              { value: "ltr", label: "LTR", ariaLabel: "Left to right" },
              { value: "rtl", label: "RTL", ariaLabel: "Right to left" },
            ]}
          />
        </header>

        {children}

        {/* Landing slot. Height is constant so the list never jumps mid-drag. */}
        <div
          aria-hidden={!isAddingField}
          className={`mt-3 grid h-16 shrink-0 place-items-center rounded-xl border-2 border-dashed text-sm font-medium transition-colors duration-300 ${
            !isAddingField
              ? "border-transparent text-transparent"
              : isOverEnd
                ? "border-plum bg-plum/5 text-plum animate-pop-in"
                : "border-line text-ink-muted"
          }`}
        >
          {isOverEnd ? "Release to add here" : "Drop here to add at the end"}
        </div>
      </div>
    </section>
  );
};
