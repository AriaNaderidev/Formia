import { useCallback, useRef } from "react";
import AddIcon from "@mui/icons-material/Add";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useDismiss } from "@/features/form-builder/hooks/useDismiss";
import { AddFieldMenu } from "./AddFieldMenu";

type InsertFieldControlProps = {
  /** Field the new one is inserted relative to. */
  anchorId: string;
  menuKey: string;
  isOpen: boolean;
  setOpenMenuKey: (key: string | null) => void;
};

const LABEL = "Add a field beside";

export const InsertFieldControl = ({
  anchorId,
  menuKey,
  isOpen,
  setOpenMenuKey,
}: InsertFieldControlProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const onOpenChange = useCallback(
    (open: boolean) => setOpenMenuKey(open ? menuKey : null),
    [menuKey, setOpenMenuKey],
  );

  useDismiss(containerRef, isOpen, () => onOpenChange(false));

  return (
    <div
      ref={containerRef}
      className="group/ctl absolute inset-y-0 start-full z-20 flex items-center ps-1.5"
    >
      <span
        aria-hidden
        className={`bg-plum/50 pointer-events-none absolute inset-y-0 start-0 w-0.5 rounded-full transition-opacity duration-150 ${
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
        <Tooltip title={isOpen ? "" : LABEL} enterDelay={400}>
          <IconButton
            size="small"
            aria-label={LABEL}
            aria-haspopup="dialog"
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
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </div>
    </div>
  );
};
