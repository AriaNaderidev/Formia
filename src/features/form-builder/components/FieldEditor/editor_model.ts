import type { ControllerProps, Path } from "react-hook-form";
import {
  OPTION_FIELD_TYPES,
  type FieldOption,
  type FormField,
} from "@/features/form-schema";

/**
 * Values edited in the dialog. `children` is left out: it is recursive (which breaks
 * react-hook-form's Path type) and is never edited here. `id` and `rowId` belong to the canvas.
 */
export type EditorValues = Omit<FormField, "children" | "id" | "rowId">;
export type FieldPath = Path<EditorValues>;
export type FieldRules = ControllerProps<EditorValues, FieldPath>["rules"];

export const toEditorValues = (field: FormField): EditorValues => {
  const copy: Partial<FormField> = structuredClone(field);
  delete copy.id;
  delete copy.rowId;
  delete copy.children;
  return copy as EditorValues;
};

/** Unicode-aware, so Persian labels produce readable values too. */
export const slugify = (text: string) =>
  text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

const cleanOptions = (options: FieldOption[] = []): FieldOption[] => {
  const used = new Set<string>();

  return options
    .filter((option) => option.label?.trim())
    .map((option, index) => {
      const base =
        option.value?.trim() ||
        slugify(option.label) ||
        `option-${index + 1}`;

      let value = base;
      let suffix = 2;
      while (used.has(value)) value = `${base}-${suffix++}`;
      used.add(value);

      return { label: option.label.trim(), value };
    });
};

/** A default that points at a deleted option would break the field. */
const sanitizeDefault = (
  value: EditorValues["defaultValue"],
  options: FieldOption[],
): EditorValues["defaultValue"] => {
  const allowed = new Set(options.map((option) => option.value));
  if (Array.isArray(value)) return value.filter((item) => allowed.has(item));
  if (typeof value === "string" && !allowed.has(value)) return "";
  return value;
};

const RULE_PAIRS = [
  ["useMinLength", "minLength"],
  ["useMaxLength", "maxLength"],
  ["useMin", "min"],
  ["useMax", "max"],
] as const;

/** A rule that is switched on but has no value would never validate anything. */
const cleanValidation = (validation: EditorValues["validation"]) => {
  if (!validation) return validation;
  const next = { ...validation };
  for (const [use, value] of RULE_PAIRS) {
    if (next[use] && next[value] === undefined) next[use] = false;
  }
  return next;
};

export const cleanEditorValues = (values: EditorValues): EditorValues => {
  const next: EditorValues = {
    ...values,
    name: values.name.trim(),
    validation: cleanValidation(values.validation),
  };

  if (OPTION_FIELD_TYPES.includes(next.type)) {
    const options = cleanOptions(next.options);
    next.options = options;
    next.defaultValue = sanitizeDefault(next.defaultValue, options);
  }

  return next;
};