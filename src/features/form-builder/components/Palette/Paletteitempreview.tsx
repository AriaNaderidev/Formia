import { getCatalogField } from "@/features/form-schema";
import { PaletteItemView } from "./Paletteitemview";
import { toPaletteEntry } from "./palette_config";

type PaletteItemPreviewProps = {
  id: string;
};

/** Render inside <DragOverlay> while a palette item is being dragged. */
export const PaletteItemPreview = ({ id }: PaletteItemPreviewProps) => {
  const field = getCatalogField(id);
  if (!field) return null;

  return <PaletteItemView entry={toPaletteEntry(field)} overlay />;
};
