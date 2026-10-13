export const FIELD_TYPES = [
  "text",
  "password",
  "textarea",
  "number",
  "email",
  "tel",
  "date",
  "time",
  "color",
  "file",
  "checkbox",
  "select",
  "radiogroup",
  "combobox",
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

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

export type FormField = {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  defaultValue?: string | boolean | number;
  className?: string;
  disabled?: boolean;
  options?: FieldOption[];
  rowNumber?: number;
  validation?: FieldValidation;
};

export type FormSchema = {
  version: 1;
  fields: FormField[];
};

export const INPUT_FIELD_TYPES: FieldType[] = [
  "text",
  "number",
  "date",
  "email",
  "tel",
  "time",
  "color",
  "file",
];

export const OPTION_FIELD_TYPES: FieldType[] = [
  "select",
  "radiogroup",
  "combobox",
];
