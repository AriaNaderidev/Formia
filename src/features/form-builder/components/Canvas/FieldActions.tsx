import type { ReactNode } from "react";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { alpha } from "@mui/material/styles";

type FieldActionsProps = {
  /** Used in aria-labels, e.g. "Edit Username". */
  label: string;
  onEdit: () => void;
  onDelete: () => void;
  /** Extra buttons shown first, e.g. "add a field beside". */
  before?: ReactNode;
};

export const FieldActions = ({
  label,
  onEdit,
  onDelete,
  before,
}: FieldActionsProps) => (
  <div className="flex shrink-0 items-center">
    {before}
    <Tooltip title="Edit" enterDelay={500}>
      <IconButton
        size="small"
        aria-label={`Edit ${label}`}
        onClick={onEdit}
        sx={{
          // Tapping the card already opens the editor; on a narrow card the room is for the title.
          display: { xs: "none", sm: "inline-flex" },
          color: "text.secondary",
          "&:hover": { color: "primary.main" },
        }}
      >
        <EditOutlinedIcon fontSize="small" />
      </IconButton>
    </Tooltip>

    <Tooltip title="Delete" enterDelay={500}>
      <IconButton
        size="small"
        aria-label={`Delete ${label}`}
        onClick={onDelete}
        sx={(theme) => ({
          color: "text.secondary",
          "&:hover": {
            color: theme.palette.error.main,
            backgroundColor: alpha(theme.palette.error.main, 0.08),
          },
        })}
      >
        <DeleteOutlineOutlined fontSize="small" />
      </IconButton>
    </Tooltip>
  </div>
);
