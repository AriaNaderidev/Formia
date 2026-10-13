export const fieldClass = (hasError: boolean, extra = "") =>
  [
    "w-full rounded-md border bg-white px-3 py-2 text-sm outline-none transition",
    hasError
      ? "border-red-400 focus:border-red-500"
      : "border-(--primary-border-color) focus:border-(--primary-btn-color)",
    extra,
  ]
    .filter(Boolean)
    .join(" ");

export const labelClass = (hasError: boolean) =>
  `text-sm font-medium ${hasError ? "text-red-400" : "text-stone-700"}`;
