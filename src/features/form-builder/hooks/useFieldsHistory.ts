import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  normalizeContainers,
  normalizeRows,
  parseFormSchema,
  toFormSchema,
  type FormDirection,
  type FormField,
} from "@/features/form-schema";

const STORAGE_KEY = "form-builder:schema";
const HISTORY_LIMIT = 100;

/** Tabs and sections closed properly first, then rows in canonical pairs. */
const normalize = (fields: FormField[]) => normalizeRows(normalizeContainers(fields));
const SAVE_DELAY_MS = 400;

type History = {
  past: FormField[][];
  present: FormField[];
  future: FormField[][];
};

/** The last autosaved form, if it is still valid. */
const loadSaved = (): { fields: FormField[]; direction: FormDirection } => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { fields: [], direction: "ltr" };
    const result = parseFormSchema(JSON.parse(raw));
    return result.ok
      ? {
          fields: normalize(result.schema.fields),
          direction: result.schema.direction ?? "ltr",
        }
      : { fields: [], direction: "ltr" };
  } catch {
    return { fields: [], direction: "ltr" };
  }
};

/**
 * The form's fields, with undo/redo and autosave.
 * Every write (drag, insert, delete, edit, import) passes through `setFields`,
 * so every one of them is undoable and normalized into canonical rows.
 */
export const useFieldsHistory = () => {
  const [saved] = useState(loadSaved);
  const [history, setHistory] = useState<History>(() => ({
    past: [],
    present: saved.fields,
    future: [],
  }));
  const fields = history.present;

  // Direction is a form setting, not an edit: it is saved with the fields but not undoable.
  const [direction, setDirection] = useState<FormDirection>(saved.direction);
  const directionRef = useRef(direction);
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);
  const getDirection = useCallback(() => directionRef.current, []);

  const setFields = useCallback<Dispatch<SetStateAction<FormField[]>>>((action) => {
    setHistory((prev) => {
      const next = normalize(typeof action === "function" ? action(prev.present) : action);
      if (next === prev.present) return prev;
      return {
        past: [...prev.past, prev.present].slice(-HISTORY_LIMIT),
        present: next,
        future: [],
      };
    });
  }, []);

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;
      return {
        past: prev.past.slice(0, -1),
        present: prev.past[prev.past.length - 1],
        future: [prev.present, ...prev.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;
      return {
        past: [...prev.past, prev.present],
        present: prev.future[0],
        future: prev.future.slice(1),
      };
    });
  }, []);

  // Stable reader for callbacks that need the latest list without re-rendering on it.
  const fieldsRef = useRef(fields);
  useEffect(() => {
    fieldsRef.current = fields;
  }, [fields]);
  const getFields = useCallback(() => fieldsRef.current, []);

  // Debounced autosave.
  const [savedAt, setSavedAt] = useState<number | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toFormSchema(fields, direction)));
        setSavedAt(Date.now());
      } catch {
        /* storage full or blocked: the session still works, it just won't persist */
      }
    }, SAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [fields, direction]);

  // A refresh, update or tab close inside the debounce window would drop the last edit.
  useEffect(() => {
    const flush = () => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(toFormSchema(fieldsRef.current, directionRef.current)),
        );
      } catch {
        /* storage full or blocked */
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return {
    fields,
    setFields,
    getFields,
    direction,
    setDirection,
    getDirection,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    savedAt,
  };
};
