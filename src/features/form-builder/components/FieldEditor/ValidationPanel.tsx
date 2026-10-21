import Stack from "@mui/material/Stack";
import { useWatch } from "react-hook-form";
import { RuleCard, RuleRow } from "./RuleRow";
import { PATTERN_TYPES, TEXT_LENGTH_TYPES } from "./editor_config";
import { TextControl } from "./TextControl";
import { NumberControl } from "./NumberControl";


const REQUIRED_TITLES: Record<string, string> = {
  checkbox: "Must be checked",
  checkboxgroup: "At least one selected",
};

export const ValidationPanel = () => {
  const type = useWatch({ name: "type" });

  return (
    <Stack spacing={1.5}>
      <RuleRow
        title={REQUIRED_TITLES[type] ?? "Required"}
        enabledName="validation.required"
        messageName="validation.requiredMessage"
      />

      {TEXT_LENGTH_TYPES.has(type) ? (
        <>
          <RuleRow
            title="Minimum length"
            enabledName="validation.useMinLength"
            valueName="validation.minLength"
            valueLabel="Characters"
            messageName="validation.minLengthMessage"
          />
          <RuleRow
            title="Maximum length"
            enabledName="validation.useMaxLength"
            valueName="validation.maxLength"
            valueLabel="Characters"
            messageName="validation.maxLengthMessage"
          />
        </>
      ) : null}

      {type === "number" ? (
        <>
          <RuleRow
            title="Minimum value"
            enabledName="validation.useMin"
            valueName="validation.min"
            valueLabel="Value"
            messageName="validation.minMessage"
          />
          <RuleRow
            title="Maximum value"
            enabledName="validation.useMax"
            valueName="validation.max"
            valueLabel="Value"
            messageName="validation.maxMessage"
          />
        </>
      ) : null}

      {PATTERN_TYPES.has(type) ? (
        <RuleCard
          title="Custom pattern"
          description="A regular expression the value must match"
        >
          <TextControl name="validation.pattern" label="Regex" placeholder="^[A-Za-z]+$" />
          <TextControl
            name="validation.patternMessage"
            label="Error message"
            placeholder="Shown when the pattern doesn't match"
          />
        </RuleCard>
      ) : null}

      {type === "file" ? (
        <RuleCard title="File restrictions">
          <TextControl
            name="validation.acceptedTypes"
            label="Accepted types"
            placeholder=".pdf, .png, image/*"
          />
          <NumberControl
            name="validation.maxSize"
            label="Max size (MB)"
            min={0}
            step={1}
          />
          <TextControl name="validation.fileValidationMessage" label="Error message" />
        </RuleCard>
      ) : null}
    </Stack>
  );
};