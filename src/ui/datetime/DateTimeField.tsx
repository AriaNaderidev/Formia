import {
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from "react";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Popover from "@mui/material/Popover";
import TextField from "@mui/material/TextField";
import { Calendar } from "./Calendar";
import {
  clamp,
  formatValue,
  joinValue,
  nowKey,
  splitValue,
  todayKey,
  isDayOutside,
  isOutside,
  type Bounds,
  type PickerKind,
} from "./dateUtils";
import { TimeColumns } from "./TimeColumns";

type DateTimeFieldProps = {
  kind: PickerKind;
  label: string;
  /** `YYYY-MM-DD`, `HH:mm` or `YYYY-MM-DDTHH:mm`, or "" when empty. */
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  min?: string;
  max?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: ReactNode;
  id?: string;
  inputRef?: Ref<HTMLInputElement>;
  describedBy?: string;
};

const TITLES: Record<
  PickerKind,
  { open: string; today: string; placeholder: string }
> = {
  date: { open: "Choose date", today: "Today", placeholder: "Select a date" },
  time: { open: "Choose time", today: "Now", placeholder: "Select a time" },
  datetime: {
    open: "Choose date and time",
    today: "Now",
    placeholder: "Select date and time",
  },
};

/**
 * Date, time and date-time input with a themed picker. It speaks the same string
 * formats as the native inputs, so rules, defaults and generated code are unchanged.
 */
export const DateTimeField = ({
  kind,
  label,
  value,
  onChange,
  onBlur,
  min,
  max,
  required,
  disabled,
  error,
  helperText,
  id,
  inputRef,
  describedBy,
}: DateTimeFieldProps) => {
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const bounds: Bounds = { min, max };
  const { date, time } = splitValue(kind, value);
  const showsCalendar = kind !== "time";
  const showsTime = kind !== "date";
  const copy = TITLES[kind];

  const commit = (nextDate?: string, nextTime?: string) => {
    const next = joinValue(kind, nextDate, nextTime);
    onChange(kind === "datetime" ? clamp(next, bounds) : next);
  };

  const pickDay = (dateKey: string) => {
    // With no time yet, the current one is a better start than midnight.
    commit(dateKey, time ?? (showsTime ? nowKey() : undefined));
  };
  const pickTime = (timeKey: string) => {
    commit(
      date ?? (showsCalendar ? clampDay(todayKey(), bounds) : undefined),
      timeKey,
    );
  };

  const pickNow = () => {
    const today = todayKey();
    if (kind === "date") {
      if (!isDayOutside(today, bounds)) commit(today);
    } else if (kind === "time") {
      if (!isOutside(nowKey(), bounds)) commit(undefined, nowKey());
    } else {
      commit(clampDay(today, bounds), nowKey());
    }
  };

  const close = () => {
    setOpen(false);
    onBlur?.();
  };

  const onInputKeyDown = (event: KeyboardEvent) => {
    if (disabled) return;
    if (["Enter", " ", "ArrowDown"].includes(event.key)) {
      event.preventDefault();
      setOpen(true);
    }
  };

  const Icon =
    kind === "time" ? ScheduleRoundedIcon : CalendarMonthOutlinedIcon;

  return (
    <>
      <div ref={anchor}>
        <TextField
          fullWidth
          size="small"
          id={inputId}
          label={label}
          value={formatValue(kind, value)}
          required={required}
          disabled={disabled}
          error={error}
          helperText={helperText}
          inputRef={inputRef}
          onClick={() => !disabled && setOpen(true)}
          onKeyDown={onInputKeyDown}
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: {
              readOnly: true,
              placeholder: copy.placeholder,
              "aria-haspopup": "dialog",
              "aria-expanded": open,
              "aria-describedby": describedBy,
              style: { cursor: disabled ? "default" : "pointer" },
            },
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    edge="end"
                    disabled={disabled}
                    aria-label={copy.open}
                    tabIndex={-1}
                    onClick={(event) => {
                      event.stopPropagation();
                      setOpen(true);
                    }}
                    sx={{ color: open ? "primary.main" : "text.secondary" }}
                  >
                    <Icon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </div>

      <Popover
        open={open}
        anchorEl={anchor.current}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        marginThreshold={12}
        slotProps={{
          paper: {
            role: "dialog",
            "aria-label": copy.open,
            elevation: 8,
            sx: {
              mt: 0.75,
              p: 2,
              maxWidth: "calc(100vw - 1.5rem)",
              border: 1,
              borderColor: "divider",
              borderRadius: 3,
            },
          },
        }}
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            {showsCalendar ? (
              <Calendar value={date} bounds={bounds} onSelect={pickDay} />
            ) : null}
            {showsCalendar && showsTime ? (
              <span
                aria-hidden
                className="bg-line hidden w-px self-stretch sm:block"
              />
            ) : null}
            {showsTime ? (
              <TimeColumns
                kind={kind}
                value={
                  kind === "time" ? (time ?? "") : joinValue(kind, date, time)
                }
                date={date}
                bounds={bounds}
                onSelect={pickTime}
              />
            ) : null}
          </div>

          <div className="border-line flex items-center justify-between gap-2 border-t pt-2.5">
            <div className="flex gap-1">
              <Button size="small" onClick={pickNow}>
                {copy.today}
              </Button>
              {!required && value ? (
                <Button
                  size="small"
                  color="inherit"
                  onClick={() => {
                    onChange("");
                  }}
                >
                  Clear
                </Button>
              ) : null}
            </div>
            <Button size="small" variant="contained" onClick={close}>
              Done
            </Button>
          </div>
        </div>
      </Popover>
    </>
  );
};

/** Moves a day to the nearest allowed one when it falls outside the bounds. */
const clampDay = (dateKey: string, { min, max }: Bounds) =>
  min && dateKey < min.slice(0, 10)
    ? min.slice(0, 10)
    : max && dateKey > max.slice(0, 10)
      ? max.slice(0, 10)
      : dateKey;
