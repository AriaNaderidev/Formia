import { memo, useCallback, useState } from "react";
import type { FormField } from "@/features/form-schema";
import { Modal } from "@/shared/ui/Modal";
import { useFormBuilderContext } from "../../context/useFormBuilderContext";
import { FieldEditForm } from "../FieldEditForm";
import { PALETTE_META } from "../Palette/PaletteConfig"; // adjust to your file name
import { FieldActions } from "./FieldActions";

type FieldCardProps = {
  field: FormField;
  /** The row this card belongs to is being dragged. */
  isDragging: boolean;
};

export const FieldCard = memo(function FieldCard({
  field,
  isDragging,
}: FieldCardProps) {
  const { setFields } = useFormBuilderContext();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const meta = PALETTE_META[field.type];
  const Icon = meta.icon;
  const title = field.label || meta.title;
  const isRequired = Boolean(field.validation?.required);

  const openEditor = useCallback(() => setIsEditOpen(true), []);
  const closeEditor = useCallback(() => setIsEditOpen(false), []);
  const deleteField = useCallback(
    () => setFields((prev) => prev.filter((item) => item.id !== field.id)),
    [setFields, field.id],
  );

  const cardState = isDragging
    ? "border-plum shadow-lg"
    : isEditOpen
      ? "border-plum"
      : "border-line hover:border-mauve/50 hover:shadow-sm";

  return (
    <>
      <div
        className={`flex min-w-0 items-center gap-1 rounded-xl border bg-white py-2 ps-2 pe-1 transition-[border-color,box-shadow] duration-150 ${cardState}`}
      >
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

      <Modal isOpen={isEditOpen} onClose={closeEditor}>
        <FieldEditForm source={field} onClose={closeEditor} />
      </Modal>
    </>
  );
});
