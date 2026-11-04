import { memo } from "react";
import type {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from "@dnd-kit/core";
import ViewColumnOutlinedIcon from "@mui/icons-material/ViewColumnOutlined";
import { InsertFieldControl } from "./InsertFieldControl";
import { RowHandle } from "./RowHandle";
import { FieldCard } from "./FieldCard";
import {
  isFullWidth,
  MAX_FIELDS_PER_ROW,
  type FieldRow,
} from "@/utils/rows_helper";

type RowContentProps = {
  row: FieldRow;
  isDragging: boolean;
  isBesideOpen: boolean;
  setOpenMenuKey: (key: string | null) => void;
  leavingIds: string[];
  isRowLeaving: boolean;
  onLeavingChange: (id: string, leaving: boolean) => void;
  setActivatorNodeRef: (element: HTMLElement | null) => void;
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners;
};

/**
 * Everything visible in a row. Memoized: its props stay stable while the pointer
 * moves, so it is not re-rendered on every frame of a drag.
 * Must be rendered inside an element with the `group/row` and `relative` classes.
 *
 * The drag handle and the "add beside" button live inside the cards, not in gutters
 * around the row, so they stay within a tab or section box and need no room beside it.
 * A row of two stacks its cards on a narrow screen, under a shared bar.
 */
export const RowContent = memo(function RowContent({
  row,
  isDragging,
  isBesideOpen,
  setOpenMenuKey,
  leavingIds,
  isRowLeaving,
  onLeavingChange,
  setActivatorNodeRef,
  attributes,
  listeners,
}: RowContentProps) {
  const first = row.fields[0];
  const hasPair = row.fields.length > 1;

  const canAddBeside =
    row.fields.length < MAX_FIELDS_PER_ROW && !isFullWidth(first.type);

  return (
    <div className="min-w-0">
      {hasPair ? (
        <p className="text-ink-muted mb-1 flex items-center gap-1 text-[11px] sm:hidden">
          <ViewColumnOutlinedIcon sx={{ fontSize: 13 }} />
          Side by side on wider screens
        </p>
      ) : null}
      <div
        className={`grid gap-2 sm:gap-3 ${
          hasPair
            ? "max-sm:border-mauve/40 grid-cols-1 sm:grid-cols-2 max-sm:border-s-2 max-sm:ps-2"
            : "grid-cols-[minmax(0,1fr)]"
        }`}
      >
        {row.fields.map((field, index) => (
          <FieldCard
            key={field.id}
            field={field}
            isDragging={isDragging}
            isLeaving={leavingIds.includes(field.id)}
            rowLeaving={isRowLeaving}
            onLeavingChange={onLeavingChange}
            leading={
              index === 0 ? (
                <RowHandle
                  isDragging={isDragging}
                  setActivatorNodeRef={setActivatorNodeRef}
                  attributes={attributes}
                  listeners={listeners}
                />
              ) : undefined
            }
            trailing={
              canAddBeside ? (
                <InsertFieldControl
                  anchorId={first.id}
                  menuKey={`${row.key}:beside`}
                  isOpen={isBesideOpen}
                  setOpenMenuKey={setOpenMenuKey}
                />
              ) : undefined
            }
          />
        ))}
      </div>
    </div>
  );
});
