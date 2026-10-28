import { z } from "zod";
import { acceptsFile, type FieldSpec, type Rule } from "./fieldSpec";
import { resolveBound, type TemporalType } from "./temporalBounds";

/**
 * A Zod schema described as data: a chain of method calls starting on `z`.
 * The same plan is executed for the live preview and printed for the generated code,
 * so the two can never drift apart.
 */

/** Helpers the printed code depends on. The code generator emits their source. */
export type ZodHelper = "today" | "acceptsFile";

/** A value that is printed as `code` but evaluated as `value` at runtime. */
export type Code = { kind: "code"; code: string; value: unknown; helpers?: ZodHelper[] };
export type ZodCall = { method: string; args: Arg[] };
export type ZodChain = { kind: "chain"; calls: ZodCall[] };
type Arg = string | number | Code | ZodChain;

const code = (source: string, value: unknown, helpers?: ZodHelper[]): Code => ({
  kind: "code",
  code: source,
  value,
  helpers,
});

const chain = (...calls: ZodCall[]): ZodChain => ({ kind: "chain", calls });
const call = (method: string, ...args: Arg[]): ZodCall => ({ method, args });

const NUMBER_ERROR = code(`{ error: "Enter a valid number" }`, {
  error: "Enter a valid number",
});

/* ---------- regex ---------- */

const regexArg = (pattern: string) =>
  code(
    // A literal reads better, but a "/" or line break inside it would end it early.
    /[/\n\r]/.test(pattern) ? `new RegExp(${JSON.stringify(pattern)})` : `/${pattern}/`,
    new RegExp(pattern),
  );

/* ---------- temporal ---------- */

const boundCode = (type: TemporalType, raw: string, edge: "earliest" | "latest") => {
  if (raw !== "today") return { source: JSON.stringify(raw), helpers: [] };
  if (type === "date") return { source: "today()", helpers: ["today" as const] };
  const time = edge === "earliest" ? "00:00" : "23:59";
  return { source: `\`\${today()}T${time}\``, helpers: ["today" as const] };
};

const temporalRefine = (
  type: TemporalType,
  rule: Rule<string>,
  edge: "earliest" | "latest",
): ZodCall => {
  const { source, helpers } = boundCode(type, rule.value, edge);
  const operator = edge === "earliest" ? ">=" : "<=";
  // "today" is resolved when the value is checked, not when the schema is built.
  const predicate = (value: string) => {
    const bound = resolveBound(type, rule.value, edge);
    if (!value || !bound) return true;
    return edge === "earliest" ? value >= bound : value <= bound;
  };
  return call(
    "refine",
    code(`(value) => !value || value ${operator} ${source}`, predicate, helpers),
    rule.message,
  );
};

/* ---------- per kind ---------- */

const lengthChecks = (spec: FieldSpec): ZodCall[] => [
  ...(spec.minLength ? [call("min", spec.minLength.value, spec.minLength.message)] : []),
  ...(spec.maxLength ? [call("max", spec.maxLength.value, spec.maxLength.message)] : []),
  ...(spec.pattern
    ? [call("regex", regexArg(spec.pattern.value), spec.pattern.message)]
    : []),
];

const temporalChecks = (spec: FieldSpec): ZodCall[] => {
  if (!spec.temporal) return [];
  const { type, earliest, latest } = spec.temporal;
  return [
    ...(earliest ? [temporalRefine(type, earliest, "earliest")] : []),
    ...(latest ? [temporalRefine(type, latest, "latest")] : []),
  ];
};

const stringPlan = (spec: FieldSpec): ZodChain => {
  const checks = lengthChecks(spec);
  const format = spec.format;

  if (spec.required) {
    return chain(
      call("string"),
      call("min", 1, spec.required),
      ...checks,
      ...temporalChecks(spec),
      // Format last, so an empty value reports "required" rather than "invalid email".
      ...(format ? [call("pipe", chain(call(format.value, format.message)))] : []),
    );
  }

  // Optional: an empty value is fine, anything typed in still has to pass the checks.
  const root = format ? call(format.value, format.message) : call("string");
  const rejectsEmpty = Boolean(format) || checks.length > 0;
  return chain(
    root,
    ...checks,
    ...temporalChecks(spec),
    ...(rejectsEmpty ? [call("or", chain(call("literal", "")))] : []),
  );
};

