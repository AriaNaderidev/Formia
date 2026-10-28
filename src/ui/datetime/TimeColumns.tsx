import { useEffect, useRef, type KeyboardEvent } from "react";
import ButtonBase from "@mui/material/ButtonBase";
import { alpha } from "@mui/material/styles";
import {
  isOutside,
  splitValue,
  toTimeKey,
  type Bounds,
  type PickerKind,
} from "./dateUtils";

type TimeColumnsProps = {
  kind: PickerKind;
  /** The whole field value; only its time half is shown. */
  value: string;
  /** Date half of the value (datetime only). Bounds apply to the combined value. */
  date?: string;
  bounds: Bounds;
  onSelect: (time: string) => void;
};

type Item = { value: number; label: string; disabled: boolean };

const pad = (value: number) => String(value).padStart(2, "0");

const Column = ({
  label,
  items,
  selected,
  onSelect,
}: {
  label: string;
  items: Item[];
  selected?: number;
  onSelect: (value: number) => void;
}) => {
  const listRef = useRef<HTMLDivElement>(null);

  // Bring the selection into view when the panel opens.
  useEffect(() => {
    const element = listRef.current?.querySelector<HTMLElement>(
      "[aria-selected=true]",
    );
    if (element && listRef.current) {
      listRef.current.scrollTop =
        element.offsetTop - listRef.current.clientHeight / 2 + 16;
    }
    // Only on mount: scrolling while the user picks would fight their own scrolling.
  }, []);

  const tabbable =
    items.find((item) => item.value === selected)?.value ?? items[0]?.value;

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const options = [
      ...(listRef.current?.querySelectorAll<HTMLElement>(
        "[role=option]:not(:disabled)",
      ) ?? []),
    ];
    const index = options.indexOf(document.activeElement as HTMLElement);
    options[index + (event.key === "ArrowDown" ? 1 : -1)]?.focus();
  };

  return (
    <div
      ref={listRef}
      role="listbox"
      aria-label={label}
      onKeyDown={onKeyDown}
      className="flex max-h-[17rem] w-14 flex-col gap-0.5 overflow-y-auto pe-0.5"
    >
      {items.map((item) => {
        const isSelected = item.value === selected;
        return (
          <ButtonBase
            key={item.value}
            role="option"
            aria-selected={isSelected}
            disabled={item.disabled}
            tabIndex={item.value === tabbable ? 0 : -1}
            onClick={() => onSelect(item.value)}
            sx={{
              flexShrink: 0,
              height: 32,
              borderRadius: 2,
              fontSize: 13,
              fontVariantNumeric: "tabular-nums",
              transition: "background-color 150ms, color 150ms",
              ...(isSelected
                ? {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    fontWeight: 600,
                  }
                : {
                    "&:hover:not(.Mui-disabled)": {
                      bgcolor: (theme) =>
                        alpha(theme.palette.primary.main, 0.1),
                    },
                  }),
              "&.Mui-disabled": { opacity: 0.35 },
              "&.Mui-focusVisible": {
                outline: "2px solid",
                outlineColor: "primary.main",
                outlineOffset: -2,
              },
            }}
          >
            {item.label}
          </ButtonBase>
        );
      })}
    </div>
  );
};

/** Hour, minute and AM/PM columns. Always writes 24-hour `HH:mm`, like the native input. */
export const TimeColumns = ({
  kind,
  value,
  date,
  bounds,
  onSelect,
}: TimeColumnsProps) => {
  const { time } = splitValue(kind, value);
  const [hours24, minutes] = time
    ? time.split(":").map(Number)
    : [undefined, undefined];
  const isPm = hours24 === undefined ? undefined : hours24 >= 12;
  const hours12 = hours24 === undefined ? undefined : hours24 % 12 || 12;

  // A time is out of range when the value it would produce is.
  const outside = (candidate: string) => {
    if (kind === "time") return isOutside(candidate, bounds);
    return date ? isOutside(`${date}T${candidate}`, bounds) : false;
  };

  const now = new Date();
  const base = {
    hours: hours24 ?? now.getHours(),
    minutes: minutes ?? 0,
  };
  const commit = (hours: number, mins: number) =>
    onSelect(toTimeKey(hours, mins));
  const to24 = (hour12: number, pm: boolean) => (hour12 % 12) + (pm ? 12 : 0);

  // A column item is disabled only when every time it could lead to is out of range.
  const hourItems: Item[] = Array.from({ length: 12 }, (_, index) => {
    const hour12 = index + 1;
    const h = to24(hour12, isPm ?? base.hours >= 12);
    return {
      value: hour12,
      label: pad(hour12),
      disabled: Array.from({ length: 60 }, (_, m) => m).every((m) =>
        outside(toTimeKey(h, m)),
      ),
    };
  });
  const minuteItems: Item[] = Array.from({ length: 60 }, (_, minute) => ({
    value: minute,
    label: pad(minute),
    disabled: outside(toTimeKey(base.hours, minute)),
  }));
  const periodItems: Item[] = [
    { value: 0, label: "AM", disabled: false },
    { value: 1, label: "PM", disabled: false },
  ].map((item) => ({
    ...item,
    disabled: Array.from({ length: 12 }, (_, h) => h).every((h) =>
      outside(toTimeKey(to24(h || 12, item.value === 1), base.minutes)),
    ),
  }));

  return (
    <div className="flex gap-1">
      <Column
        label="Hour"
        items={hourItems}
        selected={hours12}
        onSelect={(hour12) =>
          commit(to24(hour12, base.hours >= 12), base.minutes)
        }
      />
      <Column
        label="Minute"
        items={minuteItems}
        selected={minutes}
        onSelect={(minute) => commit(base.hours, minute)}
      />
      <Column
        label="AM or PM"
        items={periodItems}
        selected={isPm === undefined ? undefined : Number(isPm)}
        onSelect={(period) =>
          commit((base.hours % 12) + (period === 1 ? 12 : 0), base.minutes)
        }
      />
    </div>
  );
};
