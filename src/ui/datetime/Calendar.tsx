import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import ButtonBase from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";
import { alpha, type Theme } from "@mui/material/styles";
import {
  daysInMonth,
  isDayOutside,
  parseDateKey,
  toDateKey,
  todayKey,
  type Bounds,
} from "./dateUtils";

type CalendarProps = {
  /** Selected day, `YYYY-MM-DD`. */
  value?: string;
  bounds: Bounds;
  onSelect: (dateKey: string) => void;
};

const YEAR_SPAN = { before: 120, after: 30 };

const monthTitle = new Intl.DateTimeFormat(undefined, {
  month: "long",
  year: "numeric",
});
const weekdayLong = new Intl.DateTimeFormat(undefined, { weekday: "long" });
const weekdayNarrow = new Intl.DateTimeFormat(undefined, { weekday: "narrow" });
const dayLabel = new Intl.DateTimeFormat(undefined, { dateStyle: "full" });

/** First day of the week for the user's locale (0 = Sunday), falling back to Sunday. */
const weekStart = () => {
  const info = new Intl.Locale(navigator.language) as Intl.Locale & {
    getWeekInfo?: () => { firstDay: number };
    weekInfo?: { firstDay: number };
  };
  const firstDay = (info.getWeekInfo?.() ?? info.weekInfo)?.firstDay ?? 7;
  return firstDay % 7;
};

const dayButtonSx = (theme: Theme) => ({
  width: 36,
  height: 36,
  borderRadius: "50%",
  fontSize: 13,
  fontVariantNumeric: "tabular-nums",
  transition: "background-color 150ms, color 150ms, transform 150ms",
  "&:hover:not(.Mui-disabled)": {
    bgcolor: alpha(theme.palette.primary.main, 0.1),
  },
  "&.Mui-focusVisible": {
    outline: "2px solid",
    outlineColor: "primary.main",
    outlineOffset: 1,
  },
  "&.Mui-disabled": { color: "text.disabled", opacity: 0.45 },
  "&:active:not(.Mui-disabled)": { transform: "scale(0.92)" },
});

