import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useController, useFormContext } from "react-hook-form";
import { TODAY } from "@/features/form-schema";
import { DateTimeField } from "@/ui/datetime/DateTimeField";
import type { EditorValues, FieldPath, FieldRules } from "./editor_model";

type TemporalValueControlProps = {
  name: FieldPath;
  label: string;
  inputType: "date" | "time" | "datetime-local";
  /** Offer a "use today" checkbox (date and datetime only). */
  allowToday?: boolean;
  todayHint?: string;
  rules?: FieldRules;
  /** Earliest and latest value the picker offers. */
  min?: string;
  max?: string;
};

const KINDS = { date: "date", time: "time", "datetime-local": "datetime" } as const;

/** A date / time / datetime input that can also hold the "today" token. */
export const TemporalValueControl = ({
  name,
  label,
  inputType,
  allowToday = false,
  todayHint,
  rules,
  min,
  max,
}: TemporalValueControlProps) => {
  const { control } = useFormContext<EditorValues>();
  const { field, fieldState } = useController({ control, name, rules });
  const isToday = field.value === TODAY;

  return (
    <Stack spacing={0.25}>
      {isToday ? (
        // The token isn't a date the picker can show, so show it as text instead.
        <TextField
          fullWidth
          size="small"
          label={label}
          value="Today"
          disabled
          slotProps={{ inputLabel: { shrink: true } }}
        />
      ) : (
        <DateTimeField
          kind={KINDS[inputType]}
          label={label}
          value={String(field.value ?? "")}
          onChange={field.onChange}
          onBlur={field.onBlur}
          inputRef={field.ref}
          min={min}
          max={max}
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message}
        />
      )}

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
