import { memo, useCallback, useState } from "react";
import type {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from "@dnd-kit/core";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import type { FormField } from "@/features/form-schema";
import { useFormBuilderContext } from "@/features/form-builder/context/useFormBuilderContext";
import { PALETTE_META } from "../Palette/palette_config";
import { FieldActions } from "./FieldActions";
import { FieldEditDialog } from "../FieldEditor/FieldEditDialog";

type FieldRowProps = {
  field: FormField;
  isDragging: boolean;
  isMenuOpen: boolean;
  setOpenMenuId: (id: string | null) => void;
  setActivatorNodeRef: (element: HTMLElement | null) => void;
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners;
};

/**
 * Everything visible inside a field card. Memoized, and every prop is stable
 * while the pointer moves, so MUI buttons and tooltips are not re-rendered per frame.
 * Must be rendered inside an element with the `group` and `relative` classes.
 */
export const FieldRow = memo(function FieldRow({
  field,
  isDragging,
  isMenuOpen,
  setActivatorNodeRef,
  attributes,
  listeners,
}: FieldRowProps) {
  const { setFields } = useFormBuilderContext();
  const [isEditOpen, setIsEditOpen] = useState(false);
  // The dialog (and its form) is only created after the first time it is opened.
  const [hasOpened, setHasOpened] = useState(false);

  const meta = PALETTE_META[field.type];
  const Icon = meta.icon;
  const title = field.label || meta.title;
  const isRequired = Boolean(field.validation?.required);
  const isActive = isEditOpen || isMenuOpen;

  const openEditor = useCallback(() => {
    setHasOpened(true);
    setIsEditOpen(true);
  }, []);
  const closeEditor = useCallback(() => setIsEditOpen(false), []);
  const deleteField = useCallback(
    () => setFields((prev) => prev.filter((item) => item.id !== field.id)),
    [setFields, field.id],
  );

  const cardState = isDragging
    ? "border-plum shadow-lg"
    : isActive
      ? "border-plum"
      : "border-line hover:border-mauve/50 hover:shadow-sm";

  return (
    <>
      <div
        className={`flex items-center gap-1 rounded-xl border bg-white py-2 ps-1.5 pe-2 transition-[border-color,box-shadow] duration-150 ${cardState}`}
      >
        {/* Only the handle starts a drag, so clicks elsewhere stay clicks. */}
        <button
          ref={setActivatorNodeRef}
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Reorder ${title}`}
          className={`text-ink-muted/60 hover:bg-plum/5 hover:text-plum focus-visible:outline-plum grid h-9 w-6 shrink-0 touch-none place-items-center rounded-md transition-colors focus-visible:outline-2 ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          <DragIndicatorIcon fontSize="small" />
        </button>

        {/* Clicking the card body opens the editor. */}
        <button
          type="button"
          onClick={openEditor}
          aria-label={`Edit ${title}`}
          className="focus-visible:outline-plum flex min-w-0 flex-1 items-center gap-3 rounded-lg px-1 py-0.5 text-start focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <span className="bg-plum/10 text-plum grid size-9 shrink-0 place-items-center rounded-lg">
            <Icon fontSize="small" />
          </span>
          <span className="min-w-0">
            <span className="text-ink block truncate text-sm font-medium">
              {title}
            </span>
            <span className="text-ink-muted block truncate text-xs">
              {meta.title}
              {isRequired && <span className="text-plum"> · Required</span>}
            </span>
          </span>
        </button>

        <FieldActions
          label={title}
          onEdit={openEditor}
          onDelete={deleteField}
        />
      </div>

      {hasOpened ? (
        <FieldEditDialog
          field={field}
          open={isEditOpen}
          onClose={closeEditor}
        />
      ) : null}
    </>
  );
});
