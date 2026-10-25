import type { FieldType, FieldValidation } from "./types";

/** Stored in dateTimeEarliest / dateTimeLatest to mean "the current day". */
export const TODAY = "today";

export type TemporalType = "date" | "time" | "datetime";

export const isTemporalType = (type: FieldType): type is TemporalType =>
  type === "date" || type === "time" || type === "datetime";

type Edge = "earliest" | "latest";
export type ResolvedBounds = { earliest?: string; latest?: string };

const pad = (value: number) => String(value).padStart(2, "0");

/** Today in the user's own time zone. (toISOString() would give the UTC date.) */
export const getLocalDate = (now = new Date()) =>
  `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

/** The format each native input produces. These strings sort correctly as text. */
const SHAPES: Record<TemporalType, RegExp> = {
  date: /^\d{4}-\d{2}-\d{2}$/,
  time: /^\d{2}:\d{2}$/,
  datetime: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/,
};

/**
 * A stored bound is usable when it matches the field type's format, or is the
 * "today" token on a type where that makes sense (not on time fields).
 */
export const isValidBound = (
  type: TemporalType,
  value: string | undefined,
): value is string => {
  if (!value) return false;
  if (value === TODAY) return type !== "time";
  return SHAPES[type].test(value);
};

/**
 * Turns a stored bound into a concrete value that can be compared as text.
 * For datetime, "today" means the start of the day (earliest) or its end (latest).
 */
export const resolveBound = (
  type: TemporalType,
  value: string | undefined,
  edge: Edge,
  now = new Date(),
): string | undefined => {
  if (!isValidBound(type, value)) return undefined;
  if (value !== TODAY) return value;

  const today = getLocalDate(now);
  if (type === "date") return today;
  return `${today}T${edge === "earliest" ? "00:00" : "23:59"}`;
};

/** The limits that are actually switched on, already resolved. */
export const getActiveBounds = (
  type: TemporalType,
  validation: FieldValidation | undefined,
  now = new Date(),
): ResolvedBounds => ({
  earliest: validation?.useMin
    ? resolveBound(type, validation.dateTimeEarliest, "earliest", now)
    : undefined,
  latest: validation?.useMax
    ? resolveBound(type, validation.dateTimeLatest, "latest", now)
    : undefined,
});

export const isWithinBounds = (value: string, bounds: ResolvedBounds) =>
  (!bounds.earliest || value >= bounds.earliest) &&
  (!bounds.latest || value <= bounds.latest);

export const boundsAreOrdered = ({ earliest, latest }: ResolvedBounds) =>
  !earliest || !latest || earliest <= latest;

/** For the native <input min max>. */
export const getInputBounds = (
  type: TemporalType,
  validation: FieldValidation | undefined,
  now = new Date(),
) => {
  const { earliest, latest } = getActiveBounds(type, validation, now);
  return { min: earliest, max: latest };
};

/**
 * Error text for a value outside the limits, or undefined when it is fine.
 * An empty value is not an error here: `required` decides that.
 */
export const getTemporalError = (
  type: TemporalType,
  value: string | undefined,
  validation: FieldValidation | undefined,
  now = new Date(),
): string | undefined => {
  if (!value) return undefined;

  const { earliest, latest } = getActiveBounds(type, validation, now);
  if (earliest && value < earliest) {
    return validation?.minMessage || `Must not be before ${earliest}`;
  }
  if (latest && value > latest) {
    return validation?.maxMessage || `Must not be after ${latest}`;
  }
  return undefined;
};