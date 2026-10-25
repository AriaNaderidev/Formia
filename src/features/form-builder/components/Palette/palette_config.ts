import type { ElementType } from "react";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import ArrowDropDownCircleOutlinedIcon from "@mui/icons-material/ArrowDropDownCircleOutlined";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckBoxOutlinedIcon from "@mui/icons-material/CheckBoxOutlined";
import ChecklistIcon from "@mui/icons-material/Checklist";
import ColorLensOutlinedIcon from "@mui/icons-material/ColorLensOutlined";
import EventIcon from "@mui/icons-material/Event";
import HeightIcon from "@mui/icons-material/Height";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LinkIcon from "@mui/icons-material/Link";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import NotesIcon from "@mui/icons-material/Notes";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import PinIcon from "@mui/icons-material/Pin";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import SmartButtonIcon from "@mui/icons-material/SmartButton";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import SubjectIcon from "@mui/icons-material/Subject";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import TitleIcon from "@mui/icons-material/Title";
import ToggleOnOutlinedIcon from "@mui/icons-material/ToggleOnOutlined";
import TuneIcon from "@mui/icons-material/Tune";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import type { FieldType, FormField } from "@/features/form-schema";

/* ---------- categories (display order) ---------- */

export const PALETTE_CATEGORIES = [
  { id: "text", label: "Text" },
  { id: "choice", label: "Choice" },
  { id: "datetime", label: "Date & time" },
  { id: "advanced", label: "Rich inputs" },
  { id: "layout", label: "Layout" },
  { id: "content", label: "Content" },
  { id: "actions", label: "Actions" },
] as const;

export type PaletteCategoryId = (typeof PALETTE_CATEGORIES)[number]["id"];

/* ---------- per-type presentation (kept out of the schema) ---------- */

type PaletteMeta = {
  title: string;
  description: string;
  category: PaletteCategoryId;
  icon: ElementType;
};

export const PALETTE_META: Record<FieldType, PaletteMeta> = {
  text: {
    title: "Short text",
    description: "A single line of text",
    category: "text",
    icon: TextFieldsIcon,
  },
  textarea: {
    title: "Long text",
    description: "Multi-line answer",
    category: "text",
    icon: NotesIcon,
  },
  number: {
    title: "Number",
    description: "Numeric input with optional min and max",
    category: "text",
    icon: PinIcon,
  },
  email: {
    title: "Email",
    description: "Email address with format check",
    category: "text",
    icon: AlternateEmailIcon,
  },
  tel: {
    title: "Phone",
    description: "Phone number",
    category: "text",
    icon: PhoneOutlinedIcon,
  },
  url: {
    title: "Website",
    description: "Link to a web page",
    category: "text",
    icon: LinkIcon,
  },
  password: {
    title: "Password",
    description: "Hidden text input",
    category: "text",
    icon: LockOutlinedIcon,
  },

  select: {
    title: "Dropdown",
    description: "Pick one option from a list",
    category: "choice",
    icon: ArrowDropDownCircleOutlinedIcon,
  },
  combobox: {
    title: "Searchable list",
    description: "Type to filter, then pick one option",
    category: "choice",
    icon: ManageSearchIcon,
  },
  multiselect: {
    title: "Multi-select",
    description: "Pick several options as chips",
    category: "choice",
    icon: PlaylistAddCheckIcon,
  },
  radiogroup: {
    title: "Radio group",
    description: "Pick one visible option",
    category: "choice",
    icon: RadioButtonCheckedIcon,
  },
  checkbox: {
    title: "Checkbox",
    description: "A single yes or no confirmation",
    category: "choice",
    icon: CheckBoxOutlinedIcon,
  },
  checkboxgroup: {
    title: "Checkbox group",
    description: "Pick any number of visible options",
    category: "choice",
    icon: ChecklistIcon,
  },
  switch: {
    title: "Switch",
    description: "Turn a setting on or off",
    category: "choice",
    icon: ToggleOnOutlinedIcon,
  },

  date: {
    title: "Date",
    description: "Calendar date",
    category: "datetime",
    icon: CalendarMonthIcon,
  },
  time: {
    title: "Time",
    description: "Time of day",
    category: "datetime",
    icon: AccessTimeIcon,
  },
  datetime: {
    title: "Date and time",
    description: "Date and time together",
    category: "datetime",
    icon: EventIcon,
  },

  slider: {
    title: "Slider",
    description: "Choose a value on a range",
    category: "advanced",
    icon: TuneIcon,
  },
  rating: {
    title: "Rating",
    description: "Star rating",
    category: "advanced",
    icon: StarBorderIcon,
  },
  color: {
    title: "Color",
    description: "Color picker",
    category: "advanced",
    icon: ColorLensOutlinedIcon,
  },
  file: {
    title: "File upload",
    description: "Attach a file",
    category: "advanced",
    icon: UploadFileIcon,
  },

  divider: {
    title: "Divider",
    description: "A line between groups of fields",
    category: "layout",
    icon: HorizontalRuleIcon,
  },
  spacer: {
    title: "Spacer",
    description: "Empty vertical space",
    category: "layout",
    icon: HeightIcon,
  },

  heading: {
    title: "Heading",
    description: "Title for a part of the form",
    category: "content",
    icon: TitleIcon,
  },
  paragraph: {
    title: "Paragraph",
    description: "Explanatory text",
    category: "content",
    icon: SubjectIcon,
  },
  alert: {
    title: "Alert",
    description: "Highlighted notice",
    category: "content",
    icon: InfoOutlinedIcon,
  },
  image: {
    title: "Image",
    description: "Picture or logo",
    category: "content",
    icon: ImageOutlinedIcon,
  },

  button: {
    title: "Button",
    description: "Submit, reset or custom action",
    category: "actions",
    icon: SmartButtonIcon,
  },
};

/* ---------- catalog field -> palette entry ---------- */

export type PaletteEntry = PaletteMeta & {
  id: string;
  type: FieldType;
};

export const toPaletteEntry = (field: FormField): PaletteEntry => ({
  id: field.id,
  type: field.type,
  ...PALETTE_META[field.type],
});
