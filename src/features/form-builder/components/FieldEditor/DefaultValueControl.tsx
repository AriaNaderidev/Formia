import { useWatch } from "react-hook-form";
import type { FieldType } from "@/features/form-schema";
import { slugify } from "./editor_model";
import { TextControl } from "./TextControl";
import { NumberControl } from "./NumberControl";
import { SwitchControl } from "./SwitchControl";
import { SelectControl } from "./SelectControl";

/** The default-value input changes shape with the field type. */
export const DefaultValueControl = ({ type }: { type: FieldType }) => {
  const options = useWatch({ name: "options" }) ?? [];
  const min = useWatch({ name: "min" });
  const max = useWatch({ name: "max" });

  const optionList = options
    .filter((option: any) => option.label)
    .map((option: any) => ({
      value: option.value || slugify(option.label),
      label: option.label,
    }));

  switch (type) {
    case "textarea":
      return (
        <TextControl
          name="defaultValue"
          label="Default value"
          multiline
          rows={2}
        />
      );

    case "number":
      return <NumberControl name="defaultValue" label="Default value" />;

    case "date":
      return (
        <TextControl name="defaultValue" label="Default date" type="date" />
      );

    case "time":
      return (
        <TextControl name="defaultValue" label="Default time" type="time" />
      );

    case "datetime":
      return (
        <TextControl
          name="defaultValue"
          label="Default date and time"
          type="datetime-local"
        />
      );

    case "color":
      return (
        <TextControl name="defaultValue" label="Default color" type="color" />
      );

    case "checkbox":
    case "switch":
      return <SwitchControl name="defaultValue" label="Checked by default" />;

    case "select":
    case "combobox":
    case "radiogroup":
      return (
        <SelectControl
          name="defaultValue"
          label="Default option"
          options={[{ value: "", label: "None" }, ...optionList]}
          helperText={optionList.length === 0 ? "Add options first" : undefined}
        />
      );

    case "multiselect":
    case "checkboxgroup":
      return (
        <SelectControl
          multiple
          name="defaultValue"
          label="Selected by default"
          options={optionList}
          helperText={optionList.length === 0 ? "Add options first" : undefined}
        />
      );

    case "slider":
      return (
        <NumberControl
          name="defaultValue"
          label="Default value"
          min={min}
          max={max}
        />
      );

    case "rating":
      return (
        <NumberControl
          name="defaultValue"
          label="Default rating"
          min={0}
          max={max}
        />
      );

    case "file":
    case "password":
      return null;

    default:
      return <TextControl name="defaultValue" label="Default value" />;
  }
};
