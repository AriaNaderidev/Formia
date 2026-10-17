import { useRef } from "react";
import AddIcon from "@mui/icons-material/Add";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { AddFieldMenu } from "../AddFieldMenu";
import { useDismiss } from "./UsedDismiss";

type InsertFieldButtonProps = {
  afterId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Round "+" that sits in the gap below a field card.
 * Must be rendered inside an element with the Tailwind `group` class and `relative`.
 */
export const InsertFieldButton = ({
  afterId,
  isOpen,
  onOpenChange,
}: InsertFieldButtonProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  useDismiss(containerRef, isOpen, () => onOpenChange(false));

  return (
    <div
      ref={containerRef}
      className={`absolute top-[calc(100%+6px)] left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200 ${
        isOpen
          ? "opacity-100"
          : "pointer-events-none opacity-0 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100 [@media(pointer:coarse)]:pointer-events-auto [@media(pointer:coarse)]:opacity-100"
      }`}
    >
      <Tooltip title={isOpen ? "" : "Add a field below"} enterDelay={400}>
        <IconButton
          size="small"
          aria-label="Add a field below"
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
        <AddFieldMenu afterId={afterId} onClose={() => onOpenChange(false)} />
      ) : null}
    </div>
  );
};
