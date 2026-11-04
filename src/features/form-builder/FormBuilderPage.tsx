import { useCallback, useMemo, useState } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import useMediaQuery from "@mui/material/useMediaQuery";
import { SegmentedControl } from "@/ui/SegmentedControl";
import { isPaletteId } from "../form-schema";
import { FormBuilderProvider } from "./context/FormBuilderProvider";
import { useFormBuilderDnd } from "./hooks/useFormBuilderDnd";
import { useFieldsHistory } from "./hooks/useFieldsHistory";
import { useUndoShortcuts } from "./hooks/useUndoShortcuts";
import { useRegionFocus } from "./hooks/useRegionFocus";
import {
  createAnnouncements,
  SCREEN_READER_INSTRUCTIONS,
} from "./hooks/dndAccessibility";
import { useGlobalShortcuts } from "./shortcuts/useGlobalShortcuts";
import { ShortcutsDialog } from "./shortcuts/ShortcutsDialog";
import { SkipLinks } from "./shortcuts/SkipLinks";
import { MAIN_ID } from "@/utils/focus";
import { Palette, PaletteItemPreview } from "./components/Palette";
import { PreviewPanel } from "../preview/PreviewPanel";
import { DropEmptyState } from "./components/DropEmptyState";
import { Canvas } from "./components/Canvas/Canvas";
import { AppHeader } from "./components/AppHeader";
import {
  formBuilderCollision,
  restrictReorderToYAxis,
  useFormBuilderSensors,
} from "./hooks/dnd_config";

/** Tailwind's `lg`: the palette gets its own column from here up. */
const PALETTE_COLUMN_QUERY = "(min-width: 64rem)";

type Pane = "build" | "preview";

const PANES = [
  { value: "build" as const, label: "Build" },
  { value: "preview" as const, label: "Preview & export" },
];

export const FormBuilderPage = () => {
  const { fields, setFields, getFields, undo, redo, canUndo, canRedo, savedAt } =
    useFieldsHistory();
  const { activeId, handleDragStart, handleDragEnd, handleDragCancel } =
    useFormBuilderDnd(setFields);
  const sensors = useFormBuilderSensors();
  useUndoShortcuts(undo, redo);

  // Below `lg` the palette is a drawer; below `xl` the canvas and the preview take turns.
  const hasPaletteColumn = useMediaQuery(PALETTE_COLUMN_QUERY, { noSsr: true });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pane, setPane] = useState<Pane>("build");
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const addedFromDrawer = useCallback(() => {
    setDrawerOpen(false);
    setPane("build");
  }, []);

  const [helpOpen, setHelpOpen] = useState(false);
  const openHelp = useCallback(() => setHelpOpen(true), []);
  const closeHelp = useCallback(() => setHelpOpen(false), []);
  const toggleHelp = useCallback(() => setHelpOpen((open) => !open), []);

  const { focusSearch, focusFields, focusCanvas, focusTemplates, focusPreview } = useRegionFocus({
    hasPaletteColumn,
    hasFields: fields.length > 0,
    openDrawer,
    showPane: setPane,
  });
  useGlobalShortcuts({
    toggleHelp,
    focusSearch,
    focusFields,
    focusCanvas,
    focusTemplates,
    focusPreview,
  });

  const accessibility = useMemo(
    () => ({
      announcements: createAnnouncements(getFields),
      screenReaderInstructions: SCREEN_READER_INSTRUCTIONS,
    }),
    [getFields],
  );

  // A new object every render would re-render every context consumer.
  const contextValue = useMemo(
    () => ({ fields, setFields, getFields }),
    [fields, setFields, getFields],
  );

  return (
    <FormBuilderProvider value={contextValue}>
      <DndContext
        sensors={sensors}
        collisionDetection={formBuilderCollision}
        modifiers={[restrictReorderToYAxis]}
        accessibility={accessibility}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SkipLinks
          onFields={focusFields}
          onCanvas={focusCanvas}
          onPreview={focusPreview}
        />
        <div className="grid h-full min-h-0 grid-cols-[minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)] lg:grid-cols-[15rem_minmax(0,1fr)]">
          <AppHeader
            undo={undo}
            redo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
            savedAt={savedAt}
            onOpenFields={openDrawer}
            onOpenShortcuts={openHelp}
          />

          <div className="hidden min-h-0 overflow-hidden lg:block">
            {hasPaletteColumn ? <Palette /> : null}
          </div>

          {fields.length > 0 ? (
            <main
              id={MAIN_ID}
              tabIndex={-1}
              className="animate-fade-in grid min-h-0 min-w-0 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] outline-none xl:grid-cols-[minmax(0,1fr)_minmax(24rem,30rem)] xl:grid-rows-1"
            >
              <div className="px-3 pt-3 sm:px-4 xl:hidden">
                <SegmentedControl
                  ariaLabel="Workspace view"
                  value={pane}
                  onChange={setPane}
                  segments={PANES}
                />
              </div>
              <div
                className={`min-h-0 overflow-y-auto ${pane === "build" ? "" : "max-xl:hidden"}`}
              >
                <Canvas />
              </div>
              {/* Stays mounted while hidden, so typed preview values survive a switch. */}
              <div
                className={`flex min-h-0 flex-col ${pane === "preview" ? "" : "max-xl:hidden"}`}
              >
                <PreviewPanel />
              </div>
            </main>
          ) : (
            <main
              id={MAIN_ID}
              tabIndex={-1}
              className="grid min-h-0 min-w-0 grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)] outline-none"
            >
              <DropEmptyState onBrowseFields={openDrawer} />
            </main>
          )}
        </div>

        <Drawer
          open={drawerOpen && !hasPaletteColumn}
          onClose={closeDrawer}
          slotProps={{ paper: { sx: { width: "min(20rem, 88vw)" } } }}
        >
          <Palette onAdd={addedFromDrawer} />
          <IconButton
            aria-label="Close field list"
            onClick={closeDrawer}
            size="small"
            sx={{ position: "absolute", top: 12, insetInlineEnd: 12 }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Drawer>

        {/* No drop animation: it would fly back to the palette tile even on a successful drop. */}
        <DragOverlay dropAnimation={null}>
          {activeId && isPaletteId(activeId) ? (
            <PaletteItemPreview id={String(activeId)} />
          ) : null}
        </DragOverlay>
      </DndContext>

      <ShortcutsDialog open={helpOpen} onClose={closeHelp} />
    </FormBuilderProvider>
  );
};
