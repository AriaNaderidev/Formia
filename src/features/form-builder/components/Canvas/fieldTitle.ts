import type { FormField } from "@/features/form-schema";
import { PALETTE_META } from "../Palette/palette_config";

/** What a field is called in the UI. Content elements have no name; their text says more than their type. */
export const getFieldTitle = (field: FormField) =>
  field.name || field.content?.trim() || PALETTE_META[field.type].title;
