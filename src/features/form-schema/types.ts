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
  | "tab"
  | "section"
  /** Closes the nearest open tab or section. Never shown in the palette. */
  | "end"
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
  dateTimeEarliest?: string;
  dateTimeLatest?: string;
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

/** Each action looks different by default: filled to submit, outlined to reset, text for the rest. */
export const BUTTON_VARIANT_BY_TYPE: Record<ButtonType, ButtonVariant> = {
  submit: "contained",
  reset: "outlined",
  button: "text",
};

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

  /** date, time, datetime: the hint shown while the field is empty. */
  placeholder?: string;

  /** slider, rating */
  min?: number;
  max?: number;
  step?: number;

  /** spacer, image */
  height?: number;

  /** heading, paragraph, alert; the description of a section. */
  content?: string;
  headingLevel?: HeadingLevel;
  severity?: AlertSeverity;

  /** image */
  src?: string;
  alt?: string;

  /** tab: text of its Next and Previous buttons. Defaults to "Next" / "Previous". */
  nextLabel?: string;
  previousLabel?: string;

  /** button */
  buttonType?: ButtonType;
  buttonVariant?: ButtonVariant;
};

/**
 * Field names become object keys, HTML ids and JSX attributes in generated code,
 * so they are limited to characters that are safe in all three.
 */
export const FIELD_NAME_PATTERN = /^[A-Za-z_$][\w$-]*$/;

/** Reading direction of the form. `rtl` is for Persian, Arabic and Hebrew forms. */
export type FormDirection = "ltr" | "rtl";

export type FormSchema = {
  version: 1;
  fields: FormField[];
  /** Left out when `ltr`. */
  direction?: FormDirection;
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
