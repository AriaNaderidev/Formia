import { useState } from "react";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import { PaletteSearch } from "./Palettesearch";
import { PaletteSection } from "./Palettesection";
import { PaletteItem } from "./PaletteItem";
import { PaletteEmptyState } from "./Paletteemptystate";
import { usePaletteGroups } from "../../hooks/usePaletteGroup";

export const Palette = () => {
  const [query, setQuery] = useState("");
  const { groups, total, isFiltering } = usePaletteGroups(query);

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
          Drag a field onto your form.
        </Typography>
        <PaletteSearch value={query} onChange={setQuery} />
      </Box>

      <Divider />

      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: 2, py: 1 }}>
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
                <PaletteItem key={entry.id} entry={entry} />
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
