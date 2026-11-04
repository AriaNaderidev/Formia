import { useCallback, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { AddFieldMenu } from "./AddFieldMenu";

type InsertFieldControlProps = {
  /** Field the new one is inserted relative to. */
  anchorId: string;
  menuKey: string;
  isOpen: boolean;
  setOpenMenuKey: (key: string | null) => void;
};

const LABEL = "Add a field beside";

/** A "+" in the card's actions: adds a second field next to this one. */
export const InsertFieldControl = ({
  anchorId,
  menuKey,
  isOpen,
  setOpenMenuKey,
}: InsertFieldControlProps) => {
  const [button, setButton] = useState<HTMLElement | null>(null);

  const onOpenChange = useCallback(
    (open: boolean) => setOpenMenuKey(open ? menuKey : null),
    [menuKey, setOpenMenuKey],
  );
  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  return (
    <>
      <Tooltip title={isOpen ? "" : LABEL} enterDelay={400}>
        <IconButton
          ref={setButton}
          size="small"
          aria-label={LABEL}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          onClick={() => onOpenChange(!isOpen)}
          sx={{
            color: isOpen ? "primary.contrastText" : "text.secondary",
            bgcolor: isOpen ? "primary.main" : "transparent",
            "&:hover": {
              bgcolor: "primary.main",
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
        <AddFieldMenu anchorId={anchorId} anchorEl={button} onClose={close} />
      ) : null}
    </>
  );
};
