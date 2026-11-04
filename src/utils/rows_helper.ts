import type { FieldType, FormField } from "@/features/form-schema";

export const MAX_FIELDS_PER_ROW = 2;

export type InsertPlacement = "below" | "beside";
export type FieldRow = { key: string; fields: FormField[] };

/** Elements that always take a whole row: nothing can sit beside them. */
const FULL_WIDTH_TYPES = new Set<FieldType>([
  "tab",
  "section",
  "end",
  "heading",
  "divider",
  "alert",
]);

export const isFullWidth = (type: FieldType) => FULL_WIDTH_TYPES.has(type);

/** Fields without a rowId are simply a row of one. */
export const getRowKey = (field: FormField) => field.rowId ?? field.id;

const canJoin = (row: FieldRow, field: FormField) =>
  row.fields.length < MAX_FIELDS_PER_ROW &&
  !isFullWidth(field.type) &&
  !row.fields.some((item) => isFullWidth(item.type));

/** Groups the flat field list into rows (consecutive fields with the same row key). */
export const groupIntoRows = (fields: FormField[]): FieldRow[] => {
  const rows: FieldRow[] = [];

  for (const field of fields) {
    const key = getRowKey(field);
    const last = rows[rows.length - 1];

    if (last && last.key === key && canJoin(last, field)) {
      last.fields.push(field);
    } else {
      // `field.id` fallback keeps row keys unique if a row ever overflows.
      rows.push({
        key: last && last.key === key ? field.id : key,
        fields: [field],
      });
    }
  }

  return rows;
};

/* ---------- tabs and sections ---------- */

/**
 * A tab or a section is an area: the container, the fields after it, and the `end` that
 * closes it. Order alone says what is inside, so dragging a row between the two puts it
 * in the area and dragging it out takes it out.
 */
export const isContainerStart = (type: FieldType) => type === "tab" || type === "section";

/** Index of the `end` that closes the container at `startIndex`, or -1. */
export const findContainerEnd = (fields: FormField[], startIndex: number): number => {
  let depth = 0;
  for (let index = startIndex; index < fields.length; index++) {
    const { type } = fields[index];
    if (isContainerStart(type)) depth++;
    else if (type === "end" && --depth === 0) return index;
  }
  return -1;
};

const makeEnd = (): FormField => ({ id: crypto.randomUUID(), name: "end", type: "end" });

/**
 * Keeps areas well formed: a tab holds sections, a section holds fields.
 *  - a tab closes whatever is open before it, a section closes an open section
 *  - an `end` with nothing to close is dropped, and anything still open is closed at the end
 * This also reads forms saved before areas existed, where a marker ran to the next marker.
 * Returns the same array when nothing needs fixing.
 */
export const normalizeContainers = (fields: FormField[]): FormField[] => {
  const result: FormField[] = [];
  const open: FieldType[] = [];
  let changed = false;

  const close = () => {
    open.pop();
    result.push(makeEnd());
    changed = true;
  };

  for (const field of fields) {
    if (field.type === "tab") {
      while (open.length > 0) close();
    } else if (field.type === "section" && open[open.length - 1] === "section") {
      close();
    }

    if (field.type === "end") {
      if (open.length === 0) {
        changed = true;
      } else {
        open.pop();
        result.push(field);
      }
      continue;
    }

    if (isContainerStart(field.type)) open.push(field.type);
    result.push(field);
  }
  while (open.length > 0) close();

  return changed ? result : fields;
};

/**
 * Where a new tab or section may go. Inside a section a section would be nested, and inside
 * any area a tab would be: the new one is put after the area it landed in instead.
 */
const containerSafeIndex = (fields: FormField[], index: number, type: FieldType) => {
  const open: number[] = [];
  for (let i = 0; i < index; i++) {
    if (isContainerStart(fields[i].type)) open.push(i);
    else if (fields[i].type === "end") open.pop();
  }

  const blocking =
    type === "tab"
      ? open[0]
      : type === "section" && fields[open[open.length - 1]]?.type === "section"
        ? open[open.length - 1]
        : undefined;
  if (blocking === undefined) return index;

  const end = findContainerEnd(fields, blocking);
  return end === -1 ? index : end + 1;
};

/* ---------- inserting ---------- */

type InsertOptions = { anchorId: string; placement: InsertPlacement };

/** A new field, or the fields a palette item adds (a tab or section comes with its `end`). */
type NewFields = FormField | FormField[];

const toList = (newFields: NewFields) => (Array.isArray(newFields) ? newFields : [newFields]);

/** Splices a field (or group of fields) in as their own row at `index`. */
const spliceAsRow = (fields: FormField[], index: number, newFields: NewFields) => {
  const list = toList(newFields).map((field) => ({ ...field, rowId: undefined }));
  const at = isContainerStart(list[0].type) ? containerSafeIndex(fields, index, list[0].type) : index;
  const next = [...fields];
  next.splice(at, 0, ...list);
  return next;
};

/**
 * below:  new field gets its own row, placed after the anchor's whole row.
 * beside: new field joins the anchor's row. Falls back to "below" when the row is
 *         full, or when either side is a full-width element.
 */
