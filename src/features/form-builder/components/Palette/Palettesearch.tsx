import type { KeyboardEvent } from "react";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";
import Clear from "@mui/icons-material/Clear";
import Search from "@mui/icons-material/Search";

type PaletteSearchProps = {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
};

export const PaletteSearch = ({
  value,
  onChange,
  autoFocus,
  onKeyDown,
}: PaletteSearchProps) => (
  <OutlinedInput
    fullWidth
    size="small"
    value={value}
    autoFocus={autoFocus}
    onChange={(event) => onChange(event.target.value)}
    onKeyDown={(event) => {
      // Escape empties the box first; with nothing to clear it reaches the drawer.
      if (event.key === "Escape" && value) {
        event.stopPropagation();
        onChange("");
        return;
      }
      onKeyDown?.(event);
    }}
    placeholder="Search fields"
    inputProps={{
      "aria-label": "Search fields",
      "aria-keyshortcuts": "/",
      id: "palette-search",
    }}
    startAdornment={
      <InputAdornment position="start">
        <Search fontSize="small" />
      </InputAdornment>
    }
    endAdornment={
      value ? (
        <InputAdornment position="end">
          <IconButton
            size="small"
            edge="end"
            aria-label="Clear search"
            onClick={() => onChange("")}
          >
            <Clear fontSize="small" />
          </IconButton>
        </InputAdornment>
      ) : null
    }
    sx={{ bgcolor: "background.paper" }}
  />
);
