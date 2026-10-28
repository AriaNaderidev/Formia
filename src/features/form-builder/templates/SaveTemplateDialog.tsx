import { useId, useState, type FormEvent } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { templateFromFields } from "@/features/form-schema";
import { toast } from "@/ui/toast";
import { useFormBuilderContext } from "../context/useFormBuilderContext";
import { MAX_USER_TEMPLATES, userTemplates } from "./userTemplates";

type SaveTemplateDialogProps = {
  open: boolean;
  onClose: () => void;
};

const TITLE_MAX = 40;
const DESCRIPTION_MAX = 90;

const paperSlot = { component: "form", noValidate: true } as const;

/** Saves the current form so it shows up under "Your templates" on the empty canvas. */
export const SaveTemplateDialog = ({ open, onClose }: SaveTemplateDialogProps) => {
  const { getFields } = useFormBuilderContext();
  const titleId = useId();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [touched, setTouched] = useState(false);

  const trimmed = title.trim();
  const error = touched && !trimmed ? "Give the template a name" : undefined;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (!trimmed) return;

    const saved = userTemplates.add(templateFromFields(trimmed, description.trim(), getFields()));
    if (saved) {
      toast.success("Template saved", {
        description: "Find it under “Your templates” when the canvas is empty.",
      });
      onClose();
    } else {
      toast.error("Template limit reached", {
        description: `You can keep up to ${MAX_USER_TEMPLATES}. Delete one to make room.`,
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      aria-labelledby={titleId}
      slotProps={{
        paper: { ...paperSlot, onSubmit: submit },
        // Start fresh every time, so the previous name doesn't linger.
        transition: {
          onExited: () => {
            setTitle("");
            setDescription("");
            setTouched(false);
          },
        },
      }}
    >
      <DialogTitle id={titleId}>Save as template</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Reuse this form later from the empty canvas. Templates stay in this browser.
        </DialogContentText>
        <Stack spacing={2}>
          <TextField
            autoFocus
            required
            label="Template name"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={() => setTouched(true)}
            error={Boolean(error)}
            helperText={error ?? `${title.length}/${TITLE_MAX}`}
            slotProps={{ htmlInput: { maxLength: TITLE_MAX } }}
          />
          <TextField
            label="Description (optional)"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            helperText={`${description.length}/${DESCRIPTION_MAX}`}
            slotProps={{ htmlInput: { maxLength: DESCRIPTION_MAX } }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button type="button" color="inherit" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="contained">
          Save template
        </Button>
      </DialogActions>
    </Dialog>
  );
};
