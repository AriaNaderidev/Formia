import type { FormField, FormSchema } from "./types";

export const toFormSchema = (fields: FormField[]): FormSchema => ({
  version: 1,
  fields,
});
