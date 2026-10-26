import { memo, useState, type ReactNode } from "react";
import { useController, type Control } from "react-hook-form";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FormLabel from "@mui/material/FormLabel";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Rating from "@mui/material/Rating";
import Slider from "@mui/material/Slider";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import type { FieldOption, FieldSpec, FormValue } from "@/features/form-schema";
import { FieldError } from "./FieldError";

export type FormValues = Record<string, FormValue>;

type FieldControlProps = {
  spec: FieldSpec;
  control: Control<FormValues>;
};

const NO_OPTIONS: FieldOption[] = [];

const TEXT_TYPES: Record<string, string> = {
  email: "email",
  tel: "tel",
  url: "url",
  number: "number",
  date: "date",
  time: "time",
  datetime: "datetime-local",
  color: "color",
};
const SHRINK_TYPES = new Set(["date", "time", "datetime-local", "color"]);

const formatBytes = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

/** Label + control + animated error, the shape shared by every non-TextField control. */
const Group = ({
  spec,
  error,
  labelId,
  children,
}: {
  spec: FieldSpec;
  error?: string;
  labelId: string;
  children: ReactNode;
}) => (
  <FormControl
    error={Boolean(error)}
    required={Boolean(spec.required)}
    disabled={spec.field.disabled}
    fullWidth
  >
    <FormLabel id={labelId} sx={{ fontSize: 14, fontWeight: 500, mb: 0.5 }}>
      {spec.label}
    </FormLabel>
    {children}
    <FieldError id={`${spec.name}-error`} message={error} />
  </FormControl>
);

