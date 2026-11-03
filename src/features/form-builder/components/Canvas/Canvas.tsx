import { useLayoutEffect, useMemo, useState } from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useFormBuilderContext } from "@/features/form-builder/context/useFormBuilderContext";
import { CanvasFrame } from "./CanvasFrame";
import { CanvasRow } from "./CanvasRow";
import { playRowShift } from "./rowShift";
import { groupIntoRows } from "@/utils/rows_helper";

export const Canvas = () => {
  const { fields } = useFormBuilderContext();
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);

  const rows = useMemo(() => groupIntoRows(fields), [fields]);
  const rowKeys = useMemo(() => rows.map((row) => row.key), [rows]);

  // After a deletion commits, slide the rows below into the gap (no-op otherwise).
  useLayoutEffect(playRowShift, [rows]);

  return (
    <CanvasFrame count={fields.length}>
      <SortableContext items={rowKeys} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-3">
          {rows.map((row) => (
            <CanvasRow
              key={row.key}
              row={row}
              openMenuKey={openMenuKey}
              setOpenMenuKey={setOpenMenuKey}
            />
          ))}
        </div>
      </SortableContext>
    </CanvasFrame>
  );
};
