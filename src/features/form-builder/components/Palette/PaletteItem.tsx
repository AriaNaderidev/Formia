import { memo } from "react";
import { useDraggable } from "@dnd-kit/core";
import Tooltip from "@mui/material/Tooltip";
import type { PaletteEntry } from "./palette_config";
import { PaletteItemView } from "./Paletteitemview";

type PaletteItemProps = {
  entry: PaletteEntry;
};

export const PaletteItem = memo(({ entry }: PaletteItemProps) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: entry.id,
    data: { source: "palette", type: entry.type },
  });

  return (
    <Tooltip
      title={isDragging ? "" : entry.description}
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
      />
    </Tooltip>
  );
});

PaletteItem.displayName = "PaletteItem";
