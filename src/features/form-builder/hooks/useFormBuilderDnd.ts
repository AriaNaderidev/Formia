import { useEffect, useState } from "react";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import {
  createFieldFromType,
  getCatalogField,
  isPaletteId,
  type FieldType,
  type FormField,
} from "../../form-schema";
import { CANVAS_DROPPABLE_ID } from "./Dnd.config";

export const useFormBuilderDnd = () => {
  const [fields, setFields] = useState<FormField[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    document.body.style.cursor = isDragging ? "grabbing" : "auto";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [isDragging]);

  const handleDragStart = (event: DragStartEvent) => {
    setIsDragging(true);
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false);
    setActiveId(null);

    const { over, active } = event;
    if (!over) return;

    const activeIdValue = String(active.id);
    const overId = String(over.id);

    if (isPaletteId(activeIdValue)) {
      const catalogField = getCatalogField(activeIdValue);
      if (!catalogField) return;

      const nextField = createFieldFromType(catalogField.type as FieldType);
      setFields((prev) => [...prev, nextField]);
      return;
    }

    if (overId === CANVAS_DROPPABLE_ID) return;

    setFields((prev) => {
      const oldIndex = prev.findIndex((field) => field.id === activeIdValue);
      const newIndex = prev.findIndex((field) => field.id === overId);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  return {
    fields,
    setFields,
    activeId,
    handleDragStart,
    handleDragEnd,
  };
};
