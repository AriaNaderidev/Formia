import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import {
  useFieldArray,
  useFormContext,
  useFormState,
  useWatch,
} from "react-hook-form";
import { TextControl } from "./TextControl";
import { slugify, type EditorValues } from "./editor_model";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";

type OptionRowProps = {
  index: number;
  onAdd: () => void;
  onRemove: () => void;
};

const OptionRow = ({ index, onAdd, onRemove }: OptionRowProps) => {
  const label = useWatch({ name: `options.${index}.label` });

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ width: 20, pt: 1.25, textAlign: "center", flexShrink: 0 }}
      >
        {index + 1}
      </Typography>
      <Box sx={{ flex: 1.2, minWidth: 0 }}>
        <TextControl
          name={`options.${index}.label`}
          label="Label"
          onEnter={onAdd}
        />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <TextControl
          name={`options.${index}.value`}
          label="Value"
          placeholder={slugify(label ?? "") || "auto"}
          onEnter={onAdd}
        />
      </Box>
      <Tooltip title="Remove option">
        <IconButton
          size="small"
          aria-label={`Remove option ${index + 1}`}
          onClick={onRemove}
          sx={{
            mt: 0.5,
            color: "text.secondary",
            "&:hover": { color: "error.main" },
          }}
        >
          <DeleteOutlineOutlined fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};

export const OptionsPanel = () => {
  const { control } = useFormContext<EditorValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
    rules: {
      validate: (options) =>
        options.some((option) => option.label.trim()) ||
        "Add at least one option",
    },
  });
  const { errors } = useFormState({ control, name: "options" });

  const addOption = () => append({ label: "", value: "" });

  return (
    <Stack spacing={1.5}>
      <Box>
        <Typography variant="subtitle2">Options</Typography>
        <Typography variant="caption" color="text.secondary">
          Press Enter to add another. Leave the value empty to create it from
          the label.
        </Typography>
      </Box>

      {fields.length === 0 ? (
        <Box
          sx={{
            border: 1,
            borderStyle: "dashed",
            borderColor: "divider",
            borderRadius: 1,
            py: 3,
            textAlign: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No options yet
          </Typography>
        </Box>
      ) : (
        <Stack
          spacing={1.5}
          sx={{
            py: 1,
            maxHeight: "240px",
            overflowY: "scroll",
            scrollbarGutter: "stable",
          }}
        >
          {fields.map((item, index) => (
            <OptionRow
              key={item.id}
              index={index}
              onAdd={addOption}
              onRemove={() => remove(index)}
            />
          ))}
        </Stack>
      )}

      {errors.options?.root?.message ? (
        <Typography variant="caption" color="error">
          {errors.options.root.message}
        </Typography>
      ) : null}

      <Button
        type="button"
        size="small"
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={addOption}
        sx={{ alignSelf: "flex-start" }}
      >
        Add option
      </Button>
    </Stack>
  );
};
