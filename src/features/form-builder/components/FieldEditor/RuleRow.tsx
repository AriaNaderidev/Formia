import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useWatch } from "react-hook-form";
import { NumberControl } from "./NumberControl";
import { SwitchControl } from "./SwitchControl";
import { TextControl } from "./TextControl";
import type { FieldPath, FieldRules } from "./editor_model";
import { TemporalValueControl } from "./TemporalValueControl";

/** Outlined container shared by every validation rule. */
export const RuleCard = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) => (
  <Paper variant="outlined" sx={{ p: 1.5 }}>
    <Typography variant="subtitle2">{title}</Typography>
    {description ? (
      <Typography variant="caption" color="text.secondary">
        {description}
      </Typography>
    ) : null}
    <Stack spacing={1.5} sx={{ pt: 1.5 }}>
      {children}
    </Stack>
  </Paper>
);

type RuleRowProps = {
  title: string;
  description?: string;
  /** Switch that turns the rule on (e.g. validation.useMinLength). */
  enabledName: FieldPath;
  /** Optional value, e.g. the minimum length itself. */
  valueName?: FieldPath;
  valueLabel?: string;
  /** Which input edits the value. Defaults to a number input. */
  valueKind?: "number" | "date" | "time" | "datetime-local";
  /** Temporal values only: offer the "use today" checkbox. */
  allowToday?: boolean;
  todayHint?: string;
  valueRules?: FieldRules;
  messageName: FieldPath;
};

/** A switch that reveals the rule's value and error message when turned on. */
export const RuleRow = ({
  title,
  description,
  enabledName,
  valueName,
  valueLabel,
  valueKind = "number",
  allowToday,
  todayHint,
  valueRules,
  messageName,
}: RuleRowProps) => {
  const enabled = Boolean(useWatch({ name: enabledName }));
  const isTemporal = valueKind !== "number";

  return (
    <Paper variant="outlined" sx={{ px: 1.5, py: 0.75 }}>
      <SwitchControl
        name={enabledName}
        label={title}
        labelPlacement="start"
        helperText={description}
        sx={{ width: "100%", justifyContent: "space-between", mx: 0 }}
      />
      <Collapse in={enabled} unmountOnExit>
        {/* Date inputs are wide, so they stack above the message instead of sitting beside it. */}
        <Stack
          direction={isTemporal ? "column" : "row"}
          spacing={1.5}
          sx={{ pt: 1, pb: 1 }}
        >
          {valueName ? (
            <Box sx={isTemporal ? undefined : { width: 140, flexShrink: 0 }}>
              {isTemporal ? (
                <TemporalValueControl
                  name={valueName}
                  label={valueLabel ?? "Value"}
                  inputType={valueKind}
                  allowToday={allowToday}
                  todayHint={todayHint}
                  rules={valueRules}
                />
              ) : (
                <NumberControl
                  name={valueName}
                  label={valueLabel ?? "Value"}
                  rules={valueRules}
                />
              )}
            </Box>
          ) : null}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <TextControl
              name={messageName}
              label="Error message"
              placeholder="Shown when the rule fails"
            />
          </Box>
        </Stack>
      </Collapse>
    </Paper>
  );
};
