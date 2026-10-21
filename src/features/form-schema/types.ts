export type InputFieldType =
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "tel"
  | "url"
  | "password"
  | "select"
  | "combobox"
  | "multiselect"
  | "radiogroup"
  | "checkbox"
  | "checkboxgroup"
  | "switch"
  | "date"
  | "time"
  | "datetime"
  | "slider"
  | "rating"
  | "color"
  | "file";

export type LayoutFieldType =
  | "grid"
  | "section"
  | "divider"
  | "spacer"
  | "heading"
  | "paragraph"
  | "alert"
  | "image"
  | "button";

export type FieldType = InputFieldType | LayoutFieldType;

export type FieldOption = {
  label: string;
  value: string;
};

export type FieldValidation = {
  required?: boolean;
  requiredMessage?: string;
  useMinLength?: boolean;
  minLength?: number;
  minLengthMessage?: string;
  useMaxLength?: boolean;
  maxLength?: number;
  maxLengthMessage?: string;
  useMin?: boolean;
  min?: number;
  minMessage?: string;
  useMax?: boolean;
  max?: number;
  maxMessage?: string;
  pattern?: string;
  patternMessage?: string;
  maxSize?: number;
  acceptedTypes?: string;
  fileValidationMessage?: string;
};

export type FieldValue = string | boolean | number | string[];

export type HeadingLevel = "h1" | "h2" | "h3" | "h4";
export type AlertSeverity = "info" | "success" | "warning" | "error";
export type ButtonType = "submit" | "reset" | "button";
export type ButtonVariant = "contained" | "outlined" | "text";

export type FormField = {
  id: string;
  name: string;
  /** Optional: layout and content fields (divider, spacer, grid...) have no label. */
  label?: string;
  type: FieldType;
  defaultValue?: FieldValue;
  className?: string;
  disabled?: boolean;
  options?: FieldOption[];
  rowNumber?: number;
  validation?: FieldValidation;

  /** Fields that share a rowId (and sit next to each other) render side by side. */
  rowId?: string;

  /** slider, rating */
  min?: number;
  max?: number;
  step?: number;

  /** grid, section: nested fields */
  children?: FormField[];
  /** grid */
  columns?: number;
  spacing?: number;
  /** section */
  description?: string;
  /** spacer, image */
  height?: number;

  /** heading, paragraph, alert */
  content?: string;
  headingLevel?: HeadingLevel;
  severity?: AlertSeverity;

  /** image */
  src?: string;
  alt?: string;

  /** button */
  buttonType?: ButtonType;
  buttonVariant?: ButtonVariant;
};

export type FormSchema = {
  version: 1;
  fields: FormField[];
};

/** Rendered as a native <input type="..."> */
export const INPUT_FIELD_TYPES: FieldType[] = [
  "text",
  "number",
  "date",
  "email",
  "tel",
  "url",
  "time",
  "color",
  "file",
];

/** Fields that need an `options` list */
export const OPTION_FIELD_TYPES: FieldType[] = [
  "select",
  "radiogroup",
  "combobox",
  "multiselect",
  "checkboxgroup",
];

/** Fields that can hold other fields in `children` */
export const CONTAINER_FIELD_TYPES: FieldType[] = ["grid", "section"];

export const isContainerField = (field: Pick<FormField, "type">) =>
  CONTAINER_FIELD_TYPES.includes(field.type);
