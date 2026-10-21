import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import Switch from "@mui/material/Switch";
import type { SxProps, Theme } from "@mui/material/styles";
import { useController, useFormContext } from "react-hook-form";
import type { EditorValues, FieldPath } from "./editor_model";

type SwitchControlProps = {
  name: FieldPath;
  label: string;
  helperText?: string;
  labelPlacement?: "end" | "start";
  sx?: SxProps<Theme>;
};

export const SwitchControl = ({
  name,
  label,
  helperText,
  labelPlacement = "end",
  sx,
}: SwitchControlProps) => {
  const { control } = useFormContext<EditorValues>();
  const { field } = useController({ control, name });

  return (
    <Box>
      <FormControlLabel
        label={label}
        labelPlacement={labelPlacement}
        sx={sx}
        control={
          <Switch
            size="small"
            name={field.name}
            checked={Boolean(field.value)}
            onChange={(_, checked) => field.onChange(checked)}
            onBlur={field.onBlur}
          />
        }
      />
      {helperText ? (
        <FormHelperText sx={{ mx: 0 }}>{helperText}</FormHelperText>
      ) : null}
    </Box>
  );
};
