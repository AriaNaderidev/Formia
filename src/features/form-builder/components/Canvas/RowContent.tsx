import { memo } from "react";
import type {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from "@dnd-kit/core";
import { InsertFieldControl } from "./InsertFieldControl";
import { RowHandle } from "./RowHandle";
import { FieldCard } from "./FieldCard";
import { MAX_FIELDS_PER_ROW, type FieldRow } from "@/utils/rows_helper";

type RowContentProps = {
  row: FieldRow;
  isDragging: boolean;
  isBesideOpen: boolean;
  setOpenMenuKey: (key: string | null) => void;
  setActivatorNodeRef: (element: HTMLElement | null) => void;
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners;
};

/**
 * Everything visible in a row. Memoized: its props stay stable while the pointer
 * moves, so it is not re-rendered on every frame of a drag.
 * Must be rendered inside an element with the `group/row` and `relative` classes.
 */
export const RowContent = memo(function RowContent({
  row,
  isDragging,
  isBesideOpen,
  setOpenMenuKey,
  setActivatorNodeRef,
  attributes,
  listeners,
}: RowContentProps) {
  const first = row.fields[0];
  const hasPair = row.fields.length > 1;
  const canAddBeside = row.fields.length < MAX_FIELDS_PER_ROW;

  return (
    <>
      <RowHandle
        isDragging={isDragging}
        setActivatorNodeRef={setActivatorNodeRef}
        attributes={attributes}
        listeners={listeners}
      />

      <div
        className={`grid gap-3 ${
          hasPair ? "grid-cols-2" : "grid-cols-[minmax(0,1fr)]"
        }`}
      >
        {row.fields.map((field) => (
          <FieldCard key={field.id} field={field} isDragging={isDragging} />
        ))}
      </div>

      {canAddBeside && (
        <InsertFieldControl
          anchorId={first.id}
          menuKey={`${row.key}:beside`}
          isOpen={isBesideOpen}
          setOpenMenuKey={setOpenMenuKey}
        />
      )}
    </>
  );
});
