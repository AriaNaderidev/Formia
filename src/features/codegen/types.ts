import type { FieldSpec } from "@/features/form-schema";

export type FormLibrary = "rhf" | "formik" | "tanstack";
export type UiKit = "tailwind" | "mui";
export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

export type CodegenOptions = {
  library: FormLibrary;
  ui: UiKit;
  componentName: string;
};

export type GeneratedCode = {
  filename: string;
  code: string;
  dependencies: string[];
};

/**
 * How a form library connects a control to its state.
 * Every method returns source code. `valueExpr` arguments are expressions
 * (e.g. `option.value`), never raw strings.
 */
export interface Binding {
  /**
   * Wraps a whole field block when the library needs a field-scoped render function
   * (RHF <Controller>, TanStack <form.Field>). `controlled` says whether the block
   * used the generic value/set API rather than native element bindings.
   */
  scope(spec: FieldSpec, body: string, controlled: boolean): string;

  /* Native element bindings (spread onto <input>, <select>, <textarea>). */
  text(spec: FieldSpec): string;
  checked(spec: FieldSpec): string;
  radio(spec: FieldSpec, valueExpr: string): string;
  toggle(spec: FieldSpec, valueExpr: string): string;
  range(spec: FieldSpec): string;

  /* Generic controlled API, for custom widgets and component libraries. */
  value(spec: FieldSpec): string;
  set(spec: FieldSpec, expr: string): string;
  blur(spec: FieldSpec): string;
  /** Ref the library uses to focus the first invalid input (e.g. `field.ref`), if it has one. */
  ref?: string;

  error(spec: FieldSpec): string;

  /** Expression that is true while the form is submitting. */
  submitting: string;
  /** Wraps the submit button so `submitting` is in scope. */
  withSubmitting(jsx: string): string;
  /** Click handler that resets the form. */
  reset: string;
}

export type Ctx = {
  options: CodegenOptions;
  binding: Binding;
  /** Option-list constant name per field name. */
  optionConsts: Map<string, string>;
  /** Named imports from the UI library (MUI only). */
  uiImports: Set<string>;
  /** Library members the generated body actually uses (register, control, reset...). */
  uses: Set<string>;
};
