import { memo, useCallback, useState, type ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RowContent } from "./RowContent";
import { RowDropIndicator } from "./RowDropIndicator";
import type { FieldRow } from "@/utils/rows_helper";

type CanvasRowProps = {
  row: FieldRow;
  openMenuKey: string | null;
  setOpenMenuKey: (key: string | null) => void;
  /** The closing edge of a tab or section. Shown instead of fields; it only receives drops. */
  footer?: ReactNode;
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
  footer,
}: CanvasRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: row.key,
    transition: SORT_TRANSITION,
    // The end of an area stays where it is; rows are dropped above or below it.
    disabled: footer ? { draggable: true } : undefined,
  });

  // When every card of the row is leaving, the row fades as a whole so the handle and
  // the "+" go with it. State lives here so row and cards switch on the same render.
  const [leavingIds, setLeavingIds] = useState<string[]>([]);
  const onLeavingChange = useCallback((id: string, leaving: boolean) => {
    setLeavingIds((prev) =>
      leaving
        ? prev.includes(id)
          ? prev
          : [...prev, id]
        : prev.filter((item) => item !== id),
    );
  }, []);
  const isRowLeaving = row.fields.every((field) =>
    leavingIds.includes(field.id),
  );

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        willChange: isDragging ? "transform" : undefined,
      }}
      data-flip={row.key}
      className={`group/row relative select-none ${isDragging ? "z-30" : ""}`}
    >
      <div
        className={`transition-opacity duration-150 ease-out motion-reduce:transition-none ${
          isRowLeaving ? "pointer-events-none opacity-0" : ""
        }`}
      >
        <RowDropIndicator rowKey={row.key} />
        {footer ?? (
          <RowContent
            row={row}
            isDragging={isDragging}
            isBesideOpen={openMenuKey === `${row.key}:beside`}
            setOpenMenuKey={setOpenMenuKey}
            leavingIds={leavingIds}
            isRowLeaving={isRowLeaving}
            onLeavingChange={onLeavingChange}
            setActivatorNodeRef={setActivatorNodeRef}
            attributes={attributes}
            listeners={listeners}
          />
        )}
      </div>
    </div>
  );
});
