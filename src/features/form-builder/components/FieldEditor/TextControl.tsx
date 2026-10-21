import TextField from "@mui/material/TextField";
import { useController, useFormContext } from "react-hook-form";
import type { EditorValues, FieldPath, FieldRules } from "./editor_model";

type TextControlProps = {
  name: FieldPath;
  label: string;
  placeholder?: string;
  helperText?: string;
  type?: string;
  multiline?: boolean;
  rows?: number;
  rules?: FieldRules;
  /** Called on Enter instead of submitting the form (single-line inputs only). */
  onEnter?: () => void;
};

const SHRINK_TYPES = new Set(["date", "time", "datetime-local", "color"]);

export const TextControl = ({
  name,
  label,
  placeholder,
  helperText,
  type = "text",
  multiline,
  rows,
  rules,
  onEnter,
}: TextControlProps) => {
  const { control } = useFormContext<EditorValues>();
  const { field, fieldState } = useController({ control, name, rules });

  return (
    <TextField
      fullWidth
      size="small"
      type={type}
      label={label}
      placeholder={placeholder}
      multiline={multiline}
      rows={rows}
      name={field.name}
      value={field.value ?? ""}
      onChange={field.onChange}
      onBlur={field.onBlur}
      inputRef={field.ref}
      error={Boolean(fieldState.error)}
      helperText={fieldState.error?.message ?? helperText}
      onKeyDown={
        onEnter
          ? (event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onEnter();
              }
            }
          : undefined
      }
      slotProps={{
        inputLabel: SHRINK_TYPES.has(type) ? { shrink: true } : undefined,
      }}
    />
  );
};
