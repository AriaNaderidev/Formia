import { DndContext, DragOverlay } from "@dnd-kit/core";
import { useState } from "react";
import { isPaletteId } from "../form-schema";
import { FormBuilderProvider } from "./context/FormBuilderProvider";
import { useFormBuilderDnd } from "./hooks/useFormBuilderDnd";
import { Palette, PaletteItemPreview } from "./components/Palette";
import { PreviewPanel } from "../preview/PreviewPanel";
import { DropEmptyState } from "./components/DropEmptyState";
import { Canvas } from "./components/Canvas/Canvas";
import {
  formBuilderCollision,
  restrictReorderToYAxis,
  useFormBuilderSensors,
} from "./hooks/Dnd.config";

export const FormBuilderPage = () => {
  const { fields, setFields, activeId, handleDragStart, handleDragEnd } =
    useFormBuilderDnd();
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  const sensors = useFormBuilderSensors();

  return (
    <FormBuilderProvider value={{ fields, setFields, formData, setFormData }}>
      <DndContext
        sensors={sensors}
        collisionDetection={formBuilderCollision}
        modifiers={[restrictReorderToYAxis]}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid h-full min-h-0 grid-cols-[15rem_minmax(0,1fr)]">
          <div className="min-h-0 overflow-hidden">
            <Palette />
          </div>

          {fields.length > 0 ? (
            <main className="grid min-h-0 min-w-0 grid-cols-[minmax(0,1fr)_minmax(20rem,1fr)] overflow-y-auto">
              <Canvas />
              <PreviewPanel />
            </main>
          ) : (
            <DropEmptyState />
          )}
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
