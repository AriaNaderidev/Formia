import { DndContext, DragOverlay } from "@dnd-kit/core";
import { useState } from "react";
import { FIELD_CATALOG, isPaletteId } from "../form-schema";
import { FormBuilderProvider } from "./context/FormBuilderProvider";
import { useFormBuilderDnd } from "./hooks/useFormBuilderDnd";
import { Palette } from "./components/Palette";
import { Canvas } from "./components/Canvas";
import { DropEmptyState } from "./components/DropEmptyState";
import { PreviewPanel } from "../preview/PreviewPanel";

export const FormBuilderPage = () => {
  const { fields, setFields, activeId, handleDragStart, handleDragEnd } =
    useFormBuilderDnd();
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  const overlayLabel = FIELD_CATALOG.find(
    (field) => field.id === activeId,
  )?.type;

  return (
    <FormBuilderProvider value={{ fields, setFields, formData, setFormData }}>
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid h-full min-h-0 w-full grid-cols-[auto_minmax(0,1fr)]">
          <aside className="min-h-0 overflow-y-auto">
              <Palette />
            </aside>

          <main className="relative z-10 grid min-h-0 min-w-0 grid-cols-2 grid-rows-[minmax(0,1fr)] gap-x-[10%] overflow-y-auto bg-(--primary-bg-color)">
            {fields.length > 0 ? (
              <>
                <Canvas />
                <PreviewPanel />
              </>
            ) : (
              <div className="col-span-2 flex min-h-0 items-center justify-center p-2">
                <DropEmptyState />
              </div>
            )}
          </main>
        </div>

        <DragOverlay>
          {activeId && isPaletteId(activeId) ? (
            <div className="z-9999 w-[100px] rounded-md bg-(--primary-bg-color) p-2 text-center text-xs font-bold shadow-[0px_0px_9px_-1px_#c9c9c9]">
              {overlayLabel}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </FormBuilderProvider>
  );
};
