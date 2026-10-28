import { lazy, memo, Suspense, useCallback, useEffect, useState } from "react";
import type { FormField } from "@/features/form-schema";
import { toast } from "@/ui/toast";
import { useFormBuilderActions } from "../../context/useFormBuilderContext";
import { FieldActions } from "./FieldActions";
import { PALETTE_META } from "../Palette/palette_config";

// The editor is only needed once a field is opened, so it loads on first use.
const FieldEditDialog = lazy(() =>
  import("../FieldEditor/FieldEditDialog").then((module) => ({
    default: module.FieldEditDialog,
  })),
);

const LEAVE_MS = 200;

type FieldCardProps = {
  field: FormField;
  /** The row this card belongs to is being dragged. */
  isDragging: boolean;
};

export const FieldCard = memo(function FieldCard({
  field,
  isDragging,
}: FieldCardProps) {
  const { setFields, getFields } = useFormBuilderActions();
  const [isEditOpen, setIsEditOpen] = useState(false);
  // The dialog (and its form) is only created after the first time it is opened.
  const [hasOpened, setHasOpened] = useState(false);
  // Playing the exit animation; the field is removed when it ends.
  const [isLeaving, setIsLeaving] = useState(false);

  const meta = PALETTE_META[field.type];
  const Icon = meta.icon;
  // Content elements have no label; their text identifies them better than their type.
  const title = field.name || field.content?.trim() || meta.title;
  const isRequired = Boolean(field.validation?.required);

  const openEditor = useCallback(() => {
    setHasOpened(true);
    setIsEditOpen(true);
  }, []);
  const closeEditor = useCallback(() => setIsEditOpen(false), []);
  const startDelete = useCallback(() => setIsLeaving(true), []);

  const finishDelete = useCallback(() => {
    const index = getFields().findIndex((item) => item.id === field.id);
    if (index === -1) return;
    const removed = getFields()[index];

    setFields((prev) => prev.filter((item) => item.id !== field.id));
    toast.info(`Deleted “${title}”`, {
      duration: 6000,
      action: {
        label: "Undo",
        // Put it back exactly where it was, pairing included (rows are re-normalized).
        onClick: () =>
          setFields((prev) => {
            if (prev.some((item) => item.id === removed.id)) return prev;
            const next = [...prev];
            next.splice(Math.min(index, next.length), 0, removed);
            return next;
          }),
      },
    });
  }, [field.id, getFields, setFields, title]);

  // A timer rather than transitionend: with reduced motion there is no transition to end.
  useEffect(() => {
    if (!isLeaving) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const timer = window.setTimeout(finishDelete, reduced ? 0 : LEAVE_MS);
    return () => window.clearTimeout(timer);
  }, [isLeaving, finishDelete]);

  const cardState = isDragging
    ? "border-plum shadow-lg scale-[1.01]"
    : isEditOpen
      ? "border-plum ring-plum/10 ring-4"
      : "border-line hover:border-mauve/50 hover:shadow-md hover:-translate-y-px";

  return (
    <>
      {/* The outer grid collapses the card's height smoothly while it is deleted. */}
      <div
        id={`field-card-${field.id}`}
        className={`animate-pop-in grid transition-[grid-template-rows,opacity,scale] duration-200 ease-out motion-reduce:transition-none ${
          isLeaving
            ? "pointer-events-none scale-95 grid-rows-[0fr] opacity-0"
            : "grid-rows-[1fr]"
        }`}
      >
        <div className="min-h-0">
          <div
            className={`flex min-w-0 items-center gap-1 rounded-xl border bg-white py-2 ps-2 pe-1 transition-[border-color,box-shadow,translate,scale] duration-200 ${cardState}`}
          >
            {/* Clicking the card body opens the editor. */}
            <button
              type="button"
              onClick={openEditor}
              aria-label={`Edit ${title}`}
              className="group/card focus-visible:outline-plum flex min-w-0 flex-1 items-center gap-3 rounded-lg px-1 py-0.5 text-start focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <span className="bg-plum/10 text-plum group-hover/card:bg-plum grid size-9 shrink-0 place-items-center rounded-lg transition-[background-color,color,rotate] duration-200 group-hover/card:-rotate-6 group-hover/card:text-white">
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
              onDelete={startDelete}
            />
          </div>
        </div>
      </div>

      {hasOpened ? (
        <Suspense fallback={null}>
          <FieldEditDialog
            field={field}
            open={isEditOpen}
            onClose={closeEditor}
          />
        </Suspense>
      ) : null}
    </>
  );
});
