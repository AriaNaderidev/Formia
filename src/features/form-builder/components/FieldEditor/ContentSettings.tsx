import Typography from "@mui/material/Typography";
import { useFormContext } from "react-hook-form";
import {
  BUTTON_VARIANT_BY_TYPE,
  type ButtonType,
  type FieldType,
} from "@/features/form-schema";
import type { EditorValues } from "./editor_model";
import { SelectControl, type SelectOption } from "./SelectControl";
import { TextControl } from "./TextControl";
import { NumberControl } from "./NumberControl";

const HEADING_LEVELS: SelectOption[] = [
  { value: "h1", label: "Heading 1 (largest)" },
  { value: "h2", label: "Heading 2" },
  { value: "h3", label: "Heading 3" },
  { value: "h4", label: "Heading 4 (smallest)" },
];

const SEVERITIES: SelectOption[] = [
  { value: "info", label: "Info" },
  { value: "success", label: "Success" },
  { value: "warning", label: "Warning" },
  { value: "error", label: "Error" },
];

const BUTTON_TYPES: SelectOption[] = [
  { value: "submit", label: "Submit the form" },
  { value: "reset", label: "Reset the form" },
  { value: "button", label: "Plain button" },
];

const BUTTON_VARIANTS: SelectOption[] = [
  { value: "contained", label: "Filled" },
  { value: "outlined", label: "Outlined" },
  { value: "text", label: "Text only" },
];

const ButtonSettings = () => {
  const { setValue } = useFormContext<EditorValues>();

  return (
    <>
      <TextControl name="label" label="Button text" />
      <SelectControl
        name="buttonType"
        label="Action"
        options={BUTTON_TYPES}
        // Each action starts with its own look; the style can still be changed after.
        onValueChange={(type) =>
          setValue("buttonVariant", BUTTON_VARIANT_BY_TYPE[type as ButtonType], {
            shouldDirty: true,
          })
        }
      />
      <SelectControl
        name="buttonVariant"
        label="Style"
        options={BUTTON_VARIANTS}
      />
    </>
  );
};

/** Settings for layout and content elements, one block per type. */
export const ContentSettings = ({ type }: { type: FieldType }) => {
  switch (type) {
    case "tab":
      return (
        <>
          <TextControl name="label" label="Tab title" />
          <TextControl
            name="previousLabel"
            label="Previous button text"
            placeholder="Previous"
            helperText="Shown on every tab except the first"
          />
          <TextControl
            name="nextLabel"
            label="Next button text"
            placeholder="Next"
            helperText="Shown on every tab except the last"
          />
          <Typography variant="body2" color="text.secondary">
            The fields inside this tab's area on the canvas appear on it.
          </Typography>
        </>
      );

    case "section":
      return (
        <>
          <TextControl name="label" label="Section title" />
          <TextControl
            name="content"
            label="Description"
            helperText="Optional, shown under the title"
            multiline
            rows={2}
          />
          <Typography variant="body2" color="text.secondary">
            The fields inside this section's area on the canvas are grouped under it.
          </Typography>
        </>
      );

    case "heading":
      return (
        <>
          <TextControl name="content" label="Heading text" />
          <SelectControl
            name="headingLevel"
            label="Level"
            options={HEADING_LEVELS}
          />
        </>
      );

    case "paragraph":
      return <TextControl name="content" label="Text" multiline rows={4} />;

    case "alert":
      return (
        <>
          <TextControl name="content" label="Message" multiline rows={3} />
          <SelectControl name="severity" label="Style" options={SEVERITIES} />
        </>
      );

    case "image":
      return (
        <>
          <TextControl name="src" label="Image URL" placeholder="https://" />
          <TextControl
            name="alt"
            label="Alt text"
            helperText="Describes the image for screen readers"
          />
          <NumberControl
            name="height"
            label="Height (px)"
            min={40}
            max={800}
            step={10}
          />
        </>
      );

    case "button":
      return <ButtonSettings />;

    case "spacer":
      return (
        <NumberControl
          name="height"
          label="Height (px)"
          min={0}
          max={200}
          step={4}
        />
      );

    case "divider":
      return (
        <Typography variant="body2" color="text.secondary">
          A divider has no settings. Use the advanced section to style it.
        </Typography>
      );

    default:
      return null;
  }
};
