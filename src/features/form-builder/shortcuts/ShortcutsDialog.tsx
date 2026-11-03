import { useId } from "react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import KeyboardOutlinedIcon from "@mui/icons-material/KeyboardOutlined";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import { ShortcutKeys } from "./ShortcutKeys";
import { SHORTCUT_GROUPS, WALKTHROUGH } from "./shortcutList";

type ShortcutsDialogProps = {
  open: boolean;
  onClose: () => void;
};

/** The keyboard guide. Its content comes from shortcutList, the same list the app is wired from. */
export const ShortcutsDialog = ({ open, onClose }: ShortcutsDialogProps) => {
  const titleId = useId();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
      aria-labelledby={titleId}
    >
      <DialogTitle
        id={titleId}
        sx={{ display: "flex", alignItems: "center", gap: 1.5, pe: 7 }}
      >
        <span className="bg-plum grid size-10 shrink-0 place-items-center rounded-xl text-white">
          <KeyboardOutlinedIcon fontSize="small" />
        </span>
        <span className="min-w-0">
          <span className="block text-lg leading-tight font-semibold">
            Keyboard shortcuts
          </span>
          <span className="text-ink-muted block text-xs font-normal">
            Everything in Formia works without a mouse.
          </span>
        </span>
        <IconButton
          aria-label="Close keyboard shortcuts"
          onClick={onClose}
          size="small"
          sx={{ position: "absolute", top: 14, insetInlineEnd: 14 }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* `relative` contains the absolutely positioned screen-reader text (sr-only) in the
          key caps; otherwise it stretches the dialog frame and gives it its own scrollbar. */}
      <DialogContent dividers sx={{ position: "relative" }}>
        <section aria-labelledby={`${titleId}-start`} className="bg-plum/[0.05] mb-6 rounded-xl p-4">
          <h3 id={`${titleId}-start`} className="text-ink mb-2 text-sm font-semibold">
            Build a form with only the keyboard
          </h3>
          <ol className="text-ink-muted ms-4 list-decimal space-y-1 text-sm">
            {WALKTHROUGH.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
          {SHORTCUT_GROUPS.map((group) => (
            <section key={group.id} aria-labelledby={`${titleId}-${group.id}`}>
              <h3
                id={`${titleId}-${group.id}`}
                className="text-ink text-sm font-semibold"
              >
                {group.title}
              </h3>
              {group.description ? (
                <p className="text-ink-muted mt-0.5 text-xs">{group.description}</p>
              ) : null}
              <dl className="mt-2 divide-y divide-[var(--color-line)]">
                {group.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.action}
                    className="flex items-center justify-between gap-4 py-2"
                  >
                    <dt className="text-ink text-sm">{shortcut.action}</dt>
                    <dd className="shrink-0">
                      <ShortcutKeys
                        combos={shortcut.combos}
                        sequence={shortcut.sequence}
                      />
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="contained" onClick={onClose}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};
