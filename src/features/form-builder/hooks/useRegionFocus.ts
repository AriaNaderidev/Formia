import { useCallback } from "react";
import { announce } from "@/ui/announce";
import { focusById, focusWhenReady, MAIN_ID } from "@/utils/focus";

type RegionFocusOptions = {
  /** The field list is always on screen; otherwise it lives in a drawer. */
  hasPaletteColumn: boolean;
  hasFields: boolean;
  openDrawer: () => void;
  showPane: (pane: "build" | "preview") => void;
};

const SEARCH_ID = "palette-search";

/**
 * Moves focus between the three regions of the builder. Shared by the skip links
 * and the Alt+number shortcuts. A region that is closed or hidden is opened first.
 */
export const useRegionFocus = ({
  hasPaletteColumn,
  hasFields,
  openDrawer,
  showPane,
}: RegionFocusOptions) => {
  // In the drawer the search box takes focus itself when it mounts (see Palette).
  const focusSearch = useCallback(() => {
    if (hasPaletteColumn) focusById(SEARCH_ID);
    else openDrawer();
  }, [hasPaletteColumn, openDrawer]);

  const focusFields = focusSearch;

  const focusCanvas = useCallback(() => {
    showPane("build");
    focusWhenReady(() =>
      document.querySelector<HTMLElement>("[data-field-trigger]") ??
      document.querySelector<HTMLElement>("[data-template-card]") ??
      document.getElementById(MAIN_ID),
    );
  }, [showPane]);

  const focusTemplates = useCallback(() => {
    if (hasFields) {
      announce("Templates are shown while the form is empty.");
      return;
    }
    focusWhenReady(() => document.querySelector<HTMLElement>("[data-template-card]"));
  }, [hasFields]);

  const focusPreview = useCallback(() => {
    if (!hasFields) {
      announce("The preview appears once the form has a field.");
      return;
    }
    showPane("preview");
    focusWhenReady(() =>
      document.querySelector<HTMLElement>("[role='tab'][aria-selected='true']"),
    );
  }, [hasFields, showPane]);

  return { focusSearch, focusFields, focusCanvas, focusTemplates, focusPreview };
};
