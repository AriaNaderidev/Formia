import {
  getDefaultValue,
  groupIntoRows,
  isValueField,
  toFieldSpec,
  type FieldSpec,
  type FormField,
  type ValueKind,
} from "@/features/form-schema";
import { createBinding } from "./bindings";
import {
  renderMuiDefaultActions,
  renderMuiField,
  renderMuiLayout,
  renderMuiRow,
} from "./kits/mui";
import {
  renderTailwindDefaultActions,
  renderTailwindField,
  renderTailwindLayout,
  renderTailwindRow,
  TAILWIND_STYLES,
} from "./kits/tailwind";
import { propKey, toCamelCase, toComponentName } from "./naming";
import { helperSource, printYupObject, printZodObject } from "./schemas";
import type {
  CodegenOptions,
  Ctx,
  FormLibrary,
  GeneratedCode,
  PackageManager,
  UiKit,
} from "./types";

export const LIBRARY_LABELS: Record<FormLibrary, string> = {
  rhf: "React Hook Form + Zod",
  formik: "Formik + Yup",
  tanstack: "TanStack Form + Zod",
};

export const UI_LABELS: Record<UiKit, string> = {
  tailwind: "Tailwind CSS",
  mui: "Material UI",
};

const LIBRARY_DEPS: Record<FormLibrary, string[]> = {
  rhf: ["react-hook-form", "zod", "@hookform/resolvers"],
  formik: ["formik", "yup"],
  tanstack: ["@tanstack/react-form", "zod"],
};

/** Only added when the form has a date, time or date-time field. */
const PICKER_DEPS = ["@mui/x-date-pickers", "dayjs"];

const UI_DEPS: Record<UiKit, string[]> = {
  tailwind: [],
  mui: ["@mui/material", "@emotion/react", "@emotion/styled"],
};

const INSTALL: Record<PackageManager, string> = {
  npm: "npm install",
  pnpm: "pnpm add",
  yarn: "yarn add",
  bun: "bun add",
};

export const installCommand = (deps: string[], manager: PackageManager) =>
  `${INSTALL[manager]} ${deps.join(" ")}`;

/** The TypeScript type of each field's raw (not yet parsed) form value. */
const RAW_TYPES: Record<ValueKind, string> = {
  string: "string",
  number: "string",
  range: "number",
  boolean: "boolean",
  array: "string[]",
  files: "File[]",
};

const literal = (spec: FieldSpec) => JSON.stringify(getDefaultValue(spec));

/* ---------- option constants ---------- */

const optionConstants = (specs: FieldSpec[]) => {
  const names = new Map<string, string>();
  const used = new Set<string>();
  const source: string[] = [];

  for (const spec of specs) {
    const options = spec.field.options;
    if (!options?.length) continue;

    const base = `${toCamelCase(spec.name) || "field"}Options`;
    let name = base;
    for (let n = 2; used.has(name); n++) name = `${base}${n}`;
    used.add(name);
    names.set(spec.name, name);

    const items = options
      .map((option) => `  { label: ${JSON.stringify(option.label)}, value: ${JSON.stringify(option.value)} },`)
      .join("\n");
    source.push(`const ${name} = [\n${items}\n] as const;`);
  }

  return { names, source };
};

/* ---------- body ---------- */

const renderBody = (fields: FormField[], specs: FieldSpec[], ctx: Ctx) => {
  const specById = new Map(specs.map((spec) => [spec.field.id, spec]));
  const isMui = ctx.options.ui === "mui";

  const rows = groupIntoRows(fields)
    .map((row) => {
      const cells = row.fields
        .map((field) => {
          const spec = specById.get(field.id);
          if (spec) {
            return isMui ? renderMuiField(spec, ctx) : renderTailwindField(spec, ctx);
          }
          return isMui ? renderMuiLayout(field, ctx) : renderTailwindLayout(field, ctx);
        })
        .filter(Boolean);
      if (cells.length === 0) return "";
      return isMui ? renderMuiRow(cells, ctx) : renderTailwindRow(cells);
    })
    .filter(Boolean);

  const hasSubmit = fields.some(
    (field) => field.type === "button" && (field.buttonType ?? "submit") === "submit",
  );
  if (!hasSubmit) {
    rows.push(isMui ? renderMuiDefaultActions(ctx) : renderTailwindDefaultActions(ctx));
  }

  return rows.join("\n");
};

