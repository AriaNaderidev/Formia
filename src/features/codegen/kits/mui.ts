import type { FieldSpec, FormField } from "@/features/form-schema";
import { jsxString, jsxText } from "../naming";
import type { Ctx } from "../types";

/** Optional JSX attributes: ` disabled`, ` className="..."`. */
const flags = (field: FormField, spec?: FieldSpec) =>
  [
    spec?.required ? " required" : "",
    field.disabled ? " disabled" : "",
    field.className ? ` className=${jsxString(field.className)}` : "",
  ].join("");

const helper = (err: string, ctx: Ctx) => {
  ctx.uiImports.add("FormHelperText");
  return `{${err} ? <FormHelperText>{${err}}</FormHelperText> : null}`;
};

/** TextField and Autocomplete inputs take `inputRef`. */
const inputRef = (ref?: string) => (ref ? ` inputRef={${ref}}` : "");

/** Checkbox, Radio and Switch take their input ref through slotProps (MUI v7+). */
const slotRef = (ref?: string) => (ref ? ` slotProps={{ input: { ref: ${ref} } }}` : "");

const TEXT_TYPES: Partial<Record<FormField["type"], string>> = {
  email: "email",
  tel: "tel",
  url: "url",
  password: "password",
  number: "number",
  date: "date",
  time: "time",
  datetime: "datetime-local",
  color: "color",
};

const SHRINK_TYPES = new Set(["date", "time", "datetime-local", "color"]);

const PICKERS = {
  date: { component: "DatePicker", format: "YYYY-MM-DD", min: "minDate", max: "maxDate" },
  time: { component: "TimePicker", format: "HH:mm", min: "minTime", max: "maxTime" },
  datetime: {
    component: "DateTimePicker",
    format: "YYYY-MM-DDTHH:mm",
    min: "minDateTime",
    max: "maxDateTime",
  },
} as const;

/** A stored bound ("today" or a formatted value) as a dayjs expression. */
const pickerBound = (type: keyof typeof PICKERS, raw: string, edge: "start" | "end") => {
  if (raw === "today") {
    return type === "date" ? "dayjs()" : `dayjs().${edge === "start" ? "startOf" : "endOf"}("day")`;
  }
  return `dayjs(${JSON.stringify(type === "time" ? `1970-01-01T${raw}` : raw)})`;
};

/**
 * Date, time and date-time fields use MUI X pickers. The form still holds the same
 * strings as a native input (`YYYY-MM-DD`, `HH:mm`), so the schema is unchanged.
 */
const renderPicker = (spec: FieldSpec, ctx: Ctx): string => {
  const { binding: b } = ctx;
  const { field } = spec;
  const type = field.type as keyof typeof PICKERS;
  const picker = PICKERS[type];
  ctx.pickers.add(picker.component);

  const err = b.error(spec);
  const value = b.value(spec);
  // A time is parsed against an arbitrary day, since dayjs has no time-only constructor.
  const parse = type === "time" ? "dayjs(`1970-01-01T${" + value + "}`)" : `dayjs(${value})`;
  const bounds = [
    spec.temporal?.earliest &&
      ` ${picker.min}={${pickerBound(type, spec.temporal.earliest.value, "start")}}`,
    spec.temporal?.latest &&
      ` ${picker.max}={${pickerBound(type, spec.temporal.latest.value, "end")}}`,
  ].join("");
  const textField = [
    "fullWidth: true",
    `id: "${spec.name}"`,
    spec.required && "required: true",
    `error: Boolean(${err})`,
    `helperText: ${err}`,
    `onBlur: ${b.blur(spec)}`,
    b.ref && `inputRef: ${b.ref}`,
  ]
    .filter(Boolean)
    .join(", ");
  const className = field.className ? ` className=${jsxString(field.className)}` : "";
  const next = `next?.isValid() ? next.format("${picker.format}") : ""`;

  return `<${picker.component} label=${jsxString(spec.label)}${field.disabled ? " disabled" : ""}${className}${bounds} value={${value} ? ${parse} : null} onChange={(next) => ${b.set(spec, next)}} slotProps={{ textField: { ${textField} } }} />`;
};

