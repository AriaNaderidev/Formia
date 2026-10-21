import { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { FormField } from "@/features/form-schema";
import { FieldRow } from "./CanvasFieldRow";

type CanvasFieldProps = {
  field: FormField;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
};

const SORT_TRANSITION = {
  duration: 180,
  easing: "cubic-bezier(0.25, 1, 0.5, 1)",
};

/**
 * Sortable shell. It re-renders on every pointer move while dragging,
 * so it only does positioning. All the visible UI lives in the memoized <FieldRow>.
 */
export const CanvasField = memo(function CanvasField({
  field,
  openMenuId,
  setOpenMenuId,
}: CanvasFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id, transition: SORT_TRANSITION });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        willChange: isDragging ? "transform" : undefined,
      }}
      className={`group relative select-none ${isDragging ? "z-30" : ""} `}
    >
      <FieldRow
        field={field}
        isDragging={isDragging}
        isMenuOpen={openMenuId === field.id}
        setOpenMenuId={setOpenMenuId}
        setActivatorNodeRef={setActivatorNodeRef}
        attributes={attributes}
        listeners={listeners}
      />
    </div>
  );
});