/* ---------- per library ---------- */

type Parts = {
  name: string;
  schemaName: string;
  inputType: string;
  outputType: string;
  body: string;
  specs: FieldSpec[];
  ctx: Ctx;
};

const formOpen = (ctx: Ctx, onSubmit: string) =>
  ctx.options.ui === "mui"
    ? `${ctx.pickers.size ? "<LocalizationProvider dateAdapter={AdapterDayjs}>" : ""}<Box component="form" noValidate onSubmit={${onSubmit}} sx={{ display: "flex", flexDirection: "column", gap: 2.5, maxWidth: 560, mx: "auto" }}>`
    : `<form noValidate onSubmit={${onSubmit}} className="mx-auto flex w-full max-w-xl flex-col gap-5">`;

const formClose = (ctx: Ctx) =>
  ctx.options.ui === "mui"
    ? `</Box>${ctx.pickers.size ? "</LocalizationProvider>" : ""}`
    : "</form>";

const defaultsObject = (specs: FieldSpec[]) =>
  `{\n${specs.map((spec) => `  ${propKey(spec.name)}: ${literal(spec)},`).join("\n")}\n}`;

const rhfComponent = ({ name, schemaName, inputType, outputType, body, specs, ctx }: Parts) => {
  const { uses } = ctx;
  const members = [
    uses.has("register") && "register",
    uses.has("control") && "control",
    "handleSubmit",
    uses.has("reset") && "reset",
  ].filter(Boolean);
  const state = [uses.has("errors") && "errors", uses.has("isSubmitting") && "isSubmitting"].filter(
    Boolean,
  );
  if (state.length) members.push(`formState: { ${state.join(", ")} }`);

  return `const defaultValues: ${inputType} = ${defaultsObject(specs)};

type ${name}Props = {
  onSubmit: (values: ${outputType}) => void | Promise<void>;
};

export function ${name}({ onSubmit }: ${name}Props) {
  const { ${members.join(", ")} } = useForm<${inputType}, unknown, ${outputType}>({
    resolver: zodResolver(${schemaName}),
    defaultValues,
    mode: "onTouched",
  });

  return (
    ${formOpen(ctx, "handleSubmit(onSubmit)")}
      ${body}
    ${formClose(ctx)}
  );
}`;
};

const formikComponent = ({ name, schemaName, outputType, body, specs, ctx }: Parts) => {
  const valuesType = `${name}Values`;
  const typeLines = specs
    .map((spec) => `  ${propKey(spec.name)}: ${RAW_TYPES[spec.kind]};`)
    .join("\n");
  const errorOf = ctx.uses.has("errorOf")
    ? `

  /** The error for a field, once the user has interacted with it. */
  const errorOf = (name: keyof ${valuesType}) =>
    formik.touched[name] && formik.errors[name] ? String(formik.errors[name]) : undefined;`
    : "";

  return `export type ${valuesType} = {\n${typeLines}\n};

const initialValues: ${valuesType} = ${defaultsObject(specs)};

type ${name}Props = {
  onSubmit: (values: ${outputType}) => void | Promise<void>;
};

export function ${name}({ onSubmit }: ${name}Props) {
  const formik = useFormik<${valuesType}>({
    initialValues,
    validationSchema: ${schemaName},
    // Formik passes the raw values; cast() applies the schema's transforms (e.g. "" -> undefined).
    onSubmit: async (values) => {
      await onSubmit(${schemaName}.cast(values));
    },
  });${errorOf}

  return (
    ${formOpen(ctx, "formik.handleSubmit")}
      ${body}
    ${formClose(ctx)}
  );
}`;
};

const tanstackComponent = ({ name, schemaName, inputType, outputType, body, specs, ctx }: Parts) =>
  `const defaultValues: ${inputType} = ${defaultsObject(specs)};

type ${name}Props = {
  onSubmit: (values: ${outputType}) => void | Promise<void>;
};

export function ${name}({ onSubmit }: ${name}Props) {
  const form = useForm({
    defaultValues,
    validators: { onChange: ${schemaName} },
    onSubmit: async ({ value }) => {
      await onSubmit(${schemaName}.parse(value));
    },
  });

  return (
    ${formOpen(ctx, `(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }`)}
      ${body}
    ${formClose(ctx)}
  );
}`;

