import {
  collectZodHelpers,
  printZodPlan,
  toZodPlan,
  type FieldSpec,
  type ZodHelper,
} from "@/features/form-schema";
import { propKey } from "./naming";

const s = (text: string) => JSON.stringify(text);

/* ---------- helpers emitted into the generated file ---------- */

const HELPER_SOURCE: Record<ZodHelper, string> = {
  today: `/** Today's date in the user's time zone, as YYYY-MM-DD. */
const today = () => {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return \`\${now.getFullYear()}-\${pad(now.getMonth() + 1)}-\${pad(now.getDate())}\`;
};`,
  acceptsFile: `/** Matches a file against accept rules like ".pdf", "image/*" or "application/json". */
const acceptsFile = (file: File, accept: string[]) =>
  accept.some((rule) => {
    const pattern = rule.toLowerCase();
    if (pattern.startsWith(".")) return file.name.toLowerCase().endsWith(pattern);
    if (pattern.endsWith("/*")) return file.type.startsWith(pattern.slice(0, -1));
    return file.type === pattern;
  });`,
};

export const helperSource = (helpers: Iterable<ZodHelper>) =>
  [...helpers].map((helper) => HELPER_SOURCE[helper]);

/* ---------- Zod ---------- */

export const printZodObject = (specs: FieldSpec[]) => {
  const helpers = new Set<ZodHelper>();
  const entries = specs.map((spec) => {
    const plan = toZodPlan(spec);
    collectZodHelpers(plan, helpers);
    return `  ${propKey(spec.name)}: ${printZodPlan(plan)},`;
  });
  return {
    source: `z.object({\n${entries.join("\n")}\n})`,
    helpers,
  };
};

/* ---------- Yup ---------- */

const regex = (pattern: string) =>
  /[/\n\r]/.test(pattern) ? `new RegExp(${s(pattern)})` : `/${pattern}/`;

const yupBound = (raw: string, type: string, edge: "earliest" | "latest") => {
  if (raw !== "today") return { source: s(raw), today: false };
  if (type === "date") return { source: "today()", today: true };
  return {
    source: `\`\${today()}T${edge === "earliest" ? "00:00" : "23:59"}\``,
    today: true,
  };
};

const printYupField = (spec: FieldSpec, helpers: Set<ZodHelper>): string => {
  const parts: string[] = [];
  const req = spec.required;

  switch (spec.kind) {
    case "number":
      parts.push(
        `yup.number().transform((value, original) => (original === "" ? undefined : value)).typeError("Enter a valid number")`,
      );
      if (req) parts.push(`.required(${s(req)})`);
      if (spec.min) parts.push(`.min(${spec.min.value}, ${s(spec.min.message)})`);
      if (spec.max) parts.push(`.max(${spec.max.value}, ${s(spec.max.message)})`);
      break;

    case "range":
      parts.push("yup.number().required()");
      if (req) parts.push(`.min(1, ${s(req)})`);
      break;

    case "boolean":
      parts.push("yup.boolean().required()");
      if (req) parts.push(`.oneOf([true], ${s(req)})`);
      break;

    case "array":
      parts.push("yup.array(yup.string().required()).required()");
      if (req) parts.push(`.min(1, ${s(req)})`);
      break;

    case "files": {
      parts.push("yup.array(yup.mixed<File>().required()).required()");
      if (req) parts.push(`.min(1, ${s(req)})`);
      const { maxSizeMb, accept, message } = spec.file ?? {};
      if (maxSizeMb && message) {
        parts.push(
          `.test("max-size", ${s(message)}, (files = []) => files.every((file) => file.size <= ${maxSizeMb} * 1024 * 1024))`,
        );
      }
      if (accept && message) {
        helpers.add("acceptsFile");
        parts.push(
          `.test("file-type", ${s(message)}, (files = []) => files.every((file) => acceptsFile(file, ${JSON.stringify(accept)})))`,
        );
      }
      break;
    }

    default: {
      parts.push("yup.string()");
      const hasChecks = Boolean(
        spec.format || spec.minLength || spec.maxLength || spec.pattern,
      );
      if (req) parts.push(`.required(${s(req)})`);
      // Optional: treat an empty input as "not given" so the checks below don't fire on it.
      else if (hasChecks) parts.push(`.transform((value) => value || undefined)`);

      if (spec.format) parts.push(`.${spec.format.value}(${s(spec.format.message)})`);
      if (spec.minLength) {
        parts.push(`.min(${spec.minLength.value}, ${s(spec.minLength.message)})`);
      }
      if (spec.maxLength) {
        parts.push(`.max(${spec.maxLength.value}, ${s(spec.maxLength.message)})`);
      }
      if (spec.pattern) {
        parts.push(`.matches(${regex(spec.pattern.value)}, ${s(spec.pattern.message)})`);
      }
      if (spec.temporal) {
        const { type, earliest, latest } = spec.temporal;
        for (const [rule, edge, op] of [
          [earliest, "earliest", ">="],
          [latest, "latest", "<="],
        ] as const) {
          if (!rule) continue;
          const bound = yupBound(rule.value, type, edge);
          if (bound.today) helpers.add("today");
          parts.push(
            `.test(${s(edge)}, ${s(rule.message)}, (value) => !value || value ${op} ${bound.source})`,
          );
        }
      }
      if (!req && !hasChecks) parts.push(".default(\"\")");
    }
  }

  return parts.join("");
};

export const printYupObject = (specs: FieldSpec[]) => {
  const helpers = new Set<ZodHelper>();
  const entries = specs.map(
    (spec) => `  ${propKey(spec.name)}: ${printYupField(spec, helpers)},`,
  );
  return {
    source: `yup.object({\n${entries.join("\n")}\n})`,
    helpers,
  };
};
