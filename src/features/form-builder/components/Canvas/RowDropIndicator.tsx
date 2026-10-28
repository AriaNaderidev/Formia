import { useDndContext } from "@dnd-kit/core";
import { isPaletteId } from "@/features/form-schema";
import { getDropSide } from "../../hooks/dnd_config";

/**
 * A line on the edge of the row a dragged-in field would land next to.
 * Subscribes to drag state on its own, so the memoized row around it doesn't re-render.
 */
export const RowDropIndicator = ({ rowKey }: { rowKey: string }) => {
  const { active, over } = useDndContext();
  if (!active || !isPaletteId(active.id) || over?.id !== rowKey) return null;

  const side = getDropSide(active, over);
  return (
    <span
      aria-hidden
      className={`bg-plum pointer-events-none absolute inset-x-0 z-20 h-1 rounded-full ${
        side === "above" ? "-top-2" : "-bottom-2"
      }`}
    />
  );
};
