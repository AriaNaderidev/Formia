import type { FieldType, FormField } from "./types";

export const paletteId = (type: FieldType) => `palette:${type}`;

export const isPaletteId = (id: string | number) =>
  String(id).startsWith("palette:");

/* ---------- shared defaults ---------- */

const BASE = { defaultValue: "", disabled: false, className: "" } as const;
const LAYOUT_BASE = { className: "" } as const;

const REQUIRED = { required: true };
const TEXT_RULES = { required: true, useMinLength: false, useMaxLength: false };
const NUMBER_RULES = { ...TEXT_RULES, useMin: false, useMax: false };
const TEMPORAL_RULES = { required: true, useMin: false, useMax: false };

type FieldDraft = Omit<FormField, "id" | "type">;

const field = (type: FieldType, draft: FieldDraft): FormField => ({
  id: paletteId(type),
  type,
  ...draft,
});

/* ---------- catalog ---------- */

export const FIELD_CATALOG: FormField[] = [
  /* Text */
  field("text", {
    ...BASE,
    name: "Text",
    label: "Username",
    validation: TEXT_RULES,
  }),
  field("textarea", {
    ...BASE,
    name: "Textarea",
    label: "Bio",
    rowNumber: 3,
    validation: TEXT_RULES,
  }),
  field("number", {
    ...BASE,
    name: "Number",
    label: "Age",
    validation: NUMBER_RULES,
  }),
  field("email", {
    ...BASE,
    name: "Email",
    label: "Email",
    validation: REQUIRED,
  }),
  field("tel", {
    ...BASE,
    name: "Tel",
    label: "Phone",
    validation: TEXT_RULES,
  }),
  field("url", {
    ...BASE,
    name: "Url",
    label: "Website",
    validation: REQUIRED,
  }),
  field("password", {
    ...BASE,
    name: "Password",
    label: "Password",
    validation: TEXT_RULES,
  }),

  /* Choice */
  field("select", {
    ...BASE,
    name: "Select",
    label: "Email",
    validation: REQUIRED,
    options: [
      { label: "aria45@gmail.com", value: "aria45@gmail.com" },
      { label: "test@gmail.com", value: "test@gmail.com" },
      { label: "mmd88@gmail.com", value: "mmd88@gmail.com" },
    ],
  }),
  field("combobox", {
    ...BASE,
    name: "Combobox",
    label: "Language",
    validation: REQUIRED,
    options: [
      { label: "Persian", value: "Persian" },
      { label: "English (US)", value: "English(US)" },
      { label: "English (UK)", value: "English(UK)" },
      { label: "Italian", value: "Italian" },
      { label: "French", value: "French" },
      { label: "German", value: "German" },
    ],
  }),
  field("multiselect", {
    ...BASE,
    name: "Multiselect",
    label: "Interests",
    defaultValue: [],
    validation: REQUIRED,
    options: [
      { label: "Design", value: "design" },
      { label: "Development", value: "development" },
      { label: "Music", value: "music" },
    ],
  }),
  field("radiogroup", {
    ...BASE,
    name: "Radiogroup",
    label: "Gender",
    validation: REQUIRED,
    options: [
      { label: "Female", value: "female" },
      { label: "Male", value: "male" },
      { label: "Other", value: "other" },
    ],
  }),
  field("checkbox", {
    ...BASE,
    name: "Checkbox",
    label: "I agree to the terms",
    defaultValue: false,
    validation: REQUIRED,
  }),
  field("checkboxgroup", {
    ...BASE,
    name: "Checkboxgroup",
    label: "Notifications",
    defaultValue: [],
    validation: REQUIRED,
    options: [
      { label: "Email", value: "email" },
      { label: "SMS", value: "sms" },
      { label: "Push", value: "push" },
    ],
  }),
  field("switch", {
    ...BASE,
    name: "Switch",
    label: "Enable notifications",
    defaultValue: false,
    validation: { required: false },
  }),

  /* Date & time */
  field("date", {
    ...BASE,
    name: "Date",
    label: "Date of birth",
    validation: TEMPORAL_RULES,
  }),
  field("time", {
    ...BASE,
    name: "Time",
    label: "Select a time",
    validation: TEMPORAL_RULES,
  }),
  field("datetime", {
    ...BASE,
    name: "Datetime",
    label: "Appointment",
    validation: TEMPORAL_RULES,
  }),

  /* Rich inputs */
  field("slider", {
    ...BASE,
    name: "Slider",
    label: "Budget",
    defaultValue: 50,
    min: 0,
    max: 100,
    step: 1,
    validation: { required: false },
  }),
  field("rating", {
    ...BASE,
    name: "Rating",
    label: "How was your experience?",
    defaultValue: 0,
    max: 5,
    validation: REQUIRED,
  }),
  field("color", {
    ...BASE,
    name: "Color",
    label: "Pick a color",
    defaultValue: "#000000",
    validation: REQUIRED,
  }),
  field("file", {
    ...BASE,
    name: "File",
    label: "Select your file",
    validation: REQUIRED,
  }),

  /* Layout (containers + spacing) */
  field("divider", { ...LAYOUT_BASE, name: "Divider" }),
  field("spacer", { ...LAYOUT_BASE, name: "Spacer", height: 24 }),

  /* Content */
  field("heading", {
    ...LAYOUT_BASE,
    name: "Heading",
    content: "Heading",
    headingLevel: "h2",
  }),
  field("paragraph", {
    ...LAYOUT_BASE,
    name: "Paragraph",
    content: "Add helpful context for the person filling out this form.",
  }),
  field("alert", {
    ...LAYOUT_BASE,
    name: "Alert",
    content: "Important information goes here.",
    severity: "info",
  }),
  field("image", {
    ...LAYOUT_BASE,
    name: "Image",
    src: "",
    alt: "",
    height: 160,
  }),

  /* Actions */
  field("button", {
    ...LAYOUT_BASE,
    name: "Button",
    label: "Submit",
    buttonType: "submit",
    buttonVariant: "contained",
  }),
];

export const getCatalogField = (id: string) =>
  FIELD_CATALOG.find((f) => f.id === id);
