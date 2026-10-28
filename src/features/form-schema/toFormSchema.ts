import { z } from "zod";
import { FIELD_CATALOG } from "./catalog";
import { FIELD_NAME_PATTERN, type FormField, type FormSchema } from "./types";

export const toFormSchema = (fields: FormField[]): FormSchema => ({
  version: 1,
  fields,
});

const KNOWN_TYPES = new Set(FIELD_CATALOG.map((field) => field.type));

/** Just enough structure to trust an imported file; unknown extra keys are kept. */
const importedSchema = z.object({
  version: z.literal(1),
  fields: z.array(
    z.looseObject({
      id: z.string().min(1),
      name: z.string().regex(FIELD_NAME_PATTERN, "Invalid field name"),
      type: z.string().refine((type) => KNOWN_TYPES.has(type as never), {
        message: "Unknown field type",
      }),
    }),
  ),
});

/** Validates an imported schema (e.g. a JSON file exported from this app). */
export const parseFormSchema = (
  input: unknown,
): { ok: true; schema: FormSchema } | { ok: false; error: string } => {
  const result = importedSchema.safeParse(input);
  if (!result.success) {
    const issue = result.error.issues[0];
    return {
      ok: false,
      error: `${issue.path.join(".") || "file"}: ${issue.message}`,
    };
  }
  return { ok: true, schema: result.data as unknown as FormSchema };
};
