import { useId } from "react";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import type { SubmittedForm } from "@/features/form-renderer";
import { SubmissionView } from "./SubmissionView";

type SubmissionDialogProps = {
  /** The last successful submission. Kept after closing so the exit animation has content. */
  submission: SubmittedForm | null;
  open: boolean;
  onClose: () => void;
};

/** The data a valid submit produced, in a modal big enough to actually read. */
export const SubmissionDialog = ({
  submission,
  open,
  onClose,
}: SubmissionDialogProps) => {
  const titleId = useId();
  const count = submission?.specs.length ?? 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
      aria-labelledby={titleId}
    >
      <DialogTitle
        id={titleId}
        sx={{ display: "flex", alignItems: "center", gap: 1.5, pe: 7 }}
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
          <CheckCircleRoundedIcon />
        </span>
        <span className="min-w-0">
          <span className="text-ink block text-lg leading-tight font-semibold">
            Form submitted
          </span>
          <span className="text-ink-muted block text-sm font-normal">
            {count === 1
              ? "1 field passed validation"
              : `${count} fields passed validation`}
          </span>
        </span>
        <IconButton
          aria-label="Close"
          onClick={onClose}
          sx={{ position: "absolute", top: 12, insetInlineEnd: 12 }}
        >
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ minHeight: { sm: 320 } }}>
        {submission ? (
          <SubmissionView data={submission.data} specs={submission.specs} />
        ) : null}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="contained" onClick={onClose}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};
