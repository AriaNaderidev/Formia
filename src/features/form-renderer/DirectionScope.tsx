import type { ReactNode } from "react";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import rtlPlugin from "stylis-plugin-rtl";
import type { FormDirection } from "../form-schema";

// MUI styles use physical sides (`left`, `margin-right`...). This cache flips them for RTL,
// so labels, adornments and menus mirror correctly. Built once and shared.
const rtlCache = createCache({ key: "muirtl", stylisPlugins: [rtlPlugin] });

/**
 * Makes the MUI controls inside read in the form's direction. Only the form is affected:
 * the builder around it stays left-to-right. `dir` itself is set on the form element.
 */
export const DirectionScope = ({
  direction,
  children,
}: {
  direction: FormDirection;
  children: ReactNode;
}) => {
  if (direction !== "rtl") return <>{children}</>;

  return (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={(outer) => createTheme(outer, { direction: "rtl" })}>
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
};
