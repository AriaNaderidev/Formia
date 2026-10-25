import { useMemo } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useWatch } from "react-hook-form";
import { INPUT_FIELD_TYPES } from "@/features/form-schema";
import { PALETTE_META } from "../Palette/palette_config";
import { useFormBuilderContext } from "../../context/useFormBuilderContext";
import { isContentType } from "./editor_config";
import { ContentSettings } from "./ContentSettings";
import { TextControl } from "./TextControl";
import { SelectControl } from "./SelectControl";
import { TypeSettings } from "./TypeSettings";
import { DefaultValueControl } from "./DefaultValueControl";
import { SwitchControl } from "./SwitchControl";

const INPUT_TYPE_OPTIONS = INPUT_FIELD_TYPES.map((item) => ({
  value: item,
  label: PALETTE_META[item].title,
}));

export const GeneralPanel = ({ sourceId }: { sourceId: string }) => {
  const type = useWatch({ name: "type" });
  const { fields } = useFormBuilderContext();

  const takenNames = useMemo(
    () => new Set(fields.filter((f) => f.id !== sourceId).map((f) => f.name)),
    [fields, sourceId],
  );

  return (
    <Stack spacing={2.5}>
      {isContentType(type) ? (
        <ContentSettings type={type} />
      ) : (
        <>
          <TextControl name="label" label="Label" />

          <TextControl
            name="name"
            label="Field name"
            helperText="The key this field uses in the submitted data"
            rules={{
              required: "Name is required",
              pattern: {
                value: /^[^\s.]+$/,
                message: "No spaces or dots",
              },
              validate: (value) =>
                !takenNames.has(String(value).trim()) ||
                "Another field already uses this name",
            }}
          />

          {INPUT_FIELD_TYPES.includes(type) ? (
            <SelectControl
              name="type"
              label="Input type"
              options={INPUT_TYPE_OPTIONS}
            />
          ) : null}

          <TypeSettings type={type} />
          <DefaultValueControl type={type} />

          <SwitchControl
            name="disabled"
            label="Disabled"
            helperText="Users can see this field but can't change it"
          />
        </>
      )}

      <Accordion
        disableGutters
        variant="outlined"
        sx={{ borderRadius: 1, "&::before": { display: "none" } }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">Advanced</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TextControl
            name="className"
            label="CSS classes"
            helperText="Applied to this element in the form"
          />
        </AccordionDetails>
      </Accordion>
    </Stack>
  );
};
