import { useSyncExternalStore } from "react";
import { parseFormSchema, type FormTemplate } from "@/features/form-schema";

const STORAGE_KEY = "form-builder:user-templates";
export const MAX_USER_TEMPLATES = 24;

const listeners = new Set<() => void>();
let cache: FormTemplate[] | null = null;

/** Keeps only entries that still look like templates; one bad entry must not hide the rest. */
const read = (): FormTemplate[] => {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(raw)) return [];
    return raw.flatMap((entry): FormTemplate[] => {
      if (
        typeof entry?.id !== "string" ||
        typeof entry.title !== "string" ||
        !Array.isArray(entry.fields)
      ) {
        return [];
      }
      // Reuse the import validation (known types, safe names) on the stored fields.
      const parsed = parseFormSchema({
        version: 1,
        fields: entry.fields.map((field: object, index: number) => ({
          id: String(index),
          ...field,
        })),
      });
      return parsed.ok
        ? [
            {
              id: entry.id,
              title: entry.title,
              description: typeof entry.description === "string" ? entry.description : "",
              fields: entry.fields,
              custom: true,
            },
          ]
        : [];
    });
  } catch {
    return [];
  }
};

const write = (next: FormTemplate[]) => {
  cache = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage full or blocked: the templates last until the page is closed */
  }
  listeners.forEach((listener) => listener());
};

const getSnapshot = () => (cache ??= read());

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const userTemplates = {
  getAll: getSnapshot,
  /** @returns false when the limit is reached. */
  add: (template: FormTemplate) => {
    const current = getSnapshot();
    if (current.length >= MAX_USER_TEMPLATES) return false;
    write([template, ...current]);
    return true;
  },
  /** Puts a removed template back where it was (for Undo). */
  restore: (template: FormTemplate, index: number) => {
    const next = getSnapshot().filter((item) => item.id !== template.id);
    next.splice(Math.min(index, next.length), 0, template);
    write(next);
  },
  remove: (id: string) => write(getSnapshot().filter((item) => item.id !== id)),
};

export const useUserTemplates = () => useSyncExternalStore(subscribe, getSnapshot);
