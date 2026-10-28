import type { FieldSpec, FormField } from "@/features/form-schema";
import { jsxString, jsxText } from "../naming";
import type { Ctx } from "../types";

/** Emitted once at the top of the file so the markup stays readable. */
export const TAILWIND_STYLES = `const styles = {
  label: "text-sm font-medium text-gray-900",
  hint: "text-xs text-gray-500",
  error: "text-sm text-red-600",
  input:
    "block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-500/15",
  choice: "flex items-center gap-2 text-sm text-gray-800",
  checkbox: "size-4 rounded border-gray-300 text-indigo-600 accent-indigo-600",
  chip: "cursor-pointer rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700 transition select-none peer-checked:border-indigo-600 peer-checked:bg-indigo-600 peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-indigo-500/20",
  switchTrack:
    "relative h-6 w-11 shrink-0 rounded-full bg-gray-300 transition peer-checked:bg-indigo-600 peer-focus-visible:ring-4 peer-focus-visible:ring-indigo-500/20 after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5",
  primaryButton:
    "inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
  secondaryButton:
    "inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 active:scale-[0.98]",
  textButton:
    "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50",
} as const;`;

const cx = (...parts: (string | undefined | false)[]) =>
  parts.filter(Boolean).join(" ");

const requiredMark = (spec: FieldSpec) =>
  spec.required
    ? `<span aria-hidden="true" className="text-red-500"> *</span>`
    : "";

const disabled = (field: FormField) => (field.disabled ? " disabled" : "");

const errorBlock = (spec: FieldSpec, err: string) =>
  `{${err} ? <p id="${spec.name}-error" role="alert" className={styles.error}>{${err}}</p> : null}`;

const a11y = (spec: FieldSpec, err: string) =>
  `aria-invalid={Boolean(${err})} aria-describedby={${err} ? "${spec.name}-error" : undefined}`;

const labelFor = (spec: FieldSpec) =>
  `<label htmlFor="${spec.name}" className={styles.label}>${jsxText(spec.label)}${requiredMark(spec)}</label>`;

const legend = (spec: FieldSpec) =>
  `<legend className="mb-2 text-sm font-medium text-gray-900">${jsxText(spec.label)}${requiredMark(spec)}</legend>`;

const INPUT_TYPES: Partial<Record<FormField["type"], string>> = {
  text: "text",
  email: "email",
  tel: "tel",
  url: "url",
  password: "password",
  number: "number",
  date: "date",
  time: "time",
  datetime: "datetime-local",
};

const AUTOCOMPLETE: Partial<Record<FormField["type"], string>> = {
  email: "email",
  tel: "tel",
  url: "url",
  password: "current-password",
};

