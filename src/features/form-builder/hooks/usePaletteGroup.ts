import { useMemo } from "react";

import { FIELD_CATALOG } from "../../form-schema";
import {
  PALETTE_CATEGORIES,
  toPaletteEntry,
  type PaletteEntry,
} from "../components/Palette/PaletteConfig";

const ENTRIES: PaletteEntry[] = FIELD_CATALOG.map(toPaletteEntry);

const matches = (entry: PaletteEntry, query: string) =>
  [entry.title, entry.description, entry.type].some((value) =>
    value.toLowerCase().includes(query),
  );

export const usePaletteGroups = (rawQuery: string) =>
  useMemo(() => {
    const query = rawQuery.trim().toLowerCase();
    const visible = query ? ENTRIES.filter((e) => matches(e, query)) : ENTRIES;

    const groups = PALETTE_CATEGORIES.map((category) => ({
      ...category,
      items: visible.filter((entry) => entry.category === category.id),
    })).filter((group) => group.items.length > 0);

    return { groups, total: visible.length, isFiltering: query.length > 0 };
  }, [rawQuery]);
