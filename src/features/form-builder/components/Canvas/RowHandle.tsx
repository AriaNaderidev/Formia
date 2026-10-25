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

/** Drags the whole row. Sits in the gutter at the row's start edge. */
export const RowHandle = ({
  isDragging,
  setActivatorNodeRef,
  attributes,
  listeners,
}: RowHandleProps) => (
  <div className="absolute inset-y-0 end-full flex items-center pe-1.5">
    <button
      ref={setActivatorNodeRef}
      type="button"
      {...attributes}
      {...listeners}
      aria-label="Move row"
      className={`hover:bg-plum/5 hover:text-plum focus-visible:outline-plum grid h-9 w-6 touch-none place-items-center rounded-md transition-[opacity,color,background-color] duration-150 focus-visible:opacity-100 focus-visible:outline-2 ${
        isDragging
          ? "text-plum cursor-grabbing opacity-100"
          : "text-ink-muted/60 cursor-grab opacity-0 group-hover/row:opacity-100 [@media(pointer:coarse)]:opacity-100"
      }`}
    >
      <DragIndicatorIcon fontSize="small" />
    </button>
  </div>
);
