/**
 * Values are the same strings the native inputs produce, so validation and
 * generated code don't change: "2026-10-27", "14:30", "2026-10-27T14:30".
 * Those sort correctly as plain text, which the bounds checks rely on.
 */
export type PickerKind = "date" | "time" | "datetime";

export type Bounds = { min?: string; max?: string };

const pad = (value: number) => String(value).padStart(2, "0");

export const toDateKey = (year: number, month: number, day: number) =>
  `${year}-${pad(month + 1)}-${pad(day)}`;

export const toTimeKey = (hours: number, minutes: number) =>
  `${pad(hours)}:${pad(minutes)}`;

export const todayKey = (now = new Date()) =>
  toDateKey(now.getFullYear(), now.getMonth(), now.getDate());

export const nowKey = (now = new Date()) =>
  toTimeKey(now.getHours(), now.getMinutes());

/** The date and time halves of a value. Either is undefined when it isn't there. */
export const splitValue = (kind: PickerKind, value: string) => {
  const date =
    kind === "time" ? undefined : /^\d{4}-\d{2}-\d{2}/.exec(value)?.[0];
  const time = (kind === "time" ? /^\d{2}:\d{2}$/ : /T(\d{2}:\d{2})/).exec(
    value,
  )?.[kind === "time" ? 0 : 1];
  return { date, time };
};

export const joinValue = (kind: PickerKind, date?: string, time?: string) => {
  if (kind === "date") return date ?? "";
  if (kind === "time") return time ?? "";
  return date && time ? `${date}T${time}` : "";
};

export const parseDateKey = (key: string) => {
  const [year, month, day] = key.split("-").map(Number);
  return { year, month: month - 1, day };
};

export const daysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();

export const isOutside = (value: string, { min, max }: Bounds) =>
  Boolean((min && value < min) || (max && value > max));

/** A whole day is out of range when it ends before `min` or starts after `max`. */
export const isDayOutside = (dateKey: string, { min, max }: Bounds) =>
  Boolean(
    (min && dateKey < min.slice(0, 10)) || (max && dateKey > max.slice(0, 10)),
  );

/** Pulls a candidate value back inside the bounds. */
export const clamp = (value: string, { min, max }: Bounds) =>
  min && value < min ? min : max && value > max ? max : value;

export const formatValue = (
  kind: PickerKind,
  value: string,
  locale?: string,
): string => {
  const { date, time } = splitValue(kind, value);
  if (kind !== "time" && !date) return "";
  if (kind !== "date" && !time)
    return kind === "time" ? "" : formatValue("date", date ?? "", locale);

  const { year, month, day } = date
    ? parseDateKey(date)
    : { year: 1970, month: 0, day: 1 };
  const [hours, minutes] = (time ?? "00:00").split(":").map(Number);
  const moment = new Date(year, month, day, hours, minutes);

  return new Intl.DateTimeFormat(locale, {
    ...(kind !== "time" && { dateStyle: "medium" as const }),
    ...(kind !== "date" && { timeStyle: "short" as const }),
  }).format(moment);
};
