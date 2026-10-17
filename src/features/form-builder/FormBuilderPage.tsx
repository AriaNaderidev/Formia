import { DndContext, DragOverlay } from "@dnd-kit/core";
import { useState } from "react";
import { isPaletteId } from "../form-schema";
import { FormBuilderProvider } from "./context/FormBuilderProvider";
import { useFormBuilderDnd } from "./hooks/useFormBuilderDnd";
import { Palette, PaletteItemPreview } from "./components/Palette";
import { Canvas } from "./components/Canvas";
import { PreviewPanel } from "../preview/PreviewPanel";
import { DropEmptyState } from "./components/DropEmptyState";

export const FormBuilderPage = () => {
  const { fields, setFields, activeId, handleDragStart, handleDragEnd } =
    useFormBuilderDnd();
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  return (
    <FormBuilderProvider value={{ fields, setFields, formData, setFormData }}>
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid h-full min-h-0 grid-cols-[15rem_minmax(0,1fr)]">
          <div className="min-h-0 overflow-hidden">
            <Palette />
          </div>

          <main className="grid min-h-0 min-w-0 grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)] gap-x-[10%] overflow-y-auto">
            {fields.length > 0 ? (
              <>
                <Canvas />
                <PreviewPanel />
              </>
            ) : (
              <DropEmptyState />
            )}
          </main>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeId && isPaletteId(activeId) ? (
            <PaletteItemPreview id={String(activeId)} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </FormBuilderProvider>
  );
};
