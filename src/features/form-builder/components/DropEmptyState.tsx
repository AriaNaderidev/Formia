import { useDroppable } from "@dnd-kit/core";
import EmptyStateImage from "@/assets/images/Empty.png";
import { FORM_TEMPLATES, instantiateTemplate } from "@/features/form-schema";
import { toast } from "@/ui/toast";
import { CANVAS_DROPPABLE_ID } from "../hooks/dnd_config";
import { useFormBuilderActions } from "../context/useFormBuilderContext";

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
      : "Drag or click a field to start building";

  return (
    <div
      ref={setNodeRef}
      className={`relative m-1 flex min-h-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-colors duration-300 ${
        isOver
          ? "border-plum bg-plum/5"
          : isDragging
            ? "border-line"
            : "border-transparent"
      }`}
    >
      {/* ripple rings, only while hovering */}
      {isOver && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 grid place-items-center motion-reduce:hidden"
        >
          <span className="border-plum/40 motion-safe:animate-ripple col-start-1 row-start-1 size-64 rounded-full border-2" />
          <span className="border-mauve/30 motion-safe:animate-ripple col-start-1 row-start-1 size-64 rounded-full border-2 [animation-delay:750ms]" />
        </div>
      )}

      <div
        className="relative flex h-full max-h-112 min-h-0 flex-col items-center justify-center gap-4 select-none"
        draggable={false}
      >
        <div
          className={`min-h-0 flex-1 transition-[scale,translate,opacity,filter] duration-300 ease-out ${
            isOver
              ? "-translate-y-1 scale-110 drop-shadow-xl"
              : isDragging
                ? "scale-95 opacity-70"
                : "motion-safe:animate-float"
          }`}
        >
          <img
            src={EmptyStateImage}
            alt="empty_state"
            className="h-full w-full rounded-md object-contain"
          />
        </div>

        <p
          aria-live="polite"
          className={`shrink-0 text-lg font-semibold transition-colors duration-300 ${
            isOver ? "text-plum" : "text-ink-muted"
          }`}
        >
          {caption}
        </p>

        <div
          className={`flex shrink-0 flex-col items-center gap-2 transition-[opacity,translate] duration-300 ${
            isDragging ? "pointer-events-none translate-y-2 opacity-0" : "opacity-100"
          }`}
        >
          <span className="text-ink-muted text-xs">or start from a template</span>
          <div className="flex flex-wrap justify-center gap-2">
            {FORM_TEMPLATES.map((template, index) => (
              <button
                key={template.id}
                type="button"
                title={template.description}
                onClick={() => {
                  setFields(instantiateTemplate(template));
                  toast.success(`${template.title} template added`, {
                    description: "Edit any field, or press Undo to start over.",
                  });
                }}
                style={{ animationDelay: `${150 + index * 70}ms` }}
                className="animate-fade-up border-line text-ink hover:border-plum hover:text-plum focus-visible:outline-plum rounded-full border bg-white px-3.5 py-1.5 text-sm font-medium shadow-sm transition-[color,border-color,box-shadow,translate,scale] duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 active:scale-95"
              >
                {template.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
