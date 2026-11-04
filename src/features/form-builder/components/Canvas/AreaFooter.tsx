import { useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { AddFieldMenu } from "./AddFieldMenu";

type AreaFooterProps = {
  /** "tab" or "section": names the area in the hint. */
  type: "tab" | "section";
  empty: boolean;
  /** New fields go below this one, which puts them inside the area. */
  anchorId: string;
};

/** The closing edge of a tab or section: where its fields end, and a way to add one. */
export const AreaFooter = ({ type, empty, anchorId }: AreaFooterProps) => {
  const [button, setButton] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <button
        ref={setButton}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="menu"
        aria-label={`Add a field to this ${type}`}
        className="border-line text-ink-muted hover:border-plum hover:text-plum focus-visible:outline-plum flex min-h-9 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-2 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2"
      >
        <AddRoundedIcon sx={{ fontSize: 16 }} />
        <span className="truncate">{empty ? "Add or drop a field here" : "Add a field"}</span>
      </button>
      {open ? (
        <AddFieldMenu
          anchorId={anchorId}
          anchorEl={button}
          placement="below"
          onClose={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
};
