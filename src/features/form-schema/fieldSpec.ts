import {
  isTemporalType,
  isValidBound,
  type TemporalType,
} from "./temporalBounds";
import type { FieldType, FormField } from "./types";

/**
 * How a field's value is stored while the form is being filled in.
 *  - string:  plain text, also select / radio / date / time / color
 *  - number:  a text input whose raw value is a string, parsed to a number on submit
 *  - range:   slider / rating, always a number
 *  - boolean: checkbox / switch
 *  - array:   multi-select / checkbox group (selected option values)
 *  - files:   File[]
 */
export type ValueKind =
  | "string"
  | "number"
  | "range"
  | "boolean"
  | "array"
  | "files";

export type Rule<T> = { value: T; message: string };

/**
 * The single, library-agnostic description of a field's value and its rules.
 * Both the live preview (runtime Zod) and the code generator (Zod / Yup source) read it,
 * so what you test in the preview is exactly what you ship.
 */
export type FieldSpec = {
  field: FormField;
  name: string;
  label: string;
  kind: ValueKind;
  /** Error message when the field is required, undefined when it is optional. */
  required?: string;
  format?: Rule<"email" | "url">;
  minLength?: Rule<number>;
  maxLength?: Rule<number>;
  pattern?: Rule<string>;
  min?: Rule<number>;
  max?: Rule<number>;
  /** Raw bounds, may hold the "today" token. */
  temporal?: {
    type: TemporalType;
    earliest?: Rule<string>;
    latest?: Rule<string>;
  };
  file?: { maxSizeMb?: number; accept?: string[]; message: string };
};

const KIND_BY_TYPE: Partial<Record<FieldType, ValueKind>> = {
  number: "number",
  slider: "range",
  rating: "range",
  checkbox: "boolean",
  switch: "boolean",
  multiselect: "array",
  checkboxgroup: "array",
  file: "files",
};

/** Types that hold a value. Everything else is layout or content. */
const VALUE_TYPES = new Set<FieldType>([
  "text",
  "textarea",
  "number",
  "email",
  "tel",
  "url",
  "password",
  "select",
  "combobox",
  "multiselect",
  "radiogroup",
  "checkbox",
  "checkboxgroup",
  "switch",
  "date",
  "time",
  "datetime",
  "slider",
  "rating",
  "color",
  "file",
]);

export const isValueField = (field: FormField) => VALUE_TYPES.has(field.type);

const TEXT_CHECK_TYPES = new Set<FieldType>([
  "text",
  "textarea",
  "email",
  "tel",
  "url",
  "password",
]);

const DEFAULT_MESSAGES = {
  required: "This field is required",
  email: "Enter a valid email address",
  url: "Enter a valid URL",
  pattern: "Invalid format",
  file: "This file is not allowed",
};

/** A user-typed regex can be invalid; an invalid one is skipped instead of crashing the form. */
const isValidPattern = (pattern: string) => {
  try {
    new RegExp(pattern);
    return true;
  } catch {
    return false;
  }
};

const splitAccept = (accept?: string) =>
  accept
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const toFieldSpec = (field: FormField): FieldSpec => {
  const rules = field.validation ?? {};
  const kind = KIND_BY_TYPE[field.type] ?? "string";
  const spec: FieldSpec = {
    field,
    name: field.name,
    label: field.label ?? field.name,
    kind,
  };

  // A switch is either on or off; "required" would mean "must be on", which no form wants.
  if (rules.required && field.type !== "switch" && field.type !== "slider") {
    spec.required = rules.requiredMessage || DEFAULT_MESSAGES.required;
  }

  if (field.type === "email" || field.type === "url") {
    spec.format = {
      value: field.type,
      message: DEFAULT_MESSAGES[field.type],
    };
  }

  if (TEXT_CHECK_TYPES.has(field.type)) {
    if (rules.useMinLength && rules.minLength != null) {
      spec.minLength = {
        value: rules.minLength,
        message:
          rules.minLengthMessage || `Minimum ${rules.minLength} characters`,
      };
    }
    if (rules.useMaxLength && rules.maxLength != null) {
      spec.maxLength = {
        value: rules.maxLength,
        message:
          rules.maxLengthMessage || `Maximum ${rules.maxLength} characters`,
      };
    }
    if (rules.pattern && isValidPattern(rules.pattern)) {
      spec.pattern = {
        value: rules.pattern,
        message: rules.patternMessage || DEFAULT_MESSAGES.pattern,
      };
    }
  }

  if (field.type === "number") {
    if (rules.useMin && rules.min != null) {
      spec.min = {
        value: rules.min,
        message: rules.minMessage || `Minimum value is ${rules.min}`,
      };
    }
    if (rules.useMax && rules.max != null) {
      spec.max = {
        value: rules.max,
        message: rules.maxMessage || `Maximum value is ${rules.max}`,
      };
    }
  }

  if (isTemporalType(field.type)) {
    const temporal: NonNullable<FieldSpec["temporal"]> = { type: field.type };
    if (rules.useMin && isValidBound(field.type, rules.dateTimeEarliest)) {
      temporal.earliest = {
        value: rules.dateTimeEarliest,
        message: rules.minMessage || "This is too early",
      };
    }
    if (rules.useMax && isValidBound(field.type, rules.dateTimeLatest)) {
      temporal.latest = {
        value: rules.dateTimeLatest,
        message: rules.maxMessage || "This is too late",
      };
    }
    if (temporal.earliest || temporal.latest) spec.temporal = temporal;
  }

  if (field.type === "file") {
    const accept = splitAccept(rules.acceptedTypes);
    if (rules.maxSize || accept?.length) {
      spec.file = {
        maxSizeMb: rules.maxSize || undefined,
        accept: accept?.length ? accept : undefined,
        message: rules.fileValidationMessage || DEFAULT_MESSAGES.file,
      };
    }
  }

  return spec;
};

export const toFieldSpecs = (fields: FormField[]) =>
  fields.filter(isValueField).map(toFieldSpec);

/* ---------- default values ---------- */

export type FormValue = string | number | boolean | string[] | File[];

export const getDefaultValue = ({ field, kind }: FieldSpec): FormValue => {
  const value = field.defaultValue;

  switch (kind) {
    case "number":
      return value === undefined || value === "" ? "" : String(value);
    case "range":
      return typeof value === "number" ? value : (field.min ?? 0);
    case "boolean":
      return Boolean(value);
    case "array":
      return Array.isArray(value) ? [...value] : [];
    case "files":
      return [];
    default:
      if (field.type === "color") return String(value || "#000000");
      return value == null ? "" : String(value);
  }
};

export const getDefaultValues = (specs: FieldSpec[]) =>
  Object.fromEntries(specs.map((spec) => [spec.name, getDefaultValue(spec)]));

/* ---------- file matching (shared by runtime validation and generated code) ---------- */

/** `accept` entries look like ".pdf", "image/*" or "application/json". */
export const acceptsFile = (
  file: { name: string; type: string },
  accept: string[],
) =>
  accept.some((rule) => {
    const pattern = rule.toLowerCase();
    if (pattern.startsWith(".")) return file.name.toLowerCase().endsWith(pattern);
    if (pattern.endsWith("/*")) return file.type.startsWith(pattern.slice(0, -1));
    return file.type === pattern;
  });
