import type {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from "@dnd-kit/core";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

type RowHandleProps = {
  isDragging: boolean;
  setActivatorNodeRef: (element: HTMLElement | null) => void;
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners;
};

/** Drags the whole row. Sits inside the row's first card, so it stays within any box around it. */
export const RowHandle = ({
  isDragging,
  setActivatorNodeRef,
  attributes,
  listeners,
}: RowHandleProps) => (
  <button
    ref={setActivatorNodeRef}
    type="button"
    {...attributes}
    {...listeners}
    aria-label="Move row"
    className={`hover:bg-plum/5 hover:text-plum focus-visible:outline-plum grid h-9 w-6 shrink-0 touch-none place-items-center rounded-md transition-[color,background-color] duration-150 focus-visible:outline-2 ${
      isDragging ? "text-plum cursor-grabbing" : "text-ink-muted/60 cursor-grab"
    }`}
  >
    <DragIndicatorIcon fontSize="small" />
  </button>
);
