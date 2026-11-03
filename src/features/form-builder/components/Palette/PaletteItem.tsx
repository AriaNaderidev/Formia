import { memo, type KeyboardEvent } from "react";
import { useDraggable } from "@dnd-kit/core";
import Tooltip from "@mui/material/Tooltip";
import { createFieldFromType } from "@/features/form-schema";
import { announce } from "@/ui/announce";
import { useFormBuilderActions } from "../../context/useFormBuilderContext";
import type { PaletteEntry } from "./palette_config";
import { PaletteItemView } from "./Paletteitemview";

type PaletteItemProps = {
  entry: PaletteEntry;
  /**
   * Called after a click adds the field. Only the palette drawer passes it, and
   * there dragging is off: adding by click is the only way to insert.
   */
  onAdd?: () => void;
};

/** Brings a freshly added card into view once it has rendered. */
const revealCard = (id: string) =>
  requestAnimationFrame(() =>
    document
      .getElementById(`field-card-${id}`)
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" }),
  );

export const PaletteItem = memo(({ entry, onAdd }: PaletteItemProps) => {
  const { setFields, getFields } = useFormBuilderActions();
  const clickOnly = onAdd !== undefined;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: entry.id,
    data: { source: "palette", type: entry.type },
    disabled: clickOnly,
  });

  // A click (no drag: the pointer sensor needs 4px of movement) appends the field.
  const add = () => {
    const field = createFieldFromType(entry.type, getFields());
    setFields((prev) => [...prev, field]);
    revealCard(field.id);
    announce(`${entry.title} added at the end of the form.`);
    onAdd?.();
  };

  // dnd-kit would turn Enter and Space into a keyboard drag here, which has no good
  // landing spot for a new field. They add the field instead; rows are moved by keyboard
  // from the canvas.
  const onKeyDown = (event: KeyboardEvent) => {
    if ((event.key !== "Enter" && event.key !== " ") || event.altKey) return;
    event.preventDefault();
    if (!event.repeat) add();
  };

  return (
    <Tooltip
      title={
        isDragging
          ? ""
          : `${entry.description}. ${clickOnly ? "Click" : "Click or drag"} to add, or press Enter.`
      }
      placement="top"
      enterDelay={600}
      disableInteractive
      describeChild
    >
      <PaletteItemView
        ref={setNodeRef}
        entry={entry}
        dragging={isDragging}
        clickOnly={clickOnly}
        {...attributes}
        {...listeners}
        data-palette-item
        aria-label={`Add ${entry.title}`}
        aria-roledescription={undefined}
        aria-describedby={undefined}
        onKeyDown={onKeyDown}
        onClick={add}
      />
    </Tooltip>
  );
});

PaletteItem.displayName = "PaletteItem";
