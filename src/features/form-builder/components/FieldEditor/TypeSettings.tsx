import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import type { FieldType } from "@/features/form-schema";
import { NumberControl } from "./NumberControl";
import { TextControl } from "./TextControl";

/** What the field shows when no placeholder is set (see DateTimeField). */
const PICKER_PLACEHOLDERS = {
  date: "Select a date",
  time: "Select a time",
  datetime: "Select date and time",
} as const;

/** Settings that only some field types have. */
export const TypeSettings = ({ type }: { type: FieldType }) => {
  if (type === "textarea") {
    return (
      <NumberControl name="rowNumber" label="Visible rows" min={1} max={20} />
    );
  }

  if (type === "date" || type === "time" || type === "datetime") {
    return (
      <TextControl
        name="placeholder"
        label="Placeholder text"
        placeholder={PICKER_PLACEHOLDERS[type]}
        helperText="Shown inside the field until a value is chosen"
      />
    );
  }

  if (type === "rating") {
    return (
      <NumberControl name="max" label="Number of stars" min={1} max={10} />
    );
  }

  if (type === "slider") {
    return (
      <Stack direction="row" spacing={1.5}>
        <Box sx={{ flex: 1 }}>
          <NumberControl name="min" label="Min" />
        </Box>
        <Box sx={{ flex: 1 }}>
          <NumberControl
            name="max"
            label="Max"
            rules={{
              validate: (value, values) =>
                value === undefined ||
                values.min === undefined ||
                Number(value) > Number(values.min) ||
                "Max must be greater than min",
            }}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <NumberControl name="step" label="Step" min={0} />
        </Box>
      </Stack>
    );
  }

  return null;
};
