import { useMemo } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { isPaletteId } from "../form-schema";
import { FormBuilderProvider } from "./context/FormBuilderProvider";
import { useFormBuilderDnd } from "./hooks/useFormBuilderDnd";
import { useFieldsHistory } from "./hooks/useFieldsHistory";
import { useUndoShortcuts } from "./hooks/useUndoShortcuts";
import { Palette, PaletteItemPreview } from "./components/Palette";
import { PreviewPanel } from "../preview/PreviewPanel";
import { DropEmptyState } from "./components/DropEmptyState";
import { Canvas } from "./components/Canvas/Canvas";
import { AppHeader } from "./components/AppHeader";
import {
  formBuilderCollision,
  restrictReorderToYAxis,
  useFormBuilderSensors,
} from "./hooks/dnd_config";

export const FormBuilderPage = () => {
  const { fields, setFields, getFields, undo, redo, canUndo, canRedo, savedAt } =
    useFieldsHistory();
  const { activeId, handleDragStart, handleDragEnd, handleDragCancel } =
    useFormBuilderDnd(setFields);
  const sensors = useFormBuilderSensors();
  useUndoShortcuts(undo, redo);

  // A new object every render would re-render every context consumer.
  const contextValue = useMemo(
    () => ({ fields, setFields, getFields }),
    [fields, setFields, getFields],
  );

  return (
    <FormBuilderProvider value={contextValue}>
      <DndContext
        sensors={sensors}
        collisionDetection={formBuilderCollision}
        modifiers={[restrictReorderToYAxis]}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="grid h-full min-h-0 grid-cols-[15rem_minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)]">
          <AppHeader
            undo={undo}
            redo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
            savedAt={savedAt}
          />

          <div className="min-h-0 overflow-hidden">
            <Palette />
          </div>

          {fields.length > 0 ? (
            <main className="animate-fade-in grid min-h-0 min-w-0 grid-cols-1 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_minmax(22rem,30rem)] lg:overflow-hidden">
              <div className="min-h-0 lg:overflow-y-auto">
                <Canvas />
              </div>
              <PreviewPanel />
            </main>
          ) : (
            <DropEmptyState />
          )}
        </div>

        {/* No drop animation: it would fly back to the palette tile even on a successful drop. */}
        <DragOverlay dropAnimation={null}>
          {activeId && isPaletteId(activeId) ? (
            <PaletteItemPreview id={String(activeId)} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </FormBuilderProvider>
  );
};
