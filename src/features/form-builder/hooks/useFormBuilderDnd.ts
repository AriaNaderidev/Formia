import {
  useCallback,
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
  type FieldType,
  type FormField,
} from "../../form-schema";
import {
  insertFieldAfterRow,
  moveRow,
  normalizeRows,
} from "@/utils/rows_helper";
import { CANVAS_DROPPABLE_ID } from "./dnd_config";

export const useFormBuilderDnd = () => {
  const [fields, setRawFields] = useState<FormField[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Every write (drag, insert, delete, edit) passes through normalizeRows,
  // so a pair of fields can never end up split with a duplicated rowId.
  const setFields = useCallback<Dispatch<SetStateAction<FormField[]>>>(
    (action) => {
      setRawFields((prev) =>
        normalizeRows(typeof action === "function" ? action(prev) : action),
      );
    },
    [],
  );

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

    // For canvas rows, both ids are ROW keys, not field ids.
    const activeKey = String(active.id);
    const overKey = String(over.id);

    // New field from the palette: below the hovered row, or at the end.
    if (isPaletteId(activeKey)) {
      const catalogField = getCatalogField(activeKey);
      if (!catalogField) return;

      const nextField = createFieldFromType(catalogField.type as FieldType);
      setFields((prev) =>
        overKey === CANVAS_DROPPABLE_ID
          ? [...prev, nextField]
          : insertFieldAfterRow(prev, nextField, overKey),
      );
      return;
    }

    // Reorder: move the whole row so pairs stay together.
    if (overKey === CANVAS_DROPPABLE_ID || activeKey === overKey) return;
    setFields((prev) => moveRow(prev, activeKey, overKey));
  };

  return {
    fields,
    setFields,
    activeId,
    handleDragStart,
    handleDragEnd,
  };
};
