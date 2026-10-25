import {
  OPTION_FIELD_TYPES,
  type FieldType,
  type InputFieldType,
  type LayoutFieldType,
  type TemporalType,
} from "@/features/form-schema";

export type EditorTab = "general" | "options" | "validation";

export const TAB_LABELS: Record<EditorTab, string> = {
  general: "General",
  options: "Options",
  validation: "Validation",
};

/** Layout and content elements: they carry no value, so they have no label/name/validation. */
const CONTENT_TYPES = new Set<FieldType>([
  "divider",
  "spacer",
  "heading",
  "paragraph",
  "alert",
  "image",
  "button",
] satisfies LayoutFieldType[]);

/** Types that have at least one validation rule worth showing. */
const VALIDATED_TYPES = new Set<FieldType>([
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
  "date",
  "time",
  "datetime",
  "file",
] satisfies InputFieldType[]);

export const TEXT_LENGTH_TYPES = new Set<FieldType>([
  "text",
  "password",
  "textarea",
  "email",
  "tel",
  "url",
]);

export const PATTERN_TYPES = new Set<FieldType>([
  "text",
  "textarea",
  "email",
  "tel",
  "url",
]);

export const isContentType = (type: FieldType) => CONTENT_TYPES.has(type);

export const getEditorTabs = (type: FieldType): EditorTab[] => [
  "general",
  ...(OPTION_FIELD_TYPES.includes(type) ? (["options"] as const) : []),
  ...(VALIDATED_TYPES.has(type) ? (["validation"] as const) : []),
];

type TemporalMeta = {
  inputType: "date" | "time" | "datetime-local";
  /** Used in "Earliest <noun>" / "Latest <noun>". */
  noun: string;
  valueLabel: string;
  defaultLabel: string;
  /** "today" has no meaning for a time-only field. */
  allowToday: boolean;
};

export const TEMPORAL_META: Record<TemporalType, TemporalMeta> = {
  date: {
    inputType: "date",
    noun: "date",
    valueLabel: "Date",
    defaultLabel: "Default date",
    allowToday: true,
  },
  time: {
    inputType: "time",
    noun: "time",
    valueLabel: "Time",
    defaultLabel: "Default time",
    allowToday: false,
  },
  datetime: {
    inputType: "datetime-local",
    noun: "date and time",
    valueLabel: "Date and time",
    defaultLabel: "Default date and time",
    allowToday: true,
  },
};
