import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useFormBuilderContext } from "../context/useFormBuilderContext";
import { CanvasField } from "./CanvasField";

export const Canvas = () => {
  const { fields } = useFormBuilderContext();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const { setNodeRef } = useDroppable({ id: "main-area" });

  return (
    <div
      ref={setNodeRef}
      className="flex h-full flex-col gap-3 bg-(--primary-bg-color) p-4"
    >
      <SortableContext
        items={fields.map((field) => field.id)}
        strategy={verticalListSortingStrategy}
      >
        {fields.map((field) => (
          <CanvasField
            key={field.id}
            field={field}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
          />
        ))}
      </SortableContext>
    </div>
  );
};