const TANSTACK_FIELD_ERROR = `/** The first validation message, once the user has interacted with the field. */
function fieldError(field: AnyFieldApi): string | undefined {
  if (!field.state.meta.isTouched) return undefined;
  const [first] = field.state.meta.errors;
  return typeof first === "string" ? first : first?.message;
}`;

/* ---------- entry ---------- */

export const generateFormCode = (
  fields: FormField[],
  options: CodegenOptions,
): GeneratedCode => {
  const name = toComponentName(options.componentName);
  const camel = toCamelCase(name);
  const schemaName = `${camel}Schema`;
  const inputType = `${name}Input`;
  const outputType = `${name}Output`;

  const specs = fields.filter(isValueField).map(toFieldSpec);
  const consts = optionConstants(specs);
  const uses = new Set<string>();
  const ctx: Ctx = {
    options,
    binding: createBinding(options.library, uses),
    optionConsts: consts.names,
    uiImports: new Set(),
    pickers: new Set(),
    uses,
  };

  // Rendering first: it records which imports and hook members are needed.
  const body = renderBody(fields, specs, ctx);
  if (options.ui === "mui") ctx.uiImports.add("Box");

  const isYup = options.library === "formik";
  const schema = isYup ? printYupObject(specs) : printZodObject(specs);

  const imports: string[] = [];
  switch (options.library) {
    case "rhf":
      imports.push(
        `import { zodResolver } from "@hookform/resolvers/zod";`,
        `import { ${uses.has("Controller") ? "Controller, " : ""}useForm } from "react-hook-form";`,
        `import { z } from "zod";`,
      );
      break;
    case "formik":
      imports.push(`import { useFormik } from "formik";`, `import * as yup from "yup";`);
      break;
    case "tanstack":
      imports.push(
        `import { ${uses.has("fieldError") ? "type AnyFieldApi, " : ""}useForm } from "@tanstack/react-form";`,
        `import { z } from "zod";`,
      );
      break;
  }
  if (ctx.pickers.size) {
    imports.push(
      `import dayjs from "dayjs";`,
      `import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";`,
      ...[...ctx.pickers]
        .sort()
        .map((picker) => `import { ${picker} } from "@mui/x-date-pickers/${picker}";`),
      `import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";`,
    );
  }
  if (ctx.uiImports.size) {
    imports.push(`import { ${[...ctx.uiImports].sort().join(", ")} } from "@mui/material";`);
  }

  const typeExports = isYup
    ? `export type ${outputType} = yup.InferType<typeof ${schemaName}>;`
    : `export type ${inputType} = z.input<typeof ${schemaName}>;\nexport type ${outputType} = z.output<typeof ${schemaName}>;`;

  const parts: Parts = { name, schemaName, inputType, outputType, body, specs, ctx };
  const component =
    options.library === "formik"
      ? formikComponent(parts)
      : options.library === "tanstack"
        ? tanstackComponent(parts)
        : rhfComponent(parts);

  const dependencies = [
    ...LIBRARY_DEPS[options.library],
    ...UI_DEPS[options.ui],
    ...(ctx.pickers.size ? PICKER_DEPS : []),
  ];

  const sections = [
    `/**
 * ${name}, generated with Form Generator.
 *
 * Stack:   ${LIBRARY_LABELS[options.library]} · ${UI_LABELS[options.ui]}
 * Install: ${installCommand(dependencies, "npm")}${options.ui === "tailwind" ? "\n * Styling: Tailwind CSS v3.4+ or v4 must already be set up in your project." : ""}
 *
 * Usage:
 *   <${name} onSubmit={async (values) => { await saveToApi(values); }} />
 */`,
    imports.join("\n"),
    ...helperSource(schema.helpers),
    ...(options.library === "tanstack" && uses.has("fieldError") ? [TANSTACK_FIELD_ERROR] : []),
    ...(options.ui === "tailwind" ? [TAILWIND_STYLES] : []),
    ...consts.source,
    `export const ${schemaName} = ${schema.source};`,
    typeExports,
    component,
  ];

  return {
    filename: `${name}.tsx`,
    code: `${sections.join("\n\n")}\n`,
    dependencies,
  };
};
