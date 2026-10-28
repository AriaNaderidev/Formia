import { z } from "zod";
import type { FieldSpec } from "./fieldSpec";
import { runZodPlan, toZodPlan } from "./zodPlan";

/** Keyed by field name: that is the key the editor promises in the submitted data. */
export const buildZodSchema = (specs: FieldSpec[]) =>
  z.object(
    Object.fromEntries(
      specs.map((spec) => [spec.name, runZodPlan(toZodPlan(spec))]),
    ),
  );
