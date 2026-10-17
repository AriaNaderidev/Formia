import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type PaletteEmptyStateProps = {
  query: string;
  onClear: () => void;
};

export const PaletteEmptyState = ({
  query,
  onClear,
}: PaletteEmptyStateProps) => (
  <Stack spacing={1} sx={{ py: 6, textAlign: "center", alignItems: "center" }}>
    <Typography variant="body2" sx={{ fontWeight: 500 }}>
      No fields match <span className="wrap-anywhere">“{query.trim()}”</span>
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Try a broader word, like “text” or “date”.
    </Typography>
    <Button size="small" variant="contained" onClick={onClear}>
      Clear search
    </Button>
  </Stack>
);
