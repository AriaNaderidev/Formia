import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useController, useFormContext } from "react-hook-form";
import { TODAY } from "@/features/form-schema";
import type { EditorValues, FieldPath, FieldRules } from "./editor_model";

type TemporalValueControlProps = {
  name: FieldPath;
  label: string;
  inputType: "date" | "time" | "datetime-local";
  /** Offer a "use today" checkbox (date and datetime only). */
  allowToday?: boolean;
  todayHint?: string;
  rules?: FieldRules;
};

/** A date / time / datetime input that can also hold the "today" token. */
export const TemporalValueControl = ({
  name,
  label,
  inputType,
  allowToday = false,
  todayHint,
  rules,
}: TemporalValueControlProps) => {
  const { control } = useFormContext<EditorValues>();
  const { field, fieldState } = useController({ control, name, rules });
  const isToday = field.value === TODAY;

  return (
    <Stack spacing={0.25}>
      <TextField
        fullWidth
        size="small"
        label={label}
        // The token is not a valid value for a native date input, so show text instead.
        type={isToday ? "text" : inputType}
        value={isToday ? "Today" : (field.value ?? "")}
        disabled={isToday}
        onChange={field.onChange}
        onBlur={field.onBlur}
        inputRef={field.ref}
        error={Boolean(fieldState.error)}
        helperText={fieldState.error?.message}
        slotProps={{ inputLabel: { shrink: true } }}
      />

      {allowToday ? (
        <>
          <FormControlLabel
            label="Use today"
            control={
              <Checkbox
                size="small"
                checked={isToday}
                onChange={(_, checked) =>
                  field.onChange(checked ? TODAY : undefined)
                }
              />
            }
          />
          {todayHint ? (
            <FormHelperText sx={{ mx: 0, mt: -0.5 }}>
              {todayHint}
            </FormHelperText>
          ) : null}
        </>
      ) : null}
    </Stack>
  );
};
