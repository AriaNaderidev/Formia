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
import type { FieldPath } from "./editor_model";

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
  messageName: FieldPath;
};

/** A switch that reveals the rule's value and error message when turned on. */
export const RuleRow = ({
  title,
  description,
  enabledName,
  valueName,
  valueLabel,
  messageName,
}: RuleRowProps) => {
  const enabled = Boolean(useWatch({ name: enabledName }));

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
        <Stack direction="row" spacing={1.5} sx={{ pt: 1, pb: 1 }}>
          {valueName ? (
            <Box sx={{ width: 140, flexShrink: 0 }}>
              <NumberControl name={valueName} label={valueLabel ?? "Value"} />
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