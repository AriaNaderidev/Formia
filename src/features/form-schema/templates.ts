import { createFieldFromType, createFieldId } from "./createField";
import type { FieldType, FormField } from "./types";

type TemplateField = { type: FieldType; pairWithPrevious?: boolean } & Partial<
  Omit<FormField, "id" | "type">
>;

export type FormTemplate = {
  id: string;
  title: string;
  description: string;
  fields: TemplateField[];
  /** Saved by the user (and deletable), as opposed to shipped with the app. */
  custom?: boolean;
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
  {
    id: "login",
    title: "Login",
    description: "Email, password and remember me",
    fields: [
      { type: "heading", content: "Welcome back" },
      { type: "email", label: "Email", name: "email" },
      { type: "password", label: "Password", name: "password" },
      {
        type: "checkbox",
        label: "Keep me signed in",
        name: "remember",
        validation: { required: false },
      },
      { type: "button", label: "Sign in", name: "signIn" },
    ],
  },
  {
    id: "newsletter",
    title: "Newsletter",
    description: "Subscribe with topics and consent",
    fields: [
      { type: "heading", content: "Stay in the loop" },
      { type: "paragraph", content: "One email a week. Unsubscribe whenever you like." },
      { type: "text", label: "First name", name: "firstName" },
      { type: "email", label: "Email", name: "email", pairWithPrevious: true },
      {
        type: "checkboxgroup",
        label: "Topics you care about",
        name: "topics",
        options: [
          { label: "Product updates", value: "product" },
          { label: "Tips and guides", value: "tips" },
          { label: "Events", value: "events" },
        ],
      },
      { type: "checkbox", label: "I agree to receive emails", name: "consent" },
    ],
  },
  {
    id: "job-application",
    title: "Job application",
    description: "Contact details, résumé and cover letter",
    fields: [
      { type: "heading", content: "Apply for this role" },
      { type: "text", label: "First name", name: "firstName" },
      { type: "text", label: "Last name", name: "lastName", pairWithPrevious: true },
      { type: "email", label: "Email", name: "email" },
      {
        type: "tel",
        label: "Phone",
        name: "phone",
        pairWithPrevious: true,
        validation: { required: false },
      },
      {
        type: "select",
        label: "Position",
        name: "position",
        options: [
          { label: "Frontend engineer", value: "frontend" },
          { label: "Backend engineer", value: "backend" },
          { label: "Product designer", value: "designer" },
          { label: "Other", value: "other" },
        ],
      },
      {
        type: "number",
        label: "Years of experience",
        name: "experience",
        pairWithPrevious: true,
        validation: { required: true, useMin: true, min: 0, useMax: true, max: 60 },
      },
      {
        type: "url",
        label: "Portfolio or LinkedIn",
        name: "portfolio",
        validation: { required: false },
      },
      { type: "file", label: "Résumé", name: "resume" },
      {
        type: "textarea",
        label: "Cover letter",
        name: "coverLetter",
        rowNumber: 5,
        validation: { required: false },
      },
    ],
  },
  {
    id: "event-registration",
    title: "Event registration",
    description: "Ticket, guests and meal preferences",
    fields: [
      { type: "heading", content: "Register for the event" },
      { type: "text", label: "Full name", name: "fullName" },
      { type: "email", label: "Email", name: "email", pairWithPrevious: true },
      {
        type: "select",
        label: "Ticket type",
        name: "ticketType",
        options: [
          { label: "Standard", value: "standard" },
          { label: "VIP", value: "vip" },
          { label: "Student", value: "student" },
        ],
      },
      {
        type: "number",
        label: "Guests",
        name: "guests",
        defaultValue: 1,
        pairWithPrevious: true,
        validation: { required: true, useMin: true, min: 1, useMax: true, max: 5 },
      },
      {
        type: "radiogroup",
        label: "Meal preference",
        name: "meal",
        options: [
          { label: "Standard", value: "standard" },
          { label: "Vegetarian", value: "vegetarian" },
          { label: "Vegan", value: "vegan" },
        ],
      },
      {
        type: "textarea",
        label: "Accessibility needs",
        name: "accessibility",
        rowNumber: 3,
        validation: { required: false },
      },
    ],
  },
  {
    id: "support-ticket",
    title: "Support ticket",
    description: "Category, priority and details",
    fields: [
      { type: "heading", content: "How can we help?" },
      { type: "email", label: "Your email", name: "email" },
      {
        type: "select",
        label: "Category",
        name: "category",
        options: [
          { label: "Billing", value: "billing" },
          { label: "Bug report", value: "bug" },
          { label: "Account", value: "account" },
          { label: "Something else", value: "other" },
        ],
      },
      {
        type: "radiogroup",
        label: "Priority",
        name: "priority",
        options: [
          { label: "Low", value: "low" },
          { label: "Normal", value: "normal" },
          { label: "Urgent", value: "urgent" },
        ],
      },
      { type: "text", label: "Subject", name: "subject" },
      {
        type: "textarea",
        label: "What happened?",
        name: "description",
        rowNumber: 5,
        validation: { required: true, useMinLength: true, minLength: 20 },
      },
      {
        type: "file",
        label: "Attachment",
        name: "attachment",
        validation: { required: false },
      },
    ],
  },
  {
    id: "appointment",
    title: "Appointment",
    description: "Service, date and contact info",
    fields: [
      { type: "heading", content: "Book an appointment" },
      { type: "text", label: "Full name", name: "fullName" },
      { type: "tel", label: "Phone", name: "phone", pairWithPrevious: true },
      { type: "email", label: "Email", name: "email" },
      {
        type: "select",
        label: "Service",
        name: "service",
        options: [
          { label: "Consultation", value: "consultation" },
          { label: "Follow-up", value: "follow-up" },
          { label: "Full session", value: "session" },
        ],
      },
      { type: "datetime", label: "Preferred date and time", name: "preferredAt" },
      {
        type: "textarea",
        label: "Notes",
        name: "notes",
        rowNumber: 3,
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

/**
 * A template made from fields the user built. Ids are dropped (they are regenerated on use),
 * and rows are expressed as `pairWithPrevious`, the same way the shipped templates do it.
 */
export const templateFromFields = (
  title: string,
  description: string,
  fields: FormField[],
): FormTemplate => ({
  id: createFieldId(),
  title,
  description,
  custom: true,
  fields: fields.map((field, index) => {
    const { rowId, ...rest }: Omit<FormField, "id"> & { id?: string } = structuredClone(field);
    delete rest.id;
    return { ...rest, pairWithPrevious: rowId !== undefined && fields[index - 1]?.rowId === rowId };
  }),
});
