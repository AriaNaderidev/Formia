import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CanvasField } from "./CanvasField";
import { useFormBuilderContext } from "../../context/useFormBuilderContext";

export const Canvas = () => {
  const { fields } = useFormBuilderContext();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const { setNodeRef } = useDroppable({ id: "main-area" });

  return (
    <div ref={setNodeRef} className="flex h-full flex-col gap-3 p-4">
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
