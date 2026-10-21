import type { FormField } from "@/features/form-schema";
import { arrayMove } from "@dnd-kit/sortable";

export const MAX_FIELDS_PER_ROW = 2;

export type InsertPlacement = "below" | "beside";
export type FieldRow = { key: string; fields: FormField[] };

/** Fields without a rowId are simply a row of one. */
export const getRowKey = (field: FormField) => field.rowId ?? field.id;

/** Groups the flat field list into rows (consecutive fields with the same row key). */
export const groupIntoRows = (fields: FormField[]): FieldRow[] => {
  const rows: FieldRow[] = [];

  for (const field of fields) {
    const key = getRowKey(field);
    const last = rows[rows.length - 1];

    if (last && last.key === key && last.fields.length < MAX_FIELDS_PER_ROW) {
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

type InsertOptions = { anchorId: string; placement: InsertPlacement };

/**
 * below:  new field gets its own row, placed after the anchor's whole row.
 * beside: new field joins the anchor's row (falls back to "below" if the row is full).
 */
export const insertField = (
  fields: FormField[],
  newField: FormField,
  { anchorId, placement }: InsertOptions,
): FormField[] => {
  const anchorIndex = fields.findIndex((field) => field.id === anchorId);
  if (anchorIndex === -1) return [...fields, newField];

  const anchor = fields[anchorIndex];
  const row = groupIntoRows(fields).find((r) =>
    r.fields.some((field) => field.id === anchorId),
  );
  if (!row) return [...fields, newField];

  if (placement === "beside" && row.fields.length < MAX_FIELDS_PER_ROW) {
    const rowId = getRowKey(anchor);
    const next = fields.map((field) =>
      field.id === anchorId ? { ...field, rowId } : field,
    );
    next.splice(anchorIndex + 1, 0, { ...newField, rowId });
    return next;
  }

  const lastInRow = row.fields[row.fields.length - 1];
  const insertAt = fields.findIndex((field) => field.id === lastInRow.id) + 1;
  const next = [...fields];
  next.splice(insertAt, 0, { ...newField, rowId: undefined });
  return next;
};

/** Palette drop onto a row: the new field goes in its own row below it. */
export const insertFieldAfterRow = (
  fields: FormField[],
  newField: FormField,
  rowKey: string,
): FormField[] => {
  const row = groupIntoRows(fields).find((r) => r.key === rowKey);
  if (!row) return [...fields, newField];

  return insertField(fields, newField, {
    anchorId: row.fields[row.fields.length - 1].id,
    placement: "below",
  });
};

/** Reorder whole rows. Pairs always stay together. */
export const moveRow = (
  fields: FormField[],
  activeKey: string,
  overKey: string,
): FormField[] => {
  const rows = groupIntoRows(fields);
  const from = rows.findIndex((row) => row.key === activeKey);
  const to = rows.findIndex((row) => row.key === overKey);
  if (from === -1 || to === -1 || from === to) return fields;

  return arrayMove(rows, from, to).flatMap((row) => row.fields);
};