export const insertField = (
  fields: FormField[],
  newFields: NewFields,
  { anchorId, placement }: InsertOptions,
): FormField[] => {
  const list = toList(newFields);
  const anchorIndex = fields.findIndex((field) => field.id === anchorId);
  if (anchorIndex === -1) return [...fields, ...list];

  const anchor = fields[anchorIndex];
  const row = groupIntoRows(fields).find((r) =>
    r.fields.some((field) => field.id === anchorId),
  );
  if (!row) return [...fields, ...list];

  if (placement === "beside" && list.length === 1 && canJoin(row, list[0])) {
    const rowId = getRowKey(anchor);
    const next = fields.map((field) =>
      field.id === anchorId ? { ...field, rowId } : field,
    );
    next.splice(anchorIndex + 1, 0, { ...list[0], rowId });
    return next;
  }

  const lastInRow = row.fields[row.fields.length - 1];
  return spliceAsRow(fields, fields.findIndex((field) => field.id === lastInRow.id) + 1, list);
};

/** Palette drop onto a row: the new field goes in its own row below it. */
export const insertFieldAfterRow = (
  fields: FormField[],
  newFields: NewFields,
  rowKey: string,
): FormField[] => {
  const row = groupIntoRows(fields).find((r) => r.key === rowKey);
  if (!row) return [...fields, ...toList(newFields)];

  return insertField(fields, newFields, {
    anchorId: row.fields[row.fields.length - 1].id,
    placement: "below",
  });
};

/** Palette drop onto the upper half of a row: the new field goes in its own row above it. */
export const insertFieldBeforeRow = (
  fields: FormField[],
  newFields: NewFields,
  rowKey: string,
): FormField[] => {
  const row = groupIntoRows(fields).find((r) => r.key === rowKey);
  if (!row) return [...fields, ...toList(newFields)];

  return spliceAsRow(
    fields,
    fields.findIndex((field) => field.id === row.fields[0].id),
    newFields,
  );
};

/* ---------- moving ---------- */

/** The last row of the area that starts at `rows[from]`, or `from` when it has no `end`. */
const areaEndRow = (rows: FieldRow[], fields: FormField[], from: number) => {
  const startIndex = fields.findIndex((field) => field.id === rows[from].fields[0].id);
  const end = findContainerEnd(fields, startIndex);
  if (end === -1) return from;
  const endId = fields[end].id;
  return rows.findIndex((row) => row.fields.some((field) => field.id === endId));
};

/**
 * Moves a row next to another: just above it or just below it. Pairs always stay together,
 * and an area moves as one block: its container, everything inside it and its `end`.
 * Dropped onto the row above an `end`, a row lands inside that area; below it, outside.
 */
export const moveRow = (
  fields: FormField[],
  activeKey: string,
  overKey: string,
  side: "above" | "below",
): FormField[] => {
  const rows = groupIntoRows(fields);
  const from = rows.findIndex((row) => row.key === activeKey);
  const to = rows.findIndex((row) => row.key === overKey);
  if (from === -1 || to === -1 || from === to) return fields;

  const first = rows[from].fields[0];
  // An `end` belongs to its container: it never moves on its own.
  if (first.type === "end") return fields;

  // A single row, or the whole area when a tab or section is moved.
  const last = isContainerStart(first.type) ? areaEndRow(rows, fields, from) : from;
  if (to >= from && to <= last) return fields; // dropped on itself or inside itself

  const moving = rows.slice(from, last + 1);
  const rest = [...rows.slice(0, from), ...rows.slice(last + 1)];
  const target = rest.indexOf(rows[to]);
  rest.splice(side === "below" ? target + 1 : target, 0, ...moving);

  const next = rest.flatMap((row) => row.fields);
  // Dropping a row back where it already was changes nothing: keep the same array.
  return next.every((field, index) => field === fields[index]) ? fields : next;
};

/** Moves the row holding `fieldId` up (-1) or down (+1). Returns the same array at either end. */
export const shiftRowOf = (
  fields: FormField[],
  fieldId: string,
  delta: -1 | 1,
): FormField[] => {
  const rows = groupIntoRows(fields);
  const from = rows.findIndex((row) =>
    row.fields.some((field) => field.id === fieldId),
  );
  if (from === -1) return fields;

  // An area steps over the row beyond it, not over its own first row.
  const beyond =
    delta > 0 && isContainerStart(rows[from].fields[0].type)
      ? areaEndRow(rows, fields, from) + 1
      : from + delta;
  const target = rows[beyond];
  if (!target) return fields;

  return moveRow(fields, rows[from].key, target.key, delta > 0 ? "below" : "above");
};

/**
 * Safety net: brings the list into the canonical shape.
 *  - a row of two shares a rowId equal to its first field's id
 *  - a row of one has no rowId
 * Row keys are therefore always unique, even if some code path split a pair apart.
 * Returns the same array (and the same field objects) when nothing needs fixing.
 */
export const normalizeRows = (fields: FormField[]): FormField[] => {
  let changed = false;

  const next = groupIntoRows(fields).flatMap((row) => {
    const rowId = row.fields.length > 1 ? row.fields[0].id : undefined;

    return row.fields.map((field) => {
      if (field.rowId === rowId) return field;
      changed = true;
      return { ...field, rowId };
    });
  });

  return changed ? next : fields;
};

/**
 * Column weights for a row of two. A submit button beside another element gets twice
 * its width, so the main action stays the biggest target. Otherwise the halves are equal.
 */
export const rowWeights = (fields: FormField[]): [number, number] | null => {
  if (fields.length !== 2) return null;
  const [first, second] = fields.map(
    (field) => field.type === "button" && (field.buttonType ?? "submit") === "submit",
  );
  if (first === second) return null;
  return first ? [2, 1] : [1, 2];
};
