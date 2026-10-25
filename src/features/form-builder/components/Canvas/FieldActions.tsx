import { DeleteOutlineOutlined } from "@mui/icons-material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { alpha } from "@mui/material/styles";

type FieldActionsProps = {
  /** Used in aria-labels, e.g. "Edit Username". */
  label: string;
  onEdit: () => void;
  onDelete: () => void;
};

export const FieldActions = ({
  label,
  onEdit,
  onDelete,
}: FieldActionsProps) => (
  <div className="flex shrink-0 items-center">
    <Tooltip title="Edit" enterDelay={500}>
      <IconButton
        size="small"
        aria-label={`Edit ${label}`}
        onClick={onEdit}
        sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}
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
