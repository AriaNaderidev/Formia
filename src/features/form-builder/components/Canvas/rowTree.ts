import { isContainerStart, type FieldRow } from "@/utils/rows_helper";

/** A row on the canvas, or an area (tab or section) with the nodes inside it. */
export type CanvasNode =
  | { kind: "row"; row: FieldRow }
  | {
      kind: "area";
      type: "tab" | "section";
      header: FieldRow;
      children: CanvasNode[];
      /** The row that closes the area. */
      end: FieldRow | null;
    };

/** Nests the flat row list by its containers, so the canvas can draw each area as a box. */
export const buildRowTree = (rows: FieldRow[]): CanvasNode[] => {
  const root: CanvasNode[] = [];
  const open: Extract<CanvasNode, { kind: "area" }>[] = [];
  const current = () => (open.length > 0 ? open[open.length - 1].children : root);

  for (const row of rows) {
    const { type } = row.fields[0];

    if (type === "end") {
      const area = open.pop();
      if (area) area.end = row;
      else root.push({ kind: "row", row });
    } else if (isContainerStart(type)) {
      const area: Extract<CanvasNode, { kind: "area" }> = {
        kind: "area",
        type: type as "tab" | "section",
        header: row,
        children: [],
        end: null,
      };
      current().push(area);
      open.push(area);
    } else {
      current().push({ kind: "row", row });
    }
  }

  return root;
};

/** The id of the last field before the area's end: new fields are inserted below it. */
export const lastFieldIdIn = (area: Extract<CanvasNode, { kind: "area" }>): string => {
  const last = area.children[area.children.length - 1];
  const row = last
    ? last.kind === "row"
      ? last.row
      : (last.end ?? last.header)
    : area.header;
  return row.fields[row.fields.length - 1].id;
};
