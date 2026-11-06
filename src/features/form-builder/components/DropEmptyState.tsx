import { useDroppable } from "@dnd-kit/core";
import EmptyStateImage from "@/assets/images/Empty.webp";
import {
  countElements,
  instantiateTemplate,
  type FormTemplate,
} from "@/features/form-schema";
import { announce } from "@/ui/announce";
import { toast } from "@/ui/toast";
import { focusWhenReady } from "@/utils/focus";
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
  const { setFields, setDirection } = useFormBuilderActions();

  const caption = isOver ? "Release to add your first field" : "Drop it here";

  const applyTemplate = (template: FormTemplate) => {
    setFields(instantiateTemplate(template));
    setDirection(template.direction ?? "ltr");
    // The gallery is replaced by the form, so focus would drop to the page.
    announce(
      `${template.title} template added with ${countElements(template)} elements.`,
    );
    focusWhenReady(() =>
      document.querySelector<HTMLElement>("[data-field-trigger]"),
    );
    toast.success(`${template.title} template added`, {
      description: "Edit any field, or press Undo to start over.",
    });
  };

  return (
    <div
      ref={setNodeRef}
      className={`relative m-1 flex min-h-0 flex-col rounded-2xl border-2 border-dashed transition-colors duration-300 ${
        isOver
          ? "border-plum bg-plum/5"
          : isDragging
            ? "border-line"
            : "border-transparent"
      }`}
    >
      {/* Only opacity and scale change while dragging, so nothing reflows. */}
      <div
        inert={isDragging}
        className={`min-h-0 flex-1 origin-center overflow-y-auto transition-[opacity,scale] duration-300 ease-out ${
          isDragging ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col items-center justify-center gap-y-15 px-4 [@media(max-height:820px)]:gap-y-8 py-4 sm:px-8 sm:py-6">
          <div
            className="flex flex-col items-center gap-3 select-none"
            draggable={false}
          >
            {/* The picture shrinks when the window is short, so the templates stay in view. */}
            <div className="motion-safe:animate-float">
              <img
                src={EmptyStateImage}
                alt=""
                // Intrinsic size lets the browser reserve the space (no layout shift);
                // this image is the largest paint of the empty state, so fetch it first.
                width={960}
                height={640}
                fetchPriority="high"
                decoding="async"
                className="h-28 w-auto rounded-md object-contain sm:h-36 [@media(max-height:820px)]:h-20 sm:[@media(max-height:820px)]:h-24"
              />
            </div>

            <div className="text-center">
              <p className="text-ink text-lg font-semibold">
                Add a field to start building
              </p>
              <p className="text-ink-muted text-sm">
                Drag a field in, or click one in the field list. Or begin with a
                template below.
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

          <div className="w-full">
            <TemplateGallery onSelect={applyTemplate} />
          </div>
        </div>
      </div>

      <div
        aria-hidden={!isDragging}
        className={`pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 transition-[opacity,scale] duration-300 ease-out ${
          isDragging ? "scale-100 opacity-100" : "scale-105 opacity-0"
        }`}
      >
        {/* Dot-grid texture with a soft plum glow; fades toward the edges so the border stays clean. */}
        <div
          aria-hidden
          className={`absolute inset-0 rounded-[inherit] transition-opacity duration-300 ${
            isOver ? "opacity-100" : "opacity-60"
          }`}
          style={{
            backgroundImage:
              "radial-gradient(circle at center, color-mix(in oklab, var(--color-plum) 14%, transparent), transparent 65%), radial-gradient(color-mix(in oklab, var(--color-plum) 28%, transparent) 1.2px, transparent 1.2px)",
            backgroundSize: "100% 100%, 20px 20px",
            maskImage:
              "radial-gradient(ellipse at center, #000 35%, transparent 85%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, #000 35%, transparent 85%)",
          }}
        />
        <img
          src={EmptyStateImage}
          alt=""
          width={960}
          height={640}
          decoding="async"
          className={`h-32 w-auto rounded-md object-contain transition-[translate,scale,filter] duration-300 ease-out sm:h-44 ${
            isOver ? "-translate-y-1 scale-110 drop-shadow-xl" : ""
          }`}
        />
        <p
          aria-live="polite"
          className={`text-lg font-semibold transition-colors duration-300 ${
            isOver ? "text-plum" : "text-ink"
          }`}
        >
          {isDragging ? caption : ""}
        </p>
      </div>
    </div>
  );
};
