import { FIELD_CATALOG } from "../../form-schema";
import { PaletteItem } from "./PaletteItem";

export const Palette = () => (
  <aside className="flex h-full w-full flex-col items-center justify-center gap-3 overflow-x-auto bg-[#10b981] px-2">
    {FIELD_CATALOG.map((field) => (
      <PaletteItem id={field.id} name={field.name} key={field.id} />
    ))}
  </aside>
);