const PasswordInput = ({
  spec,
  control,
}: FieldControlProps) => {
  const { field, fieldState } = useController({ name: spec.name, control });
  const [visible, setVisible] = useState(false);
  const error = fieldState.error?.message;

  return (
    <div>
      <TextField
        fullWidth
        size="small"
        id={spec.name}
        label={spec.label}
        type={visible ? "text" : "password"}
        autoComplete="current-password"
        required={Boolean(spec.required)}
        disabled={spec.field.disabled}
        name={field.name}
        value={field.value ?? ""}
        onChange={field.onChange}
        onBlur={field.onBlur}
        inputRef={field.ref}
        error={Boolean(error)}
        slotProps={{
          htmlInput: { "aria-describedby": `${spec.name}-error` },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  edge="end"
                  aria-label={visible ? "Hide password" : "Show password"}
                  onClick={() => setVisible((value) => !value)}
                  onMouseDown={(event) => event.preventDefault()}
                >
                  {visible ? (
                    <VisibilityOff fontSize="small" />
                  ) : (
                    <Visibility fontSize="small" />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
      <FieldError id={`${spec.name}-error`} message={error} />
    </div>
  );
};

/**
 * One form control. Memoized and subscribed to its own field only (useController),
 * so typing in one input never re-renders the others.
 */
export const FieldControl = memo(function FieldControl({
  spec,
  control,
}: FieldControlProps) {
  const { field, fieldState } = useController({ name: spec.name, control });
  const { field: config } = spec;
  const error = fieldState.error?.message;
  const options = config.options ?? NO_OPTIONS;
  const labelId = `${spec.name}-label`;
  const required = Boolean(spec.required);

  switch (config.type) {
    case "password":
      return <PasswordInput spec={spec} control={control} />;

    case "select":
      return (
        <div>
          <TextField
            select
            fullWidth
            size="small"
            id={spec.name}
            label={spec.label}
            required={required}
            disabled={config.disabled}
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            inputRef={field.ref}
            error={Boolean(error)}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <FieldError id={`${spec.name}-error`} message={error} />
        </div>
      );

    case "combobox":
      return (
        <div>
          <Autocomplete
            size="small"
            options={options}
            disabled={config.disabled}
            value={options.find((option) => option.value === field.value) ?? null}
            onChange={(_, option) => field.onChange(option?.value ?? "")}
            onBlur={field.onBlur}
            isOptionEqualToValue={(option, value) => option.value === value.value}
            renderInput={(params) => (
              <TextField
                {...params}
                id={spec.name}
                label={spec.label}
                required={required}
                error={Boolean(error)}
                inputRef={field.ref}
              />
            )}
          />
          <FieldError id={`${spec.name}-error`} message={error} />
        </div>
      );

    case "multiselect": {
      const selected = (field.value as string[]) ?? [];
      return (
        <div>
          <Autocomplete
            multiple
            size="small"
            disableCloseOnSelect
            filterSelectedOptions
            options={options}
            disabled={config.disabled}
            value={options.filter((option) => selected.includes(option.value))}
            onChange={(_, next) => field.onChange(next.map((option) => option.value))}
            onBlur={field.onBlur}
            isOptionEqualToValue={(option, value) => option.value === value.value}
            renderValue={(value, getItemProps) =>
              value.map((option, index) => {
                const { key, ...itemProps } = getItemProps({ index });
                return (
                  <Chip
                    key={key}
                    size="small"
                    label={option.label}
                    color="primary"
                    variant="outlined"
                    {...itemProps}
                    className={`animate-pop-in ${itemProps.className ?? ""}`}
                  />
                );
              })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                id={spec.name}
                label={spec.label}
                required={required}
                error={Boolean(error)}
                inputRef={field.ref}
              />
            )}
          />
          <FieldError id={`${spec.name}-error`} message={error} />
        </div>
      );
    }

    case "radiogroup":
      return (
        <Group spec={spec} error={error} labelId={labelId}>
          <RadioGroup
            aria-labelledby={labelId}
            name={field.name}
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
          >
            {options.map((option, index) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                label={option.label}
                control={
                  <Radio
                    size="small"
                    slotProps={{ input: { ref: index === 0 ? field.ref : undefined } }}
                  />
                }
              />
            ))}
          </RadioGroup>
        </Group>
      );

    case "checkboxgroup": {
      const selected = (field.value as string[]) ?? [];
      return (
        <Group spec={spec} error={error} labelId={labelId}>
          <FormGroup aria-labelledby={labelId}>
            {options.map((option, index) => (
              <FormControlLabel
                key={option.value}
                label={option.label}
                control={
                  <Checkbox
                    size="small"
                    slotProps={{ input: { ref: index === 0 ? field.ref : undefined } }}
                    checked={selected.includes(option.value)}
                    onBlur={field.onBlur}
                    onChange={(event) =>
                      field.onChange(
                        event.target.checked
                          ? [...selected, option.value]
                          : selected.filter((item) => item !== option.value),
                      )
                    }
                  />
                }
              />
            ))}
          </FormGroup>
        </Group>
      );
    }

    case "checkbox":
      return (
        <FormControl error={Boolean(error)} disabled={config.disabled}>
          <FormControlLabel
            label={
              <span className="text-sm">
                {spec.label}
                {required ? <span aria-hidden> *</span> : null}
              </span>
            }
            control={
              <Checkbox
                size="small"
                slotProps={{ input: { ref: field.ref } }}
                checked={Boolean(field.value)}
                onChange={(event) => field.onChange(event.target.checked)}
                onBlur={field.onBlur}
              />
            }
          />
          <FieldError id={`${spec.name}-error`} message={error} />
        </FormControl>
      );

    case "switch":
      return (
        <FormControlLabel
          disabled={config.disabled}
          label={<span className="text-sm">{spec.label}</span>}
          control={
            <Switch
              size="small"
              slotProps={{ input: { ref: field.ref } }}
              checked={Boolean(field.value)}
              onChange={(event) => field.onChange(event.target.checked)}
              onBlur={field.onBlur}
            />
          }
          sx={{ ml: 0, gap: 1 }}
        />
      );

    case "slider":
      return (
        <Group spec={spec} error={error} labelId={labelId}>
          <div className="flex items-center gap-4 px-1.5">
            <Slider
              aria-labelledby={labelId}
              value={Number(field.value ?? 0)}
              min={config.min ?? 0}
              max={config.max ?? 100}
              step={config.step ?? 1}
              valueLabelDisplay="auto"
              onChange={(_, value) => field.onChange(value as number)}
              onBlur={field.onBlur}
            />
            <span className="text-ink w-10 shrink-0 text-end text-sm font-semibold tabular-nums">
              {String(field.value ?? 0)}
            </span>
          </div>
        </Group>
      );

    case "rating":
      return (
        <Group spec={spec} error={error} labelId={labelId}>
          <Rating
            aria-labelledby={labelId}
            name={field.name}
            value={Number(field.value ?? 0)}
            max={config.max ?? 5}
            onChange={(_, value) => field.onChange(value ?? 0)}
            onBlur={field.onBlur}
            sx={{
              "& .MuiRating-icon": { transition: "transform 150ms ease" },
              "& .MuiRating-iconHover": { transform: "scale(1.2)" },
            }}
          />
        </Group>
      );

    case "file": {
      const files = (field.value as File[]) ?? [];
      return (
        <Group spec={spec} error={error} labelId={labelId}>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              component="label"
              size="small"
              variant="outlined"
              startIcon={<UploadFileIcon />}
              disabled={config.disabled}
            >
              {files.length ? "Replace file" : "Choose file"}
              <input
                ref={field.ref}
                hidden
                type="file"
                accept={spec.file?.accept?.join(",")}
                onChange={(event) => {
                  field.onChange(Array.from(event.target.files ?? []));
                  field.onBlur();
                }}
              />
            </Button>
            {files.map((file) => (
              <Chip
                key={file.name}
                size="small"
                className="animate-pop-in"
                label={`${file.name} · ${formatBytes(file.size)}`}
                onDelete={() => field.onChange([])}
              />
            ))}
          </div>
        </Group>
      );
    }

    default: {
      const type = TEXT_TYPES[config.type];
      return (
        <div>
          <TextField
            fullWidth
            size="small"
            id={spec.name}
            label={spec.label}
            type={type}
            required={required}
            disabled={config.disabled}
            multiline={config.type === "textarea"}
            minRows={config.type === "textarea" ? (config.rowNumber ?? 3) : undefined}
            name={field.name}
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            inputRef={field.ref}
            error={Boolean(error)}
            slotProps={{
              inputLabel: type && SHRINK_TYPES.has(type) ? { shrink: true } : undefined,
              htmlInput: {
                "aria-describedby": `${spec.name}-error`,
                inputMode: config.type === "number" ? "decimal" : undefined,
              },
            }}
            sx={type === "color" ? { maxWidth: 160 } : undefined}
          />
          <FieldError id={`${spec.name}-error`} message={error} />
        </div>
      );
    }
  }
});
