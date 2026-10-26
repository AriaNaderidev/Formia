import { getCatalogField, paletteId } from "./catalog";
import type { FieldType, FormField } from "./types";

export const createFieldId = () => crypto.randomUUID();

/** "Date of birth" -> "dateOfBirth". Falls back to "" for labels with no ASCII letters. */
const toCamelCase = (text: string) =>
  text
    .normalize("NFKD")
    .replace(/[^A-Za-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word, index) =>
      index === 0
        ? word.toLowerCase()
        : word[0].toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join("")
    .replace(/^\d+/, "");

/**
 * Field names become object keys in the submitted data and the generated code,
 * so they should read well and never collide: "email", then "email2", "email3"...
 */
const uniqueName = (base: string, taken: Set<string>) => {
  if (!taken.has(base)) return base;
  let suffix = 2;
  while (taken.has(`${base}${suffix}`)) suffix++;
  return `${base}${suffix}`;
};

/**
 * @param existing the fields already in the form, used to keep names unique.
 */
export const createFieldFromType = (
  type: FieldType,
  existing: readonly FormField[] = [],
): FormField => {
  const template = getCatalogField(paletteId(type));

  if (!template) {
    throw new Error(`Unknown field type: ${type}`);
  }

  const taken = new Set(existing.map((field) => field.name));
  const base = toCamelCase(template.label ?? "") || template.type;

  return {
    ...structuredClone(template),
    id: createFieldId(),
    name: uniqueName(base, taken),
  };
};
