import { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RowContent } from "./RowContent";
import { RowDropIndicator } from "./RowDropIndicator";
import type { FieldRow } from "@/utils/rows_helper";

type CanvasRowProps = {
  row: FieldRow;
  openMenuKey: string | null;
  setOpenMenuKey: (key: string | null) => void;
};

const SORT_TRANSITION = {
  duration: 180,
  easing: "cubic-bezier(0.25, 1, 0.5, 1)",
};

/** Sortable shell: positioning only. The visible UI is in the memoized <RowContent>. */
export const CanvasRow = memo(function CanvasRow({
  row,
  openMenuKey,
  setOpenMenuKey,
}: CanvasRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.key, transition: SORT_TRANSITION });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        willChange: isDragging ? "transform" : undefined,
      }}
      className={`group/row relative select-none ${isDragging ? "z-30" : ""}`}
    >
      <RowDropIndicator rowKey={row.key} />
      <RowContent
        row={row}
        isDragging={isDragging}
        isBesideOpen={openMenuKey === `${row.key}:beside`}
        setOpenMenuKey={setOpenMenuKey}
        setActivatorNodeRef={setActivatorNodeRef}
        attributes={attributes}
        listeners={listeners}
      />
    </div>
  );
});
