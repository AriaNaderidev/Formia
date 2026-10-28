import { useCallback, useState } from "react";

const read = <T,>(key: string, fallback: T, isValid?: (value: unknown) => boolean): T => {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return !isValid || isValid(parsed) ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
};

/**
 * useState that remembers its value across visits. For small preferences only.
 * Storage can be unavailable (private mode, blocked cookies); it then behaves like useState.
 */
export const useLocalStorageState = <T,>(
  key: string,
  fallback: T,
  isValid?: (value: unknown) => boolean,
) => {
  const [value, setValue] = useState<T>(() => read(key, fallback, isValid));

  const update = useCallback(
    (next: T) => {
      setValue(next);
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* storage full or blocked: keep the in-memory value */
      }
    },
    [key],
  );

  return [value, update] as const;
};

/** Validator for string-union preferences. */
export const oneOf =
  <T extends string>(...values: T[]) =>
  (value: unknown): value is T =>
    values.includes(value as T);
