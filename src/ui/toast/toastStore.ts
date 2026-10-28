import type { ReactNode } from "react";

export type ToastVariant = "success" | "error" | "info";

export type ToastOptions = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  /** Milliseconds before it closes itself. `null` keeps it open until dismissed. */
  duration?: number | null;
  action?: { label: string; onClick: () => void };
  /** Rich body, shown under the title. */
  content?: ReactNode;
  /** Wider card, for rich content. */
  wide?: boolean;
  /** A new toast with the same key replaces the previous one instead of stacking. */
  key?: string;
};

export type Toast = ToastOptions & {
  id: number;
  variant: ToastVariant;
  duration: number | null;
  /** Playing its exit animation; removed when that ends. */
  leaving: boolean;
};

const MAX_VISIBLE = 4;
const DEFAULT_DURATION = 4000;

let toasts: Toast[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

const emit = (next: Toast[]) => {
  toasts = next;
  listeners.forEach((listener) => listener());
};

export const toastStore = {
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => toasts,
  /** Final removal, after the exit animation. */
  remove: (id: number) => emit(toasts.filter((item) => item.id !== id)),
};

const show = (options: ToastOptions) => {
  const id = nextId++;
  const toast: Toast = {
    ...options,
    id,
    variant: options.variant ?? "info",
    duration:
      options.duration === undefined ? DEFAULT_DURATION : options.duration,
    leaving: false,
  };

  const replaced = (item: Toast) => Boolean(options.key) && item.key === options.key;
  // Oldest visible toasts leave first when the stack is full.
  const visible = toasts.filter((item) => !item.leaving && !replaced(item));
  const overflow = new Set(
    visible.slice(0, Math.max(0, visible.length - MAX_VISIBLE + 1)).map((item) => item.id),
  );
  emit([
    ...toasts.map((item) =>
      overflow.has(item.id) || replaced(item) ? { ...item, leaving: true } : item,
    ),
    toast,
  ]);
  return id;
};

const dismiss = (id: number) =>
  emit(toasts.map((item) => (item.id === id ? { ...item, leaving: true } : item)));

/** Dismisses the toast with this key, if one is showing. */
const dismissKey = (key: string) =>
  emit(toasts.map((item) => (item.key === key ? { ...item, leaving: true } : item)));

type Shortcut = Omit<ToastOptions, "variant" | "title">;

export const toast = {
  show,
  dismiss,
  dismissKey,
  success: (title: string, options?: Shortcut) =>
    show({ ...options, title, variant: "success" }),
  error: (title: string, options?: Shortcut) =>
    show({ ...options, title, variant: "error" }),
  info: (title: string, options?: Shortcut) =>
    show({ ...options, title, variant: "info" }),
};
