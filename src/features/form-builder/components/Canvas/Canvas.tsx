import { useLayoutEffect, useMemo, useState } from "react";
import { useDndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { noShiftStrategy } from "../../hooks/dnd_config";
import { useFormBuilderContext } from "@/features/form-builder/context/useFormBuilderContext";
import { AreaFooter } from "./AreaFooter";
import { CanvasFrame } from "./CanvasFrame";
import { CanvasRow } from "./CanvasRow";
import { buildRowTree, lastFieldIdIn, type CanvasNode } from "./rowTree";
import { playRowShift } from "./rowShift";
import { groupIntoRows } from "@/utils/rows_helper";

type RowMenu = {
  openMenuKey: string | null;
  setOpenMenuKey: (key: string | null) => void;
};

/**
 * Tabs and sections are drawn as boxes holding their fields. The coloured start edge shows
 * the nesting at any width, so a narrow screen needs no indent to tell the levels apart.
 */
const AREA_STYLES = {
  tab: "border-plum/25 border-s-plum/70 bg-plum/[0.04]",
  section: "border-mauve/25 border-s-mauve/70 bg-mauve/[0.04]",
} as const;

type Area = Extract<CanvasNode, { kind: "area" }>;

/** Subscribes to drag state itself, so only this box re-renders when its header is dragged. */
const AreaBox = ({ area, menu }: { area: Area; menu: RowMenu }) => {
  const { active } = useDndContext();
  // The whole area moves with its header: dim it so that is clear.
  const isMoving = active?.id === area.header.key;

  return (
    <div
      className={`flex flex-col gap-2 rounded-2xl border border-s-4 p-1.5 transition-opacity sm:gap-3 sm:p-2 ${AREA_STYLES[area.type]} ${
        isMoving ? "opacity-50" : ""
      }`}
    >
      <CanvasRow row={area.header} {...menu} />
      <div className="flex flex-col gap-2 sm:gap-3 sm:ps-3">
        <Nodes nodes={area.children} menu={menu} />
      </div>
      {area.end ? (
        <CanvasRow
          row={area.end}
          {...menu}
          footer={
            <AreaFooter
              type={area.type}
              empty={area.children.length === 0}
              anchorId={lastFieldIdIn(area)}
            />
          }
        />
      ) : null}
    </div>
  );
};

const Nodes = ({ nodes, menu }: { nodes: CanvasNode[]; menu: RowMenu }) => (
  <>
    {nodes.map((node) =>
      node.kind === "row" ? (
        <CanvasRow key={node.row.key} row={node.row} {...menu} />
      ) : (
        <AreaBox key={node.header.key} area={node} menu={menu} />
      ),
    )}
  </>
);

export const Canvas = () => {
  const { fields } = useFormBuilderContext();
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);

  const rows = useMemo(() => groupIntoRows(fields), [fields]);
  const rowKeys = useMemo(() => rows.map((row) => row.key), [rows]);
  const tree = useMemo(() => buildRowTree(rows), [rows]);
  const menu = useMemo(() => ({ openMenuKey, setOpenMenuKey }), [openMenuKey]);
  // The `end` of an area is structure, not a field the user added.
  const count = useMemo(() => fields.filter((field) => field.type !== "end").length, [fields]);

  // After a deletion commits, slide the rows below into the gap (no-op otherwise).
  useLayoutEffect(playRowShift, [rows]);

  return (
    <CanvasFrame count={count}>
      <SortableContext items={rowKeys} strategy={noShiftStrategy}>
        <div className="flex flex-col gap-3">
          <Nodes nodes={tree} menu={menu} />
        </div>
      </SortableContext>
    </CanvasFrame>
  );
};
