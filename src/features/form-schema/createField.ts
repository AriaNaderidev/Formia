import { getCatalogField, paletteId } from "./catalog";
import type { FieldType, FormField } from "./types";

export const createFieldId = () => crypto.randomUUID();

export const createFieldFromType = (type: FieldType): FormField => {
  const template = getCatalogField(paletteId(type));

  if (!template) {
    throw new Error(`Unknown field type: ${type}`);
  }

  const id = createFieldId();

  return {
    ...structuredClone(template),
    id,
    name: `${template.type}_${id.slice(0, 8)}`,
  };
};
