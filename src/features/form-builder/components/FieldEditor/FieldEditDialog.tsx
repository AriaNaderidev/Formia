import { useId, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { FormProvider, useWatch, type FieldErrors } from "react-hook-form";
import type { FormField } from "@/features/form-schema";
import type { EditorValues } from "./editor_model";
import { getEditorTabs, TAB_LABELS, type EditorTab } from "./editor_config";
import { useFieldEditor } from "../../hooks/useFieldEditor";
import { PALETTE_META } from "../Palette/palette_config";
import { GeneralPanel } from "./GeneralPanel";
import { OptionsPanel } from "./OptionsPanel";
import { ValidationPanel } from "./ValidationPanel";

type FieldEditDialogProps = {
  field: FormField;
  open: boolean;
  onClose: () => void;
};

/** After a failed save, jump to the tab that holds the first error. */
const tabWithError = (errors: FieldErrors<EditorValues>): EditorTab =>
  errors.options ? "options" : errors.validation ? "validation" : "general";

const paperSlot = { component: "form", noValidate: true } as const;

export const FieldEditDialog = ({
  field,
  open,
  onClose,
}: FieldEditDialogProps) => {
  const titleId = useId();
  const [tab, setTab] = useState<EditorTab>("general");

  const { methods, submit, resetToSource } = useFieldEditor(field, {
    open,
    onClose,
    onInvalid: (errors) => setTab(tabWithError(errors)),
  });
  const { isDirty } = methods.formState;

  const type = useWatch({ control: methods.control, name: "type" });
  const meta = PALETTE_META[type];
  const Icon = meta.icon;
  const tabs = getEditorTabs(type);
  const activeTab = tabs.includes(tab) ? tab : "general";

  return (
    <FormProvider {...methods}>
      <Dialog
        open={open}
        // Don't lose unsaved edits to a stray click on the backdrop.
        onClose={(_, reason) => {
          if (reason === "backdropClick" && isDirty) return;
          onClose();
        }}
        fullWidth
        maxWidth="sm"
        scroll="paper"
        aria-labelledby={titleId}
        slotProps={{ paper: { ...paperSlot, onSubmit: submit } }}
      >
        <DialogTitle
          id={titleId}
          sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
        >
          <Box
            sx={{
              display: "grid",
              placeItems: "center",
              width: 40,
              height: 40,
              borderRadius: 1.5,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              flexShrink: 0,
            }}
          >
            <Icon fontSize="small" />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h6"
              component="span"
              sx={{ display: "block", lineHeight: 1.25 }}
            >
              Edit {meta.title.toLowerCase()}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block" }}
            >
              {meta.description}
            </Typography>
          </Box>
        </DialogTitle>

        {tabs.length > 1 ? (
          <Tabs
            value={activeTab}
            onChange={(_, value: EditorTab) => setTab(value)}
            sx={{ px: 2 }}
          >
            {tabs.map((item) => (
              <Tab key={item} value={item} label={TAB_LABELS[item]} />
            ))}
          </Tabs>
        ) : null}

        {/* A fixed minimum height stops the dialog from jumping between tabs. */}
        <DialogContent dividers sx={{ minHeight: { sm: 380 } }}>
          <Stack spacing={2.5}>
            {activeTab === "general" && <GeneralPanel sourceId={field.id} />}
            {activeTab === "options" && <OptionsPanel />}
            {activeTab === "validation" && <ValidationPanel />}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
          <Button
            type="button"
            color="inherit"
            onClick={resetToSource}
            disabled={!isDirty}
          >
            Reset
          </Button>
          <Stack direction="row" spacing={1}>
            <Button type="button" color="inherit" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={!isDirty}>
              Save changes
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </FormProvider>
  );
};
