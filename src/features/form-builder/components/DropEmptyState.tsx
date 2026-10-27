import { useDroppable } from "@dnd-kit/core";
import EmptyStateImage from "@/assets/images/Empty.png";
import { instantiateTemplate, type FormTemplate } from "@/features/form-schema";
import { toast } from "@/ui/toast";
import { CANVAS_DROPPABLE_ID } from "../hooks/dnd_config";
import { useFormBuilderActions } from "../context/useFormBuilderContext";
import { TemplateGallery } from "../templates/TemplateGallery";

export const DropEmptyState = () => {
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
              className="h-32 w-auto rounded-md object-contain sm:h-44"
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
          </div>
        </div>

        <div
          className={`w-full pt-8 transition-[opacity,translate] duration-300 ${
            isDragging ? "pointer-events-none translate-y-2 opacity-0" : "opacity-100"
          }`}
        >
          <TemplateGallery onSelect={applyTemplate} />
        </div>
      </div>
    </div>
  );
};