const renderControl = (spec: FieldSpec, ctx: Ctx): string => {
  const { binding: b, uiImports: ui } = ctx;
  const { field } = spec;
  const err = b.error(spec);
  const value = b.value(spec);
  const label = jsxString(spec.label);
  const options = ctx.optionConsts.get(spec.name) ?? "[]";
  const common = `id="${spec.name}" label=${label}${flags(field, spec)} onBlur={${b.blur(spec)}} error={Boolean(${err})} helperText={${err}}`;

  switch (field.type) {
    case "select":
      ui.add("TextField").add("MenuItem");
      return `<TextField select fullWidth ${common} value={${value}} onChange={(event) => ${b.set(spec, "event.target.value")}}${inputRef(b.ref)}>{${options}.map((option) => (<MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>))}</TextField>`;

    case "combobox":
      ui.add("Autocomplete").add("TextField");
      return `<Autocomplete${field.disabled ? " disabled" : ""}${field.className ? ` className=${jsxString(field.className)}` : ""} options={${options}} value={${options}.find((option) => option.value === ${value}) ?? null} onChange={(_, option) => ${b.set(spec, `option?.value ?? ""`)}} onBlur={${b.blur(spec)}} renderInput={(params) => (<TextField {...params} id="${spec.name}" label=${label}${spec.required ? " required" : ""} error={Boolean(${err})} helperText={${err}}${inputRef(b.ref)} />)} />`;

    case "multiselect":
      ui.add("Autocomplete").add("TextField");
      return `<Autocomplete multiple disableCloseOnSelect filterSelectedOptions${field.disabled ? " disabled" : ""}${field.className ? ` className=${jsxString(field.className)}` : ""} options={${options}} value={${options}.filter((option) => ${value}.includes(option.value))} onChange={(_, selected) => ${b.set(spec, "selected.map((option) => option.value)")}} onBlur={${b.blur(spec)}} renderInput={(params) => (<TextField {...params} id="${spec.name}" label=${label} error={Boolean(${err})} helperText={${err}}${inputRef(b.ref)} />)} />`;

    case "radiogroup":
      ui.add("FormControl").add("FormLabel").add("RadioGroup").add("FormControlLabel").add("Radio");
      return `<FormControl error={Boolean(${err})}${flags(field, spec)}><FormLabel id="${spec.name}-label">${jsxText(spec.label)}</FormLabel><RadioGroup aria-labelledby="${spec.name}-label" name="${spec.name}" value={${value}} onChange={(event) => ${b.set(spec, "event.target.value")}} onBlur={${b.blur(spec)}}>{${options}.map((option) => (<FormControlLabel key={option.value} value={option.value} control={<Radio />} label={option.label} />))}</RadioGroup>${helper(err, ctx)}</FormControl>`;

    case "checkboxgroup":
      ui.add("FormControl").add("FormLabel").add("FormGroup").add("FormControlLabel").add("Checkbox");
      return `<FormControl component="fieldset" variant="standard" error={Boolean(${err})}${flags(field, spec)}><FormLabel component="legend">${jsxText(spec.label)}</FormLabel><FormGroup>{${options}.map((option) => (<FormControlLabel key={option.value} label={option.label} control={<Checkbox checked={${value}.includes(option.value)} onChange={(event) => ${b.set(spec, `event.target.checked ? [...${value}, option.value] : ${value}.filter((item) => item !== option.value)`)}} onBlur={${b.blur(spec)}} />} />))}</FormGroup>${helper(err, ctx)}</FormControl>`;

    case "checkbox":
      ui.add("FormControl").add("FormControlLabel").add("Checkbox");
      return `<FormControl error={Boolean(${err})}${flags(field, spec)}><FormControlLabel label=${label} control={<Checkbox checked={${value}} onChange={(event) => ${b.set(spec, "event.target.checked")}} onBlur={${b.blur(spec)}}${slotRef(b.ref)} />} />${helper(err, ctx)}</FormControl>`;

    case "switch":
      ui.add("FormControlLabel").add("Switch");
      return `<FormControlLabel${field.disabled ? " disabled" : ""}${field.className ? ` className=${jsxString(field.className)}` : ""} label=${label} control={<Switch checked={${value}} onChange={(event) => ${b.set(spec, "event.target.checked")}} onBlur={${b.blur(spec)}}${slotRef(b.ref)} />} />`;

    case "slider":
      ui.add("FormControl").add("FormLabel").add("Slider");
      return `<FormControl fullWidth${flags(field)}><FormLabel id="${spec.name}-label">${jsxText(spec.label)}</FormLabel><Slider aria-labelledby="${spec.name}-label" value={${value}} min={${field.min ?? 0}} max={${field.max ?? 100}} step={${field.step ?? 1}} valueLabelDisplay="auto" onChange={(_, next) => ${b.set(spec, "next as number")}} onBlur={${b.blur(spec)}} /></FormControl>`;

    case "rating":
      ui.add("FormControl").add("FormLabel").add("Rating");
      return `<FormControl error={Boolean(${err})}${flags(field, spec)}><FormLabel id="${spec.name}-label">${jsxText(spec.label)}</FormLabel><Rating aria-labelledby="${spec.name}-label" name="${spec.name}" value={${value}} max={${field.max ?? 5}} onChange={(_, next) => ${b.set(spec, "next ?? 0")}} onBlur={${b.blur(spec)}} />${helper(err, ctx)}</FormControl>`;

    case "file": {
      ui.add("FormControl").add("FormLabel").add("Button");
      const accept = spec.file?.accept?.join(",");
      return `<FormControl error={Boolean(${err})}${flags(field, spec)}><FormLabel>${jsxText(spec.label)}</FormLabel><Button component="label" variant="outlined" sx={{ alignSelf: "flex-start", mt: 1 }}>{${value}.length > 0 ? ${value}.map((file) => file.name).join(", ") : "Choose a file"}<input hidden type="file"${accept ? ` accept=${jsxString(accept)}` : ""} onChange={(event) => ${b.set(spec, "Array.from(event.target.files ?? [])")}} /></Button>${helper(err, ctx)}</FormControl>`;
    }

    case "date":
    case "time":
    case "datetime":
      return renderPicker(spec, ctx);

    default: {
      ui.add("TextField");
      const type = TEXT_TYPES[field.type];
      const multiline =
        field.type === "textarea" ? ` multiline minRows={${field.rowNumber ?? 3}}` : "";
      const shrink =
        type && SHRINK_TYPES.has(type)
          ? ` slotProps={{ inputLabel: { shrink: true } }}`
          : "";
      return `<TextField fullWidth${type ? ` type="${type}"` : ""}${multiline} ${common}${shrink} value={${value}} onChange={(event) => ${b.set(spec, "event.target.value")}}${inputRef(b.ref)} />`;
    }
  }
};