/** Returns the field block and whether it used the controlled API. */
const renderControl = (
  spec: FieldSpec,
  ctx: Ctx,
): { body: string; controlled: boolean } => {
  const { binding: b } = ctx;
  const { field } = spec;
  const err = b.error(spec);
  const wrap = (inner: string, extra?: string) =>
    `<div className=${jsxString(cx("flex flex-col gap-1.5", extra, field.className))}>${inner}${errorBlock(spec, err)}</div>`;
  const fieldset = (inner: string) =>
    `<fieldset className=${jsxString(cx("flex flex-col", field.className))}${disabled(field)}>${legend(spec)}${inner}${errorBlock(spec, err)}</fieldset>`;
  const options = ctx.optionConsts.get(spec.name) ?? "[]";

  switch (field.type) {
    case "textarea":
      return {
        controlled: false,
        body: wrap(
          `${labelFor(spec)}<textarea id="${spec.name}" rows={${field.rowNumber ?? 3}} className={styles.input} ${a11y(spec, err)}${disabled(field)} ${b.text(spec)} />`,
        ),
      };

    case "select":
      return {
        controlled: false,
        body: wrap(
          `${labelFor(spec)}<select id="${spec.name}" className={styles.input} ${a11y(spec, err)}${disabled(field)} ${b.text(spec)}><option value="">Select an option</option>{${options}.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}</select>`,
        ),
      };

    case "combobox":
      return {
        controlled: false,
        body: wrap(
          `${labelFor(spec)}<input id="${spec.name}" list="${spec.name}-options" autoComplete="off" className={styles.input} ${a11y(spec, err)}${disabled(field)} ${b.text(spec)} /><datalist id="${spec.name}-options">{${options}.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}</datalist>`,
        ),
      };

    case "radiogroup":
      return {
        controlled: false,
        body: fieldset(
          `<div className="flex flex-col gap-2">{${options}.map((option) => (<label key={option.value} className={styles.choice}><input type="radio" className={styles.checkbox} ${b.radio(spec, "option.value")} />{option.label}</label>))}</div>`,
        ),
      };

    case "checkboxgroup":
      return {
        controlled: false,
        body: fieldset(
          `<div className="flex flex-col gap-2">{${options}.map((option) => (<label key={option.value} className={styles.choice}><input type="checkbox" className={styles.checkbox} ${b.toggle(spec, "option.value")} />{option.label}</label>))}</div>`,
        ),
      };

    case "multiselect":
      return {
        controlled: false,
        body: fieldset(
          `<div className="flex flex-wrap gap-2">{${options}.map((option) => (<label key={option.value}><input type="checkbox" className="peer sr-only" ${b.toggle(spec, "option.value")} /><span className={styles.chip}>{option.label}</span></label>))}</div>`,
        ),
      };

    case "checkbox":
      return {
        controlled: false,
        body: wrap(
          `<label className={styles.choice}><input id="${spec.name}" type="checkbox" className={styles.checkbox} ${a11y(spec, err)}${disabled(field)} ${b.checked(spec)} /><span>${jsxText(spec.label)}${requiredMark(spec)}</span></label>`,
        ),
      };

    case "switch":
      return {
        controlled: false,
        body: wrap(
          `<label className="inline-flex cursor-pointer items-center gap-3"><input id="${spec.name}" type="checkbox" role="switch" className="peer sr-only"${disabled(field)} ${b.checked(spec)} /><span aria-hidden="true" className={styles.switchTrack} /><span className={styles.label}>${jsxText(spec.label)}</span></label>`,
        ),
      };

    case "slider":
      return {
        controlled: false,
        body: wrap(
          `${labelFor(spec)}<input id="${spec.name}" type="range" min={${field.min ?? 0}} max={${field.max ?? 100}} step={${field.step ?? 1}} className="w-full accent-indigo-600"${disabled(field)} ${b.range(spec)} /><div className="flex justify-between text-xs text-gray-500"><span>${field.min ?? 0}</span><span>${field.max ?? 100}</span></div>`,
        ),
      };

    case "rating": {
      const max = field.max ?? 5;
      const value = b.value(spec);
      return {
        controlled: true,
        body: fieldset(
          `<div className="flex gap-1">{Array.from({ length: ${max} }, (_, index) => index + 1).map((star) => (<button key={star} type="button" aria-label={\`\${star} of ${max}\`} aria-pressed={${value} === star} onClick={() => ${b.set(spec, `${value} === star ? 0 : star`)}} className={\`text-2xl leading-none transition hover:scale-110 \${star <= ${value} ? "text-amber-400" : "text-gray-300"}\`}>★</button>))}</div>`,
        ),
      };
    }

    case "color":
      return {
        controlled: false,
        body: wrap(
          `${labelFor(spec)}<input id="${spec.name}" type="color" className="h-10 w-20 cursor-pointer rounded-lg border border-gray-300 bg-white p-1"${disabled(field)} ${b.text(spec)} />`,
        ),
      };

    case "file": {
      const accept = spec.file?.accept?.join(",");
      return {
        controlled: true,
        body: wrap(
          `${labelFor(spec)}<input id="${spec.name}" type="file"${accept ? ` accept=${jsxString(accept)}` : ""} className="block w-full text-sm text-gray-700 file:me-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100" ${a11y(spec, err)}${disabled(field)} onChange={(event) => ${b.set(spec, "Array.from(event.target.files ?? [])")}} onBlur={${b.blur(spec)}} />`,
        ),
      };
    }

    default: {
      const type = INPUT_TYPES[field.type] ?? "text";
      const autoComplete = AUTOCOMPLETE[field.type];
      return {
        controlled: false,
        body: wrap(
          `${labelFor(spec)}<input id="${spec.name}" type="${type}"${type === "number" ? ` inputMode="decimal"` : ""}${autoComplete ? ` autoComplete="${autoComplete}"` : ""} className={styles.input} ${a11y(spec, err)}${disabled(field)} ${b.text(spec)} />`,
        ),
      };
    }
  }
};

