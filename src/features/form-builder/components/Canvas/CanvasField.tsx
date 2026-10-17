import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import type { FormField } from "@/features/form-schema";
import { Modal } from "@/shared/ui/Modal";
import { useFormBuilderContext } from "../../context/useFormBuilderContext";
import { FieldEditForm } from "../FieldEditForm";
import { PALETTE_META } from "../Palette/PaletteConfig";
import { InsertFieldButton } from "./InsertFieldButton";
import { FieldActions } from "./FieldActions";

type CanvasFieldProps = {
  field: FormField;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
};

export const CanvasField = ({
  field,
  openMenuId,
  setOpenMenuId,
}: CanvasFieldProps) => {
  const { setFields } = useFormBuilderContext();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const isMenuOpen = openMenuId === field.id;

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const meta = PALETTE_META[field.type];
  const Icon = meta.icon;
  const title = field.label || meta.title;
  const isRequired = Boolean(field.validation?.required);
  const isActive = isEditOpen || isMenuOpen;

  const closeEditor = () => setIsEditOpen(false);
  const deleteField = () =>
    setFields((prev) => prev.filter((item) => item.id !== field.id));

  const cardState = isDragging
    ? "scale-[1.01] border-plum shadow-xl ring-4 ring-plum/10"
    : isActive
      ? "border-plum"
      : "border-line hover:border-mauve/50 hover:shadow-sm";

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group relative ${isDragging ? "z-30" : ""}`}
    >
      <div
        className={`flex items-center gap-1 rounded-xl border bg-white py-2 ps-1.5 pe-2 transition-[border-color,box-shadow,transform] duration-200 ${cardState}`}
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
          onClick={() => setIsEditOpen(true)}
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
          onEdit={() => setIsEditOpen(true)}
          onDelete={deleteField}
        />
      </div>

      <InsertFieldButton
        afterId={field.id}
        isOpen={isMenuOpen}
        onOpenChange={(open) => setOpenMenuId(open ? field.id : null)}
      />

      <Modal isOpen={isEditOpen} onClose={closeEditor}>
        <FieldEditForm source={field} onClose={closeEditor} />
      </Modal>
    </div>
  );
};
