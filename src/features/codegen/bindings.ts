import { member, optionalMember } from "./naming";
import type { Binding, FormLibrary } from "./types";

const q = (name: string) => JSON.stringify(name);

/**
 * React Hook Form: native elements are registered (uncontrolled, no re-render per
 * keystroke); custom widgets go through <Controller>.
 */
const rhfBinding = (uses: Set<string>): Binding => ({
  scope: (spec, body, controlled) => {
    if (!controlled) return body;
    uses.add("control");
    uses.add("Controller");
    return `<Controller control={control} name=${q(spec.name)} render={({ field }) => (${body})} />`;
  },
  text: (spec) => {
    uses.add("register");
    return `{...register(${q(spec.name)})}`;
  },
  checked: (spec) => {
    uses.add("register");
    return `{...register(${q(spec.name)})}`;
  },
  radio: (spec, valueExpr) => {
    uses.add("register");
    return `value={${valueExpr}} {...register(${q(spec.name)})}`;
  },
  toggle: (spec, valueExpr) => {
    uses.add("register");
    return `value={${valueExpr}} {...register(${q(spec.name)})}`;
  },
  range: (spec) => {
    uses.add("register");
    return `{...register(${q(spec.name)}, { valueAsNumber: true })}`;
  },
  value: () => "field.value",
  set: (_spec, expr) => `field.onChange(${expr})`,
  blur: () => "field.onBlur",
  ref: "field.ref",
  error: (spec) => {
    uses.add("errors");
    return `${optionalMember("errors", spec.name)}?.message`;
  },
  get submitting() {
    uses.add("isSubmitting");
    return "isSubmitting";
  },
  withSubmitting: (jsx) => jsx,
  get reset() {
    uses.add("reset");
    return "() => reset()";
  },
});

/** Formik (useFormik): getFieldProps for native elements, setFieldValue for the rest. */
const formikBinding = (uses: Set<string>): Binding => ({
  scope: (_spec, body) => body,
  text: (spec) => `{...formik.getFieldProps(${q(spec.name)})}`,
  checked: (spec) =>
    `{...formik.getFieldProps({ name: ${q(spec.name)}, type: "checkbox" })}`,
  radio: (spec, valueExpr) =>
    `{...formik.getFieldProps({ name: ${q(spec.name)}, type: "radio", value: ${valueExpr} })}`,
  toggle: (spec, valueExpr) =>
    `{...formik.getFieldProps({ name: ${q(spec.name)}, type: "checkbox", value: ${valueExpr} })}`,
  range: (spec) => `{...formik.getFieldProps(${q(spec.name)})}`,
  value: (spec) => member("formik.values", spec.name),
  set: (spec, expr) => `void formik.setFieldValue(${q(spec.name)}, ${expr})`,
  blur: (spec) => `() => void formik.setFieldTouched(${q(spec.name)}, true)`,
  error: (spec) => {
    uses.add("errorOf");
    return `errorOf(${q(spec.name)})`;
  },
  submitting: "formik.isSubmitting",
  withSubmitting: (jsx) => jsx,
  reset: "() => formik.resetForm()",
});

/** TanStack Form: every field renders inside <form.Field> and is fully controlled. */
const tanstackBinding = (uses: Set<string>): Binding => ({
  scope: (spec, body) =>
    `<form.Field name=${q(spec.name)}>{(field) => (${body})}</form.Field>`,
  text: () =>
    `value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} onBlur={field.handleBlur}`,
  checked: () =>
    `checked={field.state.value} onChange={(event) => field.handleChange(event.target.checked)} onBlur={field.handleBlur}`,
  radio: (_spec, valueExpr) =>
    `checked={field.state.value === ${valueExpr}} onChange={() => field.handleChange(${valueExpr})} onBlur={field.handleBlur}`,
  toggle: (_spec, valueExpr) =>
    `checked={field.state.value.includes(${valueExpr})} onChange={(event) => field.handleChange(event.target.checked ? [...field.state.value, ${valueExpr}] : field.state.value.filter((item) => item !== ${valueExpr}))} onBlur={field.handleBlur}`,
  range: () =>
    `value={field.state.value} onChange={(event) => field.handleChange(event.target.valueAsNumber)} onBlur={field.handleBlur}`,
  value: () => "field.state.value",
  set: (_spec, expr) => `field.handleChange(${expr})`,
  blur: () => "field.handleBlur",
  error: () => {
    uses.add("fieldError");
    return "fieldError(field)";
  },
  submitting: "isSubmitting",
  withSubmitting: (jsx) =>
    `<form.Subscribe selector={(state) => state.isSubmitting}>{(isSubmitting) => (${jsx})}</form.Subscribe>`,
  reset: "() => form.reset()",
});

export const createBinding = (library: FormLibrary, uses: Set<string>) => {
  switch (library) {
    case "formik":
      return formikBinding(uses);
    case "tanstack":
      return tanstackBinding(uses);
    default:
      return rhfBinding(uses);
  }
};
