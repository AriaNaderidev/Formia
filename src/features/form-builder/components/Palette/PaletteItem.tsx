import { memo } from "react";
import { useDraggable } from "@dnd-kit/core";
import Tooltip from "@mui/material/Tooltip";
import { createFieldFromType } from "@/features/form-schema";
import { useFormBuilderActions } from "../../context/useFormBuilderContext";
import type { PaletteEntry } from "./palette_config";
import { PaletteItemView } from "./Paletteitemview";

type PaletteItemProps = {
  entry: PaletteEntry;
};

/** Brings a freshly added card into view once it has rendered. */
const revealCard = (id: string) =>
  requestAnimationFrame(() =>
    document
      .getElementById(`field-card-${id}`)
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" }),
  );

export const PaletteItem = memo(({ entry }: PaletteItemProps) => {
  const { setFields, getFields } = useFormBuilderActions();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: entry.id,
    data: { source: "palette", type: entry.type },
  });

  // A click (no drag: the pointer sensor needs 4px of movement) appends the field.
  const add = () => {
    const field = createFieldFromType(entry.type, getFields());
    setFields((prev) => [...prev, field]);
    revealCard(field.id);
  };

  return (
    <Tooltip
      title={isDragging ? "" : `${entry.description}. Click or drag to add.`}
      placement="top"
      enterDelay={600}
      disableInteractive
    >
      <PaletteItemView
        ref={setNodeRef}
        entry={entry}
        dragging={isDragging}
        {...attributes}
        {...listeners}
        onClick={add}
      />
    </Tooltip>
  );
});

PaletteItem.displayName = "PaletteItem";
