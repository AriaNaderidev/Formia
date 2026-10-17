import { useEffect, useState } from "react";
import { useDndContext, useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useFormBuilderContext } from "../../context/useFormBuilderContext";
import { CanvasField } from "./CanvasField";
import { isPaletteId } from "@/features/form-schema";

export const Canvas = () => {
  const { fields } = useFormBuilderContext();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const { setNodeRef } = useDroppable({ id: "main-area" });
  const { active, over } = useDndContext();

  // A new field is being dragged in from the palette (not a reorder).
  const isAddingField = active ? isPaletteId(active.id) : false;
  // The pointer is somewhere over the canvas or one of its fields.
  const isOverCanvas = isAddingField && over !== null;
  // The pointer is over empty canvas space, i.e. the field will be appended.
  const isOverEnd = isAddingField && over?.id === "main-area";

  // Close any open field menu as soon as a drag starts.
  useEffect(() => {
    if (active) setOpenMenuId(null);
  }, [active]);

  const count = fields.length;

  return (
    <section
      ref={setNodeRef}
      aria-label="Form canvas"
      className="flex min-h-full flex-col p-4"
    >
      <div
        className={`flex flex-1 flex-col rounded-2xl border bg-white p-5 shadow-sm transition-[border-color,box-shadow] duration-300 ${
          isOverCanvas
            ? "border-plum ring-plum/10 shadow-lg ring-4"
            : isAddingField
              ? "border-mauve/50 border-dashed"
              : "border-line"
        }`}
      >
        <header className="mb-4 flex items-baseline justify-between gap-4">
          <h2 className="text-ink text-base font-semibold">Form</h2>
          <p className="text-ink-muted text-xs">
            {count} {count === 1 ? "field" : "fields"}
            {count > 1 && " · drag to reorder"}
          </p>
        </header>

        <SortableContext
          items={fields.map((field) => field.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-3">
            {fields.map((field) => (
              <div key={field.id} className="motion-safe:animate-pop-in">
                <CanvasField
                  field={field}
                  openMenuId={openMenuId}
                  setOpenMenuId={setOpenMenuId}
                />
              </div>
            ))}
          </div>
        </SortableContext>

        {/* Landing slot. Height is constant so the list never jumps mid-drag. */}
        <div
          aria-hidden={!isAddingField}
          className={`mt-3 grid h-16 shrink-0 place-items-center rounded-xl border-2 border-dashed text-sm font-medium transition-colors duration-300 ${
            !isAddingField
              ? "border-transparent text-transparent"
              : isOverEnd
                ? "border-plum bg-plum/5 text-plum"
                : "border-line text-ink-muted"
          }`}
        >
          {isOverEnd ? "Release to add here" : "Drop here to add at the end"}
        </div>
      </div>
    </section>
  );
};
