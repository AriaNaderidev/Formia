import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";
import Clear from "@mui/icons-material/Clear";
import Search from "@mui/icons-material/Search";

type PaletteSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export const PaletteSearch = ({ value, onChange }: PaletteSearchProps) => (
  <OutlinedInput
    fullWidth
    size="small"
    value={value}
    onChange={(event) => onChange(event.target.value)}
    placeholder="Search fields"
    inputProps={{ "aria-label": "Search fields" }}
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
