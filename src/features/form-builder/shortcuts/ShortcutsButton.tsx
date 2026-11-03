import KeyboardOutlinedIcon from "@mui/icons-material/KeyboardOutlined";
import Tooltip from "@mui/material/Tooltip";

/** Fixed in the bottom corner. Toasts stack above it (see Toaster). */
export const ShortcutsButton = ({ onClick }: { onClick: () => void }) => (
  <Tooltip title="Keyboard shortcuts (?)" placement="left" enterDelay={300}>
    <button
      type="button"
      aria-label="Keyboard shortcuts"
      aria-haspopup="dialog"
      aria-keyshortcuts="Shift+? Control+/ Meta+/"
      onClick={onClick}
      className="border-line text-plum hover:bg-plum focus-visible:outline-plum fixed end-4 bottom-4 z-40 grid size-11 place-items-center rounded-full border bg-white shadow-[0_8px_24px_-8px_rgba(42,22,51,0.4)] transition-[color,background-color,scale] duration-150 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-90 sm:end-5 sm:bottom-5"
    >
      <KeyboardOutlinedIcon />
    </button>
  </Tooltip>
);
