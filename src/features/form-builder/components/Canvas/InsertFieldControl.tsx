import { useCallback, useRef } from "react";
import AddIcon from "@mui/icons-material/Add";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { AddFieldMenu } from "../AddFieldMenu";
import { useDismiss } from "./UsedDismiss";
import type { InsertPlacement } from "./Rows";

type InsertFieldControlProps = {
  placement: InsertPlacement;
  /** Field the new one is inserted relative to. */
  anchorId: string;
  menuKey: string;
  isOpen: boolean;
  setOpenMenuKey: (key: string | null) => void;
};

/*
 * Both controls live OUTSIDE the cards, in the row's gaps:
 *   below  -> in the gap under the row, with a horizontal line
 *   beside -> in the gutter at the row's trailing edge, with a vertical line
 * The line previews where the new field will land.
 * Must be rendered inside an element with the `group/row` and `relative` classes.
 */
const PLACEMENT = {
  below: {
    wrapper: "absolute inset-x-0 top-full flex h-3 items-center justify-center",
    line: "inset-x-0 top-1/2 h-0.5 -translate-y-1/2",
    label: "Add a field below",
  },
  beside: {
    wrapper: "absolute inset-y-0 start-full flex items-center ps-1.5",
    line: "inset-y-0 start-0 w-0.5",
    label: "Add a field beside",
  },
} as const;

export const InsertFieldControl = ({
  placement,
  anchorId,
  menuKey,
  isOpen,
  setOpenMenuKey,
}: InsertFieldControlProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const config = PLACEMENT[placement];

  const onOpenChange = useCallback(
    (open: boolean) => setOpenMenuKey(open ? menuKey : null),
    [menuKey, setOpenMenuKey],
  );
  useDismiss(containerRef, isOpen, () => onOpenChange(false));

  return (
    <div ref={containerRef} className={`group/ctl z-20 ${config.wrapper}`}>
      <span
        aria-hidden
        className={`bg-plum/50 pointer-events-none absolute rounded-full transition-opacity duration-150 ${config.line} ${
          isOpen ? "opacity-100" : "opacity-0 group-hover/ctl:opacity-100"
        }`}
      />

      <div
        className={`relative transition-opacity duration-150 ${
          isOpen
            ? "opacity-100"
            : "pointer-events-none opacity-0 group-focus-within/row:pointer-events-auto group-focus-within/row:opacity-100 group-hover/row:pointer-events-auto group-hover/row:opacity-100 [@media(pointer:coarse)]:pointer-events-auto [@media(pointer:coarse)]:opacity-100"
        }`}
      >
        <Tooltip title={isOpen ? "" : config.label} enterDelay={400}>
          <IconButton
            size="small"
            aria-label={config.label}
            aria-haspopup="menu"
            aria-expanded={isOpen}
            onClick={() => onOpenChange(!isOpen)}
            sx={{
              border: 1,
              borderColor: isOpen ? "primary.main" : "divider",
              bgcolor: isOpen ? "primary.main" : "background.paper",
              color: isOpen ? "primary.contrastText" : "text.secondary",
              boxShadow: 1,
              "&:hover": {
                bgcolor: "primary.main",
                borderColor: "primary.main",
                color: "primary.contrastText",
              },
            }}
          >
            <AddIcon
              fontSize="small"
              sx={(theme) => ({
                transform: isOpen ? "rotate(45deg)" : "none",
                transition: theme.transitions.create("transform", {
                  duration: theme.transitions.duration.shorter,
                }),
              })}
            />
          </IconButton>
        </Tooltip>

        {isOpen ? (
          <AddFieldMenu
            anchorId={anchorId}
            placement={placement}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </div>
    </div>
  );
};
