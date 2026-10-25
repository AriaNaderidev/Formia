import { z, type ZodTypeAny } from "zod";
import type { FormField } from "./types";
import {
  getTemporalError,
  isTemporalType,
  type TemporalType,
} from "./temporalBounds";

export const buildZodSchema = (fields: FormField[]) => {
  const shape: Record<string, ZodTypeAny> = {};

  for (const field of fields) {
    const rules = field.validation ?? {};
    let schema: ZodTypeAny;

    switch (field.type) {
      case "number":
        schema = z.coerce.number();
        break;
      case "checkbox":
        schema = z.boolean();
        break;
      case "file":
        schema = z.any();
        break;
      default:
        schema = z.string();
    }

    if (rules.required) {
      const message = rules.requiredMessage || "This field is required";

      switch (field.type) {
        case "checkbox":
          schema = schema.refine((value) => value === true, { message });
          break;
        case "file":
          schema = schema.refine(
            (value) => value instanceof FileList && value.length > 0,
            { message },
          );
          break;
        case "number":
          schema = (schema as z.ZodNumber).refine(
            (value) => !Number.isNaN(value),
            { message },
          );
          break;
        default:
          schema = (schema as z.ZodString).min(1, message);
      }
    }

    if (
      field.type !== "number" &&
      field.type !== "checkbox" &&
      field.type !== "file"
    ) {
      if (rules.useMinLength && rules.minLength != null) {
        schema = (schema as z.ZodString).min(
          rules.minLength,
          rules.minLengthMessage || `Minimum ${rules.minLength} characters`,
        );
      }

      if (rules.useMaxLength && rules.maxLength != null) {
        schema = (schema as z.ZodString).max(
          rules.maxLength,
          rules.maxLengthMessage || `Maximum ${rules.maxLength} characters`,
        );
      }

      if (rules.pattern) {
        schema = (schema as z.ZodString).regex(
          new RegExp(rules.pattern),
          rules.patternMessage || "Invalid format",
        );
      }
    }

    if (field.type === "number") {
      if (rules.useMin && rules.min != null) {
        schema = (schema as z.ZodNumber).min(
          rules.min,
          rules.minMessage || `Minimum value is ${rules.min}`,
        );
      }

      if (rules.useMax && rules.max != null) {
        schema = (schema as z.ZodNumber).max(
          rules.max,
          rules.maxMessage || `Maximum value is ${rules.max}`,
        );
      }
    }

    if (isTemporalType(field.type)) {
      schema = schema.superRefine((value, ctx) => {
        const message = getTemporalError(
          field.type as TemporalType,
          value as string,
          field.validation,
        );
        if (message) ctx.addIssue({ code: "custom", message });
      });
    }

    shape[field.id] = schema;
  }

  return z.object(shape);
};
