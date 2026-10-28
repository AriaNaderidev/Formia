import {
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import {
  createFieldFromType,
  getCatalogField,
  isPaletteId,
  type FormField,
} from "../../form-schema";
import { insertFieldAfterRow, insertFieldBeforeRow, moveRow } from "@/utils/rows_helper";
import { CANVAS_DROPPABLE_ID, getDropSide } from "./dnd_config";

export const useFormBuilderDnd = (
  setFields: Dispatch<SetStateAction<FormField[]>>,
) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeId) return;
    document.body.style.cursor = "grabbing";
    return () => {
      document.body.style.cursor = "";
    };
  }, [activeId]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragCancel = () => setActiveId(null);

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);

    const { over, active } = event;
    if (!over) return;

    // For canvas rows, both ids are ROW keys, not field ids.
    const activeKey = String(active.id);
    const overKey = String(over.id);

    // New field from the palette: above or below the hovered row, or at the end.
    if (isPaletteId(activeKey)) {
      const catalogField = getCatalogField(activeKey);
      if (!catalogField) return;

      const side = getDropSide(active, over);
      setFields((prev) => {
        const nextField = createFieldFromType(catalogField.type, prev);
        if (overKey === CANVAS_DROPPABLE_ID) return [...prev, nextField];
        return side === "above"
          ? insertFieldBeforeRow(prev, nextField, overKey)
          : insertFieldAfterRow(prev, nextField, overKey);
      });
      return;
    }

    // Reorder: move the whole row so pairs stay together.
    if (
      overKey === CANVAS_DROPPABLE_ID ||
      activeKey === overKey
    ) {
      return;
    }
    setFields((prev) => moveRow(prev, activeKey, overKey));
  };

  return { activeId, handleDragStart, handleDragEnd, handleDragCancel };
};
