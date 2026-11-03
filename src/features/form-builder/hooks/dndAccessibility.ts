import type { Announcements, ScreenReaderInstructions } from "@dnd-kit/core";
import type { FormField } from "@/features/form-schema";
import { groupIntoRows } from "@/utils/rows_helper";
import { getFieldTitle } from "../components/Canvas/fieldTitle";

export const SCREEN_READER_INSTRUCTIONS: ScreenReaderInstructions = {
  draggable:
    "To move this row, press Space or Enter to pick it up, then use the up and down arrow keys. " +
    "Press Space or Enter to drop it, or Escape to cancel. " +
    "Alt with the up or down arrow key moves a row directly.",
};

/**
 * Spoken updates for keyboard reordering. dnd-kit only knows row keys, which are
 * ids, so they are translated into the names of the fields in the row.
 */
export const createAnnouncements = (
  getFields: () => FormField[],
): Announcements => {
  const locate = (id: string | number) => {
    const rows = groupIntoRows(getFields());
    const index = rows.findIndex((row) => row.key === String(id));
    if (index === -1) return null;
    const label = rows[index].fields.map(getFieldTitle).join(" and ");
    return { label, position: index + 1, total: rows.length };
  };

  return {
    onDragStart: ({ active }) => {
      const row = locate(active.id);
      return row
        ? `Picked up ${row.label}, row ${row.position} of ${row.total}.`
        : undefined;
    },
    onDragOver: ({ active, over }) => {
      const row = locate(active.id);
      const target = over ? locate(over.id) : null;
      return row && target
        ? `${row.label} is over row ${target.position} of ${target.total}.`
        : undefined;
    },
    onDragEnd: ({ active, over }) => {
      const row = locate(active.id);
      const target = over ? locate(over.id) : null;
      if (!row) return undefined;
      return target
        ? `Dropped ${row.label} at row ${target.position} of ${target.total}.`
        : `Dropped ${row.label} back at row ${row.position}.`;
    },
    onDragCancel: ({ active }) => {
      const row = locate(active.id);
      return row
        ? `Cancelled. ${row.label} stays at row ${row.position} of ${row.total}.`
        : undefined;
    },
  };
};