export const renderTailwindField = (spec: FieldSpec, ctx: Ctx) => {
  const { body, controlled } = renderControl(spec, ctx);
  return ctx.binding.scope(spec, body, controlled);
};

const HEADING_CLASSES = {
  h1: "text-3xl font-bold tracking-tight text-gray-900",
  h2: "text-2xl font-semibold tracking-tight text-gray-900",
  h3: "text-xl font-semibold text-gray-900",
  h4: "text-lg font-semibold text-gray-900",
};

const ALERT_CLASSES = {
  info: "border-sky-200 bg-sky-50 text-sky-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  error: "border-red-200 bg-red-50 text-red-900",
};

const BUTTON_CLASSES = {
  contained: "styles.primaryButton",
  outlined: "styles.secondaryButton",
  text: "styles.textButton",
};

export const renderTailwindLayout = (field: FormField, ctx: Ctx): string => {
  const extra = field.className;
  const className = (base: string) => jsxString(cx(base, extra));

  switch (field.type) {
    case "heading": {
      const level = field.headingLevel ?? "h2";
      return `<${level} className=${className(HEADING_CLASSES[level])}>${jsxText(field.content ?? "")}</${level}>`;
    }
    case "paragraph":
      return `<p className=${className("text-sm leading-6 text-gray-600")}>${jsxText(field.content ?? "")}</p>`;
    case "alert":
      return `<div role="status" className=${className(`rounded-lg border px-4 py-3 text-sm ${ALERT_CLASSES[field.severity ?? "info"]}`)}>${jsxText(field.content ?? "")}</div>`;
    case "divider":
      return `<hr className=${className("border-gray-200")} />`;
    case "spacer":
      return `<div aria-hidden="true" style={{ height: ${field.height ?? 24} }} />`;
    case "image":
      return field.src
        ? `<img src=${jsxString(field.src)} alt=${jsxString(field.alt ?? "")} style={{ height: ${field.height ?? 160} }} className=${className("w-full rounded-lg object-cover")} />`
        : `{/* Image: no source set yet */}`;
    case "button": {
      const variant = BUTTON_CLASSES[field.buttonVariant ?? "contained"];
      const cls = extra ? `{\`\${${variant}} ${extra}\`}` : `{${variant}}`;
      const label = jsxText(field.label || "Submit");
      if (field.buttonType === "reset") {
        return `<button type="button" onClick={${ctx.binding.reset}} className=${cls}>${label}</button>`;
      }
      if (field.buttonType === "button") {
        return `<button type="button" className=${cls}>${label}</button>`;
      }
      const s = ctx.binding.submitting;
      return ctx.binding.withSubmitting(
        `<button type="submit" disabled={${s}} className=${cls}>{${s} ? "Submitting…" : ${JSON.stringify(field.label || "Submit")}}</button>`,
      );
    }
    default:
      return "";
  }
};

export const renderTailwindDefaultActions = (ctx: Ctx) => {
  const s = ctx.binding.submitting;
  return `<div className="flex gap-3 pt-2">${ctx.binding.withSubmitting(
    `<button type="submit" disabled={${s}} className={styles.primaryButton}>{${s} ? "Submitting…" : "Submit"}</button>`,
  )}<button type="button" onClick={${ctx.binding.reset}} className={styles.secondaryButton}>Reset</button></div>`;
};

export const renderTailwindRow = (cells: string[]) =>
  cells.length > 1
    ? `<div className="grid gap-5 sm:grid-cols-2">${cells.join("")}</div>`
    : cells[0];
