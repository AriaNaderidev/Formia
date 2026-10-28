import { forwardRef, type HTMLAttributes } from "react";
import { alpha, styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import type { PaletteEntry } from "./palette_config";

const Tile = styled("div", {
  shouldForwardProp: (prop) => prop !== "dragging" && prop !== "overlay",
})<{ dragging?: boolean; overlay?: boolean }>(
  ({ theme, dragging, overlay }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: theme.spacing(1),
    padding: theme.spacing(1.5, 1),
    borderRadius: Number(theme.shape.borderRadius) * 2,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    cursor: "grab",
    userSelect: "none",
    touchAction: "none",
    transition: theme.transitions.create(
      ["border-color", "background-color", "box-shadow", "transform"],
      { duration: theme.transitions.duration.shorter },
    ),

    "& .palette-icon": {
      transition: theme.transitions.create(
        ["background-color", "color", "transform"],
        { duration: theme.transitions.duration.shorter },
      ),
    },

    "&:hover": {
      borderColor: theme.palette.primary.main,
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
      transform: "translateY(-2px)",
      boxShadow: `0 6px 16px -8px ${alpha(theme.palette.primary.main, 0.45)}`,
    },
    "&:hover .palette-icon": {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      transform: "rotate(-6deg) scale(1.06)",
    },
    "&:active": {
      transform: "translateY(0) scale(0.96)",
      boxShadow: "none",
    },
    "@media (prefers-reduced-motion: reduce)": {
      "&, &:hover, &:active, &:hover .palette-icon": { transform: "none" },
    },
    "&:focus-visible": {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: 2,
    },

    ...(dragging && { opacity: 0.35, borderStyle: "dashed" }),
    ...(overlay && {
      width: 112,
      cursor: "grabbing",
      "&, &:hover": { transform: "rotate(-3deg) scale(1.04)" },
      borderColor: theme.palette.primary.main,
      boxShadow: theme.shadows[8],
    }),
  }),
);

const IconBox = styled("span")(({ theme }) => ({
  display: "grid",
  placeItems: "center",
  width: 36,
  height: 36,
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  color: theme.palette.primary.main,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
}));

type PaletteItemViewProps = HTMLAttributes<HTMLDivElement> & {
  entry: PaletteEntry;
  dragging?: boolean;
  overlay?: boolean;
};

/** Pure presentation. Shared by the draggable tile and the drag overlay. */
export const PaletteItemView = forwardRef<HTMLDivElement, PaletteItemViewProps>(
  ({ entry, dragging, overlay, ...rest }, ref) => {
    const Icon = entry.icon;

    return (
      <Tile ref={ref} dragging={dragging} overlay={overlay} {...rest}>
        <IconBox className="palette-icon">
          <Icon fontSize="small" />
        </IconBox>
        <Typography
          variant="body2"
          component="span"
          sx={{ fontWeight: 500, lineHeight: 1.25, textAlign: "center" }}
        >
          {entry.title}
        </Typography>
      </Tile>
    );
  },
);

PaletteItemView.displayName = "PaletteItemView";
