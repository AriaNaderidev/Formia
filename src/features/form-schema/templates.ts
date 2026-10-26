import { createFieldFromType } from "./createField";
import type { FieldType, FormField } from "./types";

type TemplateField = { type: FieldType; pairWithPrevious?: boolean } & Partial<
  Omit<FormField, "id" | "type">
>;

export type FormTemplate = {
  id: string;
  title: string;
  description: string;
  fields: TemplateField[];
};

export const FORM_TEMPLATES: FormTemplate[] = [
  {
    id: "contact",
    title: "Contact",
    description: "Name, email and a message",
    fields: [
      { type: "heading", content: "Get in touch" },
      { type: "paragraph", content: "We usually reply within one business day." },
      { type: "text", label: "First name", name: "firstName" },
      { type: "text", label: "Last name", name: "lastName", pairWithPrevious: true },
      { type: "email", label: "Email", name: "email" },
      {
        type: "textarea",
        label: "Message",
        name: "message",
        rowNumber: 4,
        validation: { required: true, useMinLength: true, minLength: 10 },
      },
    ],
  },
  {
    id: "signup",
    title: "Sign up",
    description: "Account details and consent",
    fields: [
      { type: "heading", content: "Create your account" },
      { type: "email", label: "Work email", name: "email" },
      {
        type: "password",
        label: "Password",
        name: "password",
        validation: {
          required: true,
          useMinLength: true,
          minLength: 8,
          minLengthMessage: "Use at least 8 characters",
        },
      },
      {
        type: "select",
        label: "Team size",
        name: "teamSize",
        options: [
          { label: "Just me", value: "1" },
          { label: "2–10", value: "2-10" },
          { label: "11–50", value: "11-50" },
          { label: "50+", value: "50+" },
        ],
      },
      { type: "checkbox", label: "I agree to the terms of service", name: "acceptTerms" },
    ],
  },
  {
    id: "feedback",
    title: "Feedback",
    description: "Rating, choices and comments",
    fields: [
      { type: "heading", content: "How did we do?" },
      { type: "rating", label: "Overall experience", name: "rating" },
      {
        type: "radiogroup",
        label: "Would you recommend us?",
        name: "recommend",
        options: [
          { label: "Definitely", value: "yes" },
          { label: "Maybe", value: "maybe" },
          { label: "Not really", value: "no" },
        ],
      },
      {
        type: "textarea",
        label: "Anything we could improve?",
        name: "comments",
        validation: { required: false },
      },
    ],
  },
];

/** A template's fields with fresh ids; `pairWithPrevious` puts two fields in one row. */
export const instantiateTemplate = (template: FormTemplate): FormField[] => {
  const fields: FormField[] = [];

  for (const { type, pairWithPrevious, ...overrides } of template.fields) {
    const field: FormField = { ...createFieldFromType(type, fields), ...overrides };
    const previous = fields[fields.length - 1];
    if (pairWithPrevious && previous) {
      previous.rowId = previous.id;
      field.rowId = previous.id;
    }
    fields.push(field);
  }

  return fields;
};
