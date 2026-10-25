import type { ControllerProps, Path } from "react-hook-form";
import {
  OPTION_FIELD_TYPES,
  boundsAreOrdered,
  getActiveBounds,
  isTemporalType,
  isValidBound,
  type FieldOption,
  type FieldType,
  type FormField,
  type TemporalType,
} from "@/features/form-schema";

/**
 * Values edited in the dialog. `children` is left out: it is recursive (which breaks
 * react-hook-form's Path type) and is never edited here. `id` and `rowId` belong to the canvas.
 */
export type EditorValues = Omit<FormField, "children" | "id" | "rowId">;
export type FieldPath = Path<EditorValues>;
export type FieldRules = ControllerProps<EditorValues, FieldPath>["rules"];

type Validation = NonNullable<EditorValues["validation"]>;

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
        option.value?.trim() || slugify(option.label) || `option-${index + 1}`;

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

const NUMERIC_RULE_PAIRS = [
  ["useMinLength", "minLength"],
  ["useMaxLength", "maxLength"],
  ["useMin", "min"],
  ["useMax", "max"],
] as const;

/**
 * Date / time / datetime: useMin and useMax belong to the temporal bounds here.
 * A stored bound that doesn't fit the field type (e.g. a date left over after
 * switching the field to "time", or "today" on a time field) is dropped and its
 * rule switched off.
 */
const cleanTemporal = (
  type: TemporalType,
  validation: Validation,
): Validation => {
  const next = { ...validation };

  if (!isValidBound(type, next.dateTimeEarliest)) {
    delete next.dateTimeEarliest;
    next.useMin = false;
  }
  if (!isValidBound(type, next.dateTimeLatest)) {
    delete next.dateTimeLatest;
    next.useMax = false;
  }
  return next;
};

/** Every other type: temporal bounds are meaningless, and a rule with no value is off. */
const cleanNumeric = (validation: Validation): Validation => {
  const next = { ...validation };
  delete next.dateTimeEarliest;
  delete next.dateTimeLatest;

  for (const [use, value] of NUMERIC_RULE_PAIRS) {
    if (next[use] && next[value] === undefined) next[use] = false;
  }
  return next;
};

const cleanValidation = (
  type: FieldType,
  validation: EditorValues["validation"],
) => {
  if (!validation) return validation;
  return isTemporalType(type)
    ? cleanTemporal(type, validation)
    : cleanNumeric(validation);
};

export const cleanEditorValues = (values: EditorValues): EditorValues => {
  const next: EditorValues = {
    ...values,
    name: values.name.trim(),
    validation: cleanValidation(values.type, values.validation),
  };

  if (OPTION_FIELD_TYPES.includes(next.type)) {
    const options = cleanOptions(next.options);
    next.options = options;
    next.defaultValue = sanitizeDefault(next.defaultValue, options);
  }

  return next;
};

/** react-hook-form `validate` helper: "latest" must not come before "earliest". */
export const boundsOrderError = (values: EditorValues): true | string => {
  if (!isTemporalType(values.type)) return true;
  return (
    boundsAreOrdered(getActiveBounds(values.type, values.validation)) ||
    "Latest must not be before earliest"
  );
};