/** Number inputs hold text; it becomes a number (or undefined when empty) on parse. */
const numberPlan = (spec: FieldSpec): ZodChain => {
  const bounds = [
    ...(spec.min ? [call("min", spec.min.value, spec.min.message)] : []),
    ...(spec.max ? [call("max", spec.max.value, spec.max.message)] : []),
  ];

  if (spec.required) {
    return chain(
      call("string"),
      call("min", 1, spec.required),
      call("transform", code("Number", Number)),
      call("pipe", chain(call("number", NUMBER_ERROR), ...bounds)),
    );
  }

  return chain(
    call("string"),
    call(
      "transform",
      code(`(value) => (value === "" ? undefined : Number(value))`, (value: string) =>
        value === "" ? undefined : Number(value),
      ),
    ),
    call("pipe", chain(call("number", NUMBER_ERROR), ...bounds, call("optional"))),
  );
};

const rangePlan = (spec: FieldSpec): ZodChain =>
  chain(call("number"), ...(spec.required ? [call("min", 1, spec.required)] : []));

const booleanPlan = (spec: FieldSpec): ZodChain =>
  chain(
    call("boolean"),
    ...(spec.required
      ? [call("refine", code("(value) => value", (value: boolean) => value), spec.required)]
      : []),
  );

const arrayPlan = (spec: FieldSpec): ZodChain =>
  chain(
    call("array", chain(call("string"))),
    ...(spec.required ? [call("min", 1, spec.required)] : []),
  );

const filesPlan = (spec: FieldSpec): ZodChain => {
  const calls = [call("array", chain(call("instanceof", code("File", File))))];
  if (spec.required) calls.push(call("min", 1, spec.required));

  const { maxSizeMb, accept, message } = spec.file ?? {};
  if (maxSizeMb && message) {
    const bytes = maxSizeMb * 1024 * 1024;
    calls.push(
      call(
        "refine",
        code(
          `(files) => files.every((file) => file.size <= ${maxSizeMb} * 1024 * 1024)`,
          (files: File[]) => files.every((file) => file.size <= bytes),
        ),
        message,
      ),
    );
  }
  if (accept && message) {
    calls.push(
      call(
        "refine",
        code(
          `(files) => files.every((file) => acceptsFile(file, ${JSON.stringify(accept)}))`,
          (files: File[]) => files.every((file) => acceptsFile(file, accept)),
          ["acceptsFile"],
        ),
        message,
      ),
    );
  }
  return chain(...calls);
};

export const toZodPlan = (spec: FieldSpec): ZodChain => {
  switch (spec.kind) {
    case "number":
      return numberPlan(spec);
    case "range":
      return rangePlan(spec);
    case "boolean":
      return booleanPlan(spec);
    case "array":
      return arrayPlan(spec);
    case "files":
      return filesPlan(spec);
    default:
      return stringPlan(spec);
  }
};

/* ---------- run ---------- */

const toValue = (arg: Arg): unknown => {
  if (typeof arg !== "object") return arg;
  return arg.kind === "code" ? arg.value : runZodPlan(arg);
};

export const runZodPlan = (plan: ZodChain): z.ZodType => {
  // Each step returns a schema whose methods depend on the previous call,
  // which TypeScript can't follow through a data-driven chain.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let target: any = z;
  for (const { method, args } of plan.calls) {
    target = target[method](...args.map(toValue));
  }
  return target as z.ZodType;
};

/* ---------- print ---------- */

const printArg = (arg: Arg): string => {
  if (typeof arg === "string") return JSON.stringify(arg);
  if (typeof arg === "number") return String(arg);
  return arg.kind === "code" ? arg.code : printZodPlan(arg);
};

export const printZodPlan = (plan: ZodChain): string =>
  "z" +
  plan.calls
    .map(({ method, args }) => `.${method}(${args.map(printArg).join(", ")})`)
    .join("");

/** Every helper a plan (including nested chains) depends on. */
export const collectZodHelpers = (plan: ZodChain, into = new Set<ZodHelper>()) => {
  for (const { args } of plan.calls) {
    for (const arg of args) {
      if (typeof arg !== "object") continue;
      if (arg.kind === "code") arg.helpers?.forEach((helper) => into.add(helper));
      else collectZodHelpers(arg, into);
    }
  }
  return into;
};
