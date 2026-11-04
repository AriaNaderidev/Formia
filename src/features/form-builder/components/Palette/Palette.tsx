import { useState, type KeyboardEvent } from "react";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import { PaletteItem } from "./PaletteItem";
import { usePaletteGroups } from "../../hooks/usePaletteGroup";
import { PaletteSearch } from "./Palettesearch";
import { PaletteEmptyState } from "./Paletteemptystate";
import { PaletteSection } from "./Palettesection";

type PaletteProps = {
  /** Called after a click adds a field (the palette is a closable drawer on small screens). */
  onAdd?: () => void;
};

const ARROW_STEPS: Record<string, number> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

export const Palette = ({ onAdd }: PaletteProps) => {
  const [query, setQuery] = useState("");
  const { groups, total, isFiltering } = usePaletteGroups(query);

  const getTiles = (root: HTMLElement) =>
    Array.from(root.querySelectorAll<HTMLElement>("[data-palette-item]"));

  /** Arrow keys, Home and End walk the field tiles in reading order; Tab still works too. */
  const onTilesKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const tiles = getTiles(event.currentTarget);
    const index = tiles.findIndex((tile) => tile === document.activeElement);
    if (index === -1) return;

    const step = ARROW_STEPS[event.key];
    const next =
      step !== undefined
        ? index + step
        : event.key === "Home"
          ? 0
          : event.key === "End"
            ? tiles.length - 1
            : null;
    if (next === null) return;

    event.preventDefault();
    tiles[Math.min(Math.max(next, 0), tiles.length - 1)]?.focus();
  };

  /** From the search box, Down enters the results. */
  const onSearchKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "ArrowDown") return;
    const first = getTiles(event.currentTarget.closest("aside") ?? event.currentTarget)[0];
    if (!first) return;
    event.preventDefault();
    first.focus();
  };

  return (
    <Box
      component="aside"
      aria-label="Form fields"
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        bgcolor: "background.default",
        borderInlineEnd: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Fields
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Drag a field onto your form, or press Enter on one.
        </Typography>
        <PaletteSearch
          value={query}
          onChange={setQuery}
          // The drawer opens for a search, so the box is ready to type in.
          autoFocus={onAdd !== undefined}
          onKeyDown={onSearchKeyDown}
        />
      </Box>

      <Divider />

      <Box
        onKeyDown={onTilesKeyDown}
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          px: 2,
          py: 1,
          scrollbarGutter: "stable",
        }}
      >
        {groups.length === 0 ? (
          <PaletteEmptyState query={query} onClear={() => setQuery("")} />
        ) : (
          groups.map((group) => (
            <PaletteSection
              key={group.id}
              label={group.label}
              count={group.items.length}
              forceOpen={isFiltering}
            >
              {group.items.map((entry) => (
                <PaletteItem key={entry.id} entry={entry} onAdd={onAdd} />
              ))}
            </PaletteSection>
          ))
        )}
      </Box>

      <span role="status" style={visuallyHidden}>
        {isFiltering ? `${total} fields found` : ""}
      </span>
    </Box>
  );
};
