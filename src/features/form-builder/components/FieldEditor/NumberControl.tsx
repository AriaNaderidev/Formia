import TextField from "@mui/material/TextField";
import { useController, useFormContext } from "react-hook-form";
import type { EditorValues, FieldPath, FieldRules } from "./editor_model";

type NumberControlProps = {
  name: FieldPath;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  helperText?: string;
  rules?: FieldRules;
};

export const NumberControl = ({
  name,
  label,
  min,
  max,
  step,
  helperText,
  rules,
}: NumberControlProps) => {
  const { control } = useFormContext<EditorValues>();
  const { field, fieldState } = useController({ control, name, rules });

  return (
    <TextField
      fullWidth
      size="small"
      type="number"
      label={label}
      name={field.name}
      value={field.value ?? ""}
      // Empty input means "not set", never 0.
      onChange={(event) =>
        field.onChange(
          event.target.value === "" ? undefined : Number(event.target.value),
        )
      }
      onBlur={field.onBlur}
      inputRef={field.ref}
      error={Boolean(fieldState.error)}
      helperText={fieldState.error?.message ?? helperText}
      slotProps={{ htmlInput: { min, max, step } }}
    />
  );
};