import { IS_MAC, MOD_KEY } from "../hooks/useUndoShortcuts";

/** Written as tokens ("Mod", "Up") so each platform shows its own keys. */
export type KeyCombo = string[];

export type Shortcut = {
  action: string;
  /** Alternatives: any one of these does it. */
  combos: KeyCombo[];
  /** Keys are pressed one after the other ("A, then I"), not held together. */
  sequence?: boolean;
};

export type ShortcutGroup = {
  id: string;
  title: string;
  description?: string;
  shortcuts: Shortcut[];
};

type KeyLabel = { text: string; name: string };

/** `text` is what the key cap shows; `name` is what a screen reader says. */
const KEY_LABELS: Record<string, KeyLabel> = {
  Mod: { text: MOD_KEY, name: IS_MAC ? "Command" : "Control" },
  Shift: { text: IS_MAC ? "⇧" : "Shift", name: "Shift" },
  Alt: { text: IS_MAC ? "⌥" : "Alt", name: IS_MAC ? "Option" : "Alt" },
  Up: { text: "↑", name: "Up arrow" },
  Down: { text: "↓", name: "Down arrow" },
  Left: { text: "←", name: "Left arrow" },
  Right: { text: "→", name: "Right arrow" },
  Esc: { text: "Esc", name: "Escape" },
  Del: { text: "Del", name: "Delete" },
};

export const getKeyLabel = (token: string): KeyLabel =>
  KEY_LABELS[token] ?? { text: token, name: token };

export const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    id: "anywhere",
    title: "Anywhere",
    description:
      "Shortcuts without a modifier are ignored while you are typing in a text field.",
    shortcuts: [
      { action: "Open this guide", combos: [["?"], ["Mod", "/"]] },
      { action: "Search the field list", combos: [["/"]] },
      { action: "Jump to the field list", combos: [["Alt", "1"]] },
      { action: "Jump to the canvas", combos: [["Alt", "2"]] },
      { action: "Jump to the preview", combos: [["Alt", "3"]] },
      { action: "Jump to the templates (empty form)", combos: [["Alt", "4"]] },
      { action: "Undo", combos: [["Mod", "Z"]] },
      {
        action: "Redo",
        combos: IS_MAC
          ? [["Mod", "Shift", "Z"]]
          : [["Mod", "Shift", "Z"], ["Mod", "Y"]],
      },
      { action: "Skip links (first Tab press on the page)", combos: [["Tab"]] },
    ],
  },
  {
    id: "header",
    title: "Header actions",
    description: "Press A, then the letter. Esc or any other key cancels.",
    shortcuts: [
      { action: "Import a schema", combos: [["A", "I"]], sequence: true },
      { action: "Export the schema", combos: [["A", "E"]], sequence: true },
      { action: "Save as a template", combos: [["A", "T"]], sequence: true },
      {
        action: "Clear the form (undo brings it back)",
        combos: [["A", "C"]],
        sequence: true,
      },
    ],
  },
  {
    id: "templates",
    title: "Templates (empty form)",
    description: "Saving your own template is under Header actions.",
    shortcuts: [
      { action: "Move between templates", combos: [["Left"], ["Right"], ["Up"], ["Down"]] },
      { action: "First or last template", combos: [["Home"], ["End"]] },
      { action: "Use the focused template", combos: [["Enter"], ["Space"]] },
      { action: "Delete a template you saved (undo in the toast)", combos: [["Del"], ["Backspace"]] },
    ],
  },
  {
    id: "field-list",
    title: "Field list",
    shortcuts: [
      { action: "Move from the search box into the list", combos: [["Down"]] },
      { action: "Move between fields", combos: [["Left"], ["Right"], ["Up"], ["Down"]] },
      { action: "Add the focused field to the end of the form", combos: [["Enter"], ["Space"]] },
      { action: "Clear the search", combos: [["Esc"]] },
    ],
  },
  {
    id: "canvas",
    title: "Canvas (a field is focused)",
    shortcuts: [
      { action: "Move between fields and their buttons", combos: [["Tab"], ["Shift", "Tab"]] },
      { action: "Edit the field", combos: [["Enter"]] },
      { action: "Delete the field (undo brings it back)", combos: [["Del"], ["Backspace"]] },
      { action: "Move its row up", combos: [["Alt", "Up"]] },
      { action: "Move its row down", combos: [["Alt", "Down"]] },
    ],
  },
  {
    id: "drag",
    title: "Move row handle",
    description: "Tab to the grip beside a row, then pick the row up.",
    shortcuts: [
      { action: "Pick up or drop the row", combos: [["Space"], ["Enter"]] },
      { action: "Move the picked up row", combos: [["Up"], ["Down"]] },
      { action: "Cancel and put it back", combos: [["Esc"]] },
    ],
  },
  {
    id: "menus",
    title: "Dialogs, menus and tabs",
    shortcuts: [
      { action: "Close the dialog, menu or drawer", combos: [["Esc"]] },
      { action: "Save in the field editor (while typing in a field)", combos: [["Enter"]] },
      { action: "Switch tab (Preview, Schema, Code, editor tabs)", combos: [["Left"], ["Right"]] },
      { action: "First or last tab", combos: [["Home"], ["End"]] },
    ],
  },
  {
    id: "dates",
    title: "Date and time pickers",
    shortcuts: [
      { action: "Open the picker", combos: [["Enter"], ["Space"], ["Down"]] },
      { action: "Move between days", combos: [["Left"], ["Right"], ["Up"], ["Down"]] },
      { action: "Previous or next month", combos: [["PageUp"], ["PageDown"]] },
      { action: "Move between times in a column", combos: [["Up"], ["Down"]] },
    ],
  },
];

const ALT = getKeyLabel("Alt").text;

export const WALKTHROUGH = [
  "Press / to search the field list, then ↓ to reach the results. Enter adds the focused field.",
  `Press ${ALT}+2 to jump to the canvas. Tab moves between fields; Enter edits one.`,
  `${ALT}+↑ and ${ALT}+↓ move a row, Del removes a field, and ${MOD_KEY}+Z undoes either.`,
  `Press ${ALT}+3 for the preview. ← and → switch between Preview, Schema and Code.`,
];
