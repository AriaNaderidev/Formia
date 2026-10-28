import { useDroppable } from "@dnd-kit/core";
import EmptyStateImage from "@/assets/images/Empty.png";
import { instantiateTemplate, type FormTemplate } from "@/features/form-schema";
import { toast } from "@/ui/toast";
import { CANVAS_DROPPABLE_ID } from "../hooks/dnd_config";
import { useFormBuilderActions } from "../context/useFormBuilderContext";
import { TemplateGallery } from "../templates/TemplateGallery";

type DropEmptyStateProps = {
  /** Opens the field list where it isn't always visible. */
  onBrowseFields: () => void;
};

export const DropEmptyState = ({ onBrowseFields }: DropEmptyStateProps) => {
  const { setNodeRef, isOver, active } = useDroppable({
    id: CANVAS_DROPPABLE_ID,
  });
  const isDragging = Boolean(active);
  const { setFields } = useFormBuilderActions();

  const caption = isOver
    ? "Release to add your first field"
    : isDragging
      ? "Drop it here"
      : "Add a field to start building";

  const applyTemplate = (template: FormTemplate) => {
    setFields(instantiateTemplate(template));
    toast.success(`${template.title} template added`, {
      description: "Edit any field, or press Undo to start over.",
    });
  };

  return (
    <div
      ref={setNodeRef}
      className={`relative m-1 min-h-0 overflow-y-auto rounded-2xl border-2 border-dashed transition-colors duration-300 ${
        isOver
          ? "border-plum bg-plum/5"
          : isDragging
            ? "border-line"
            : "border-transparent"
      }`}
    >
      <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col items-center justify-center px-4 py-6 sm:px-8 sm:py-10">
        <div
          className="flex flex-col items-center gap-3 select-none"
          draggable={false}
        >
          <div
            className={`transition-[scale,translate,opacity,filter] duration-300 ease-out ${
              isOver
                ? "-translate-y-1 scale-110 drop-shadow-xl"
                : isDragging
                  ? "scale-95 opacity-70"
                  : "motion-safe:animate-float"
            }`}
          >
            <img
              src={EmptyStateImage}
              alt=""
              className={`w-auto rounded-md object-contain transition-[height] duration-300 ease-out ${
                isDragging ? "h-[min(45vh,22rem)]" : "h-32 sm:h-44"
              }`}
            />
          </div>

          <div className="text-center">
            <p
              aria-live="polite"
              className={`text-lg font-semibold transition-colors duration-300 ${
                isOver ? "text-plum" : "text-ink"
              }`}
            >
              {caption}
            </p>
            <p className="text-ink-muted text-sm">
              Drag a field in, or click one in the field list. Or begin with a template below.
            </p>
            <button
              type="button"
              onClick={onBrowseFields}
              className="bg-plum hover:bg-plum-dark focus-visible:outline-plum mt-3 rounded-full px-4 py-2 text-sm font-medium text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-95 lg:hidden"
            >
              Browse fields
            </button>
          </div>
        </div>

        {/* Collapses while dragging, so the drop zone (and the image) can take the space. */}
        <div
          inert={isDragging}
          className={`grid w-full transition-[grid-template-rows,opacity] duration-300 ${
            isDragging ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"
          }`}
        >
          <div className="min-h-0 overflow-hidden pt-8">
            <TemplateGallery onSelect={applyTemplate} />
          </div>
        </div>
      </div>
    </div>
  );
};
