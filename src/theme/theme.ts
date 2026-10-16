import { alpha, createTheme, type Shadows } from "@mui/material/styles";

/* ---------- design tokens ---------- */
// Keep these in sync with the @theme block in index.css.

const brand = {
  plum: "#522D60",
  plumDark: "#3A1F45", // derived: hover / pressed state of plum
  mauve: "#80426E",
  peach: "#F2A67B",
  honey: "#FFD38B",
} as const;

// Derived neutrals, tinted with plum so greys don't feel foreign next to the brand colors.
const neutral = {
  canvas: "#FBF8FC",
  surface: "#FFFFFF",
  ink: "#2A1633",
  inkMuted: "#6B5A73",
  line: "#E9E0EC",
} as const;

/* ---------- shadows ---------- */
// MUI reads 25 elevation levels (menus use 8, drawers 16, dialogs 24).
// Generating all of them avoids "invisible" popovers and dialogs.
const shadows = Array.from({ length: 25 }, (_, i) =>
  i === 0
    ? "none"
    : `0px ${Math.round(i * 0.5 + 1)}px ${Math.round(i * 1.25 + 2)}px ${alpha(
        neutral.ink,
        Math.min(0.05 + i * 0.004, 0.16),
      )}`,
) as Shadows;

/* ---------- theme ---------- */

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: brand.plum,
      light: brand.mauve,
      dark: brand.plumDark,
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: brand.peach,
      light: "#F8C4A5", // derived
      dark: "#D9835A", // derived
      contrastText: neutral.ink, // white on peach fails contrast
    },
    warning: {
      main: brand.honey,
      contrastText: neutral.ink,
    },
    background: {
      default: neutral.canvas,
      paper: neutral.surface,
    },
    text: {
      primary: neutral.ink,
      secondary: neutral.inkMuted,
    },
    divider: neutral.line,
  },

  typography: {
    // Must match the family name in @font-face (index.css).
    fontFamily: '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
    h1: { fontWeight: 700, letterSpacing: "-0.02em" },
    h2: { fontWeight: 700, letterSpacing: "-0.02em" },
    h3: { fontWeight: 600, letterSpacing: "-0.01em" },
    h4: { fontWeight: 600, letterSpacing: "-0.01em" },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },

  // Palette tiles use 2x / 1.5x of this value, so 8 gives 16px tiles and 12px icon boxes.
  shape: { borderRadius: 8 },

  shadows,

  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: ({ theme, ownerState }) => ({
          ...(ownerState.variant === "contained" &&
            ownerState.color === "primary" && {
              "&:hover": {
                boxShadow: `0px 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              },
            }),
        }),
      },
    },

    MuiPaper: {
      styleOverrides: { root: { backgroundImage: "none" } },
    },

    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: Number(theme.shape.borderRadius) * 1.5,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[1],
        }),
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.primary.light,
          },
          "&.Mui-focused": {
            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.15)}`,
          },
        }),
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: Number(theme.shape.borderRadius) * 2,
        }),
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: ({ theme }) => ({
          backgroundColor: theme.palette.text.primary,
          fontSize: theme.typography.caption.fontSize,
        }),
        arrow: ({ theme }) => ({ color: theme.palette.text.primary }),
      },
    },
  },
});
