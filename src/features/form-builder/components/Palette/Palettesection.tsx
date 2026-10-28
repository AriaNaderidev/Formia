import { useId, useState, type ReactNode } from "react";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";

import ExpandMore from "@mui/icons-material/ExpandMore";

type PaletteSectionProps = {
  label: string;
  count: number;
  /** Keeps the section open while the user is searching. */
  forceOpen?: boolean;
  children: ReactNode;
};

export const PaletteSection = ({
  label,
  count,
  forceOpen = false,
  children,
}: PaletteSectionProps) => {
  const [open, setOpen] = useState(true);
  const panelId = useId();
  const expanded = forceOpen || open;

  return (
    <Box component="section" sx={{ py: 0.5 }}>
      <ButtonBase
        onClick={() => setOpen((prev) => !prev)}
        disabled={forceOpen}
        aria-expanded={expanded}
        aria-controls={panelId}
        sx={{
          width: "100%",
          justifyContent: "space-between",
          px: 0.5,
          py: 0.75,
          borderRadius: 1,
          "&.Mui-focusVisible": {
            outline: "2px solid",
            outlineColor: "primary.main",
          },
        }}
      >
        <Typography variant="subtitle2" component="span">
          {label}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            color: "text.secondary",
          }}
        >
          <Typography variant="caption" component="span">
            {count}
          </Typography>
          <ExpandMore
            fontSize="small"
            sx={(theme) => ({
              transform: expanded
                ? "none"
                : `rotate(${theme.direction === "rtl" ? 90 : -90}deg)`,
              transition: theme.transitions.create("transform", {
                duration: theme.transitions.duration.shorter,
              }),
            })}
          />
        </Box>
      </ButtonBase>

      <Collapse in={expanded} id={panelId}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(92px, 1fr))",
            gap: 1,
            pt: 0.75,
            pb: 1,
          }}
        >
          {children}
        </Box>
      </Collapse>
    </Box>
  );
};
