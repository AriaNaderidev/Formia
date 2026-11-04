import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { useController, useFormContext } from "react-hook-form";
import type { EditorValues, FieldPath } from "./editor_model";

export type SelectOption = { value: string; label: string };

type SelectControlProps = {
  name: FieldPath;
  label: string;
  options: SelectOption[];
  multiple?: boolean;
  helperText?: string;
  /** Runs after the value changes, for settings that drive another setting. */
  onValueChange?: (value: string) => void;
};

export const SelectControl = ({
  name,
  label,
  options,
  multiple = false,
  helperText,
  onValueChange,
}: SelectControlProps) => {
  const { control } = useFormContext<EditorValues>();
  const { field, fieldState } = useController({ control, name });

  const value = multiple
    ? Array.isArray(field.value)
      ? field.value
      : []
    : (field.value ?? "");

  const labelOf = (selected: string) =>
    options.find((option) => option.value === selected)?.label ?? selected;

  return (
    <TextField
      select
      fullWidth
      size="small"
      label={label}
      name={field.name}
      value={value}
      onChange={(event) => {
        field.onChange(event);
        onValueChange?.(event.target.value);
      }}
      onBlur={field.onBlur}
      inputRef={field.ref}
      error={Boolean(fieldState.error)}
      helperText={fieldState.error?.message ?? helperText}
      slotProps={{
        select: {
          multiple,
          renderValue: multiple
            ? (selected) => (selected as string[]).map(labelOf).join(", ")
            : undefined,
        },
      }}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
};