/** MUI inputs are controlled components, so every field goes through the controlled API. */
export const renderMuiField = (spec: FieldSpec, ctx: Ctx) =>
  ctx.binding.scope(spec, renderControl(spec, ctx), true);

const HEADING_VARIANTS = { h1: "h4", h2: "h5", h3: "h6", h4: "subtitle1" };

export const renderMuiLayout = (field: FormField, ctx: Ctx): string => {
  const ui = ctx.uiImports;
  const cls = field.className ? ` className=${jsxString(field.className)}` : "";

  switch (field.type) {
    case "heading": {
      ui.add("Typography");
      const level = field.headingLevel ?? "h2";
      return `<Typography variant="${HEADING_VARIANTS[level]}" component="${level}"${cls}>${jsxText(field.content ?? "")}</Typography>`;
    }
    case "paragraph":
      ui.add("Typography");
      return `<Typography variant="body2" color="text.secondary"${cls}>${jsxText(field.content ?? "")}</Typography>`;
    case "alert":
      ui.add("Alert");
      return `<Alert severity="${field.severity ?? "info"}"${cls}>${jsxText(field.content ?? "")}</Alert>`;
    case "divider":
      ui.add("Divider");
      return `<Divider${cls} />`;
    case "spacer":
      ui.add("Box");
      return `<Box aria-hidden sx={{ height: ${field.height ?? 24} }} />`;
    case "image":
      ui.add("Box");
      return field.src
        ? `<Box component="img" src=${jsxString(field.src)} alt=${jsxString(field.alt ?? "")}${cls} sx={{ width: "100%", height: ${field.height ?? 160}, objectFit: "cover", borderRadius: 2 }} />`
        : `{/* Image: no source set yet */}`;
    case "button": {
      ui.add("Button");
      const variant = field.buttonVariant ?? "contained";
      const label = jsxText(field.label || "Submit");
      if (field.buttonType === "reset") {
        return `<Button variant="${variant}" onClick={${ctx.binding.reset}}${cls}>${label}</Button>`;
      }
      if (field.buttonType === "button") {
        return `<Button variant="${variant}"${cls}>${label}</Button>`;
      }
      const s = ctx.binding.submitting;
      return ctx.binding.withSubmitting(
        `<Button type="submit" variant="${variant}" loading={${s}}${cls}>${label}</Button>`,
      );
    }
    default:
      return "";
  }
};

export const renderMuiDefaultActions = (ctx: Ctx) => {
  ctx.uiImports.add("Stack").add("Button");
  const s = ctx.binding.submitting;
  return `<Stack direction="row" spacing={1.5}>${ctx.binding.withSubmitting(
    `<Button type="submit" variant="contained" loading={${s}}>Submit</Button>`,
  )}<Button variant="outlined" onClick={${ctx.binding.reset}}>Reset</Button></Stack>`;
};

export const renderMuiRow = (cells: string[], ctx: Ctx) => {
  if (cells.length < 2) return cells[0];
  ctx.uiImports.add("Box");
  return `<Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { sm: "repeat(2, minmax(0, 1fr))" } }}>${cells.join("")}</Box>`;
};