/** A month grid with a year picker. Arrow keys move between days, PageUp/Down between months. */
export const Calendar = ({ value, bounds, onSelect }: CalendarProps) => {
  const today = todayKey();
  const initial = parseDateKey(value ?? today);
  const [cursor, setCursor] = useState({
    year: initial.year,
    month: initial.month,
  });
  const [focusKey, setFocusKey] = useState(value ?? today);
  const [view, setView] = useState<"days" | "years">("days");
  const gridRef = useRef<HTMLDivElement>(null);
  const shouldFocus = useRef(false);

  const start = useMemo(weekStart, []);
  const weekdays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        // 2024-01-07 is a Sunday.
        const date = new Date(2024, 0, 7 + ((start + index) % 7));
        return {
          short: weekdayNarrow.format(date),
          long: weekdayLong.format(date),
        };
      }),
    [start],
  );

  const { year, month } = cursor;
  const leading = (new Date(year, month, 1).getDay() - start + 7) % 7;
  const total = daysInMonth(year, month);
  const cells = Array.from(
    { length: Math.ceil((leading + total) / 7) * 7 },
    (_, index) => {
      const day = index - leading + 1;
      return day >= 1 && day <= total ? day : null;
    },
  );

  // Keep exactly one day tabbable: the focused one, or the first day if it is not in this month.
  const focused = parseDateKey(focusKey);
  const tabbableDay =
    focused.year === year && focused.month === month ? focused.day : 1;

  useEffect(() => {
    if (!shouldFocus.current) return;
    shouldFocus.current = false;
    gridRef.current
      ?.querySelector<HTMLElement>(`[data-day="${tabbableDay}"]`)
      ?.focus();
  });

  const goToMonth = (delta: number) => {
    const next = new Date(year, month + delta, 1);
    setCursor({ year: next.getFullYear(), month: next.getMonth() });
  };

  const moveFocus = (days: number) => {
    const next = new Date(focused.year, focused.month, focused.day + days);
    setFocusKey(toDateKey(next.getFullYear(), next.getMonth(), next.getDate()));
    setCursor({ year: next.getFullYear(), month: next.getMonth() });
    shouldFocus.current = true;
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const moves: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };
    if (event.key in moves) {
      event.preventDefault();
      moveFocus(moves[event.key]);
    } else if (event.key === "PageUp" || event.key === "PageDown") {
      event.preventDefault();
      const next = new Date(
        focused.year,
        focused.month + (event.key === "PageUp" ? -1 : 1),
        1,
      );
      next.setDate(
        Math.min(focused.day, daysInMonth(next.getFullYear(), next.getMonth())),
      );
      setFocusKey(
        toDateKey(next.getFullYear(), next.getMonth(), next.getDate()),
      );
      setCursor({ year: next.getFullYear(), month: next.getMonth() });
      shouldFocus.current = true;
    }
  };

  const years = useMemo(() => {
    const thisYear = new Date().getFullYear();
    const first = Math.min(thisYear - YEAR_SPAN.before, year);
    const last = Math.max(thisYear + YEAR_SPAN.after, year);
    return Array.from(
      { length: last - first + 1 },
      (_, index) => first + index,
    );
  }, [year]);

  const minYear = bounds.min ? Number(bounds.min.slice(0, 4)) : -Infinity;
  const maxYear = bounds.max ? Number(bounds.max.slice(0, 4)) : Infinity;

  return (
    <div className="w-[17.5rem]">
      <div className="mb-2 flex items-center justify-between">
        <ButtonBase
          onClick={() =>
            setView((current) => (current === "days" ? "years" : "days"))
          }
          aria-live="polite"
          aria-expanded={view === "years"}
          aria-label={`${monthTitle.format(new Date(year, month, 1))}, choose year`}
          sx={{
            gap: 0.25,
            px: 1,
            py: 0.5,
            borderRadius: 2,
            fontSize: 14,
            fontWeight: 600,
            "&:hover": {
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
            },
            "&.Mui-focusVisible": {
              outline: "2px solid",
              outlineColor: "primary.main",
            },
          }}
        >
          {monthTitle.format(new Date(year, month, 1))}
          <ArrowDropDownRoundedIcon
            fontSize="small"
            sx={{
              transition: "transform 200ms",
              transform: view === "years" ? "rotate(180deg)" : "none",
            }}
          />
        </ButtonBase>

        {view === "days" ? (
          <div className="flex">
            <IconButton
              size="small"
              aria-label="Previous month"
              onClick={() => goToMonth(-1)}
            >
              <ChevronLeftRoundedIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              aria-label="Next month"
              onClick={() => goToMonth(1)}
            >
              <ChevronRightRoundedIcon fontSize="small" />
            </IconButton>
          </div>
        ) : null}
      </div>

      {view === "years" ? (
        <div
          role="listbox"
          aria-label="Year"
          className="animate-fade-in grid max-h-[16.5rem] grid-cols-3 gap-1 overflow-y-auto py-1 pe-1"
        >
          {years.map((item) => (
            <ButtonBase
              key={item}
              role="option"
              aria-selected={item === year}
              disabled={item < minYear || item > maxYear}
              ref={(element) => {
                if (element && item === year)
                  element.scrollIntoView({ block: "center" });
              }}
              onClick={() => {
                setCursor({ year: item, month });
                setView("days");
              }}
              sx={{
                height: 34,
                borderRadius: 999,
                fontSize: 13,
                fontVariantNumeric: "tabular-nums",
                ...(item === year
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
                },
              }}
            >
              {item}
            </ButtonBase>
          ))}
        </div>
      ) : (
        <div key={`${year}-${month}`} className="animate-fade-in">
          <div className="mb-1 grid grid-cols-7">
            {weekdays.map((weekday, index) => (
              <abbr
                key={index}
                title={weekday.long}
                className="text-ink-muted grid h-8 place-items-center text-xs font-medium no-underline"
              >
                {weekday.short}
              </abbr>
            ))}
          </div>

          <div
            ref={gridRef}
            role="grid"
            aria-label={monthTitle.format(new Date(year, month, 1))}
            onKeyDown={onKeyDown}
            className="grid grid-cols-7 gap-y-0.5"
          >
            {cells.map((day, index) => {
              if (day === null) return <span key={index} role="gridcell" />;

              const key = toDateKey(year, month, day);
              const selected = key === value;
              const disabled = isDayOutside(key, bounds);
              return (
                <span
                  key={index}
                  role="gridcell"
                  aria-selected={selected}
                  className="grid place-items-center"
                >
                  <ButtonBase
                    data-day={day}
                    disabled={disabled}
                    tabIndex={day === tabbableDay ? 0 : -1}
                    aria-label={dayLabel.format(new Date(year, month, day))}
                    aria-current={key === today ? "date" : undefined}
                    onClick={() => {
                      setFocusKey(key);
                      onSelect(key);
                    }}
                    sx={(theme) => ({
                      ...dayButtonSx(theme),
                      ...(selected
                        ? {
                            bgcolor: "primary.main",
                            color: "primary.contrastText",
                            fontWeight: 600,
                            "&:hover": { bgcolor: "primary.dark" },
                          }
                        : key === today
                          ? {
                              border: "1.5px solid",
                              borderColor: "primary.main",
                              color: "primary.main",
                              fontWeight: 600,
                            }
                          : null),
                    })}
                  >
                    {day}
                  </ButtonBase>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
