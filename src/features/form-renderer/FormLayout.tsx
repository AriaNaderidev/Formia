import { useId, type ReactNode } from "react";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import Button from "@mui/material/Button";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import {
  BUTTON_VARIANT_BY_TYPE,
  rowWeights,
  type FormField,
  type FormLayoutTree,
  type FormSection,
  type FormTab,
} from "../form-schema";

/** Full class names, so Tailwind can find them. */
const rowColumns = (fields: FormField[]) => {
  const weights = rowWeights(fields)?.join(",");
  if (weights === "2,1") return "@sm:grid-cols-[2fr_1fr]";
  if (weights === "1,2") return "@sm:grid-cols-[1fr_2fr]";
  return fields.length > 1 ? "@sm:grid-cols-2" : "";
};

type FormLayoutProps = {
  layout: FormLayoutTree;
  activeTab: number;
  onTabChange: (index: number) => void;
  /** Called by "Next"; the parent validates the tab before moving on. */
  onNext: () => void;
  renderField: (field: FormField) => ReactNode;
  /** Shown under the last tab (or under the form, when there are no tabs). */
  footer: ReactNode;
};

/** A form with no tabs, as the single panel the layout loop expects. */
const plainPanel = (sections: FormSection[]): FormTab => ({
  key: "form",
  title: "",
  nextLabel: "",
  previousLabel: "",
  sections,
  fields: [],
});

const Section = ({
  section,
  renderField,
}: {
  section: FormSection;
  renderField: (field: FormField) => ReactNode;
}) => {
  const titleId = useId();
  const { marker } = section;

  const rows = section.rows.map((row, index) => (
    <div
      key={row.key}
      style={{ animationDelay: `${Math.min(index, 10) * 30}ms` }}
      className={`animate-fade-up grid gap-4 ${rowColumns(row.fields)}`}
    >
      {row.fields.map((field) => (
        <div key={field.id} className="min-w-0">
          {renderField(field)}
        </div>
      ))}
    </div>
  ));

  if (!marker) return <>{rows}</>;

  return (
    <section
      aria-labelledby={titleId}
      className="border-line bg-canvas/60 flex flex-col gap-4 rounded-2xl border p-4"
    >
      <div>
        <Typography
          id={titleId}
          variant="subtitle2"
          component="h3"
          sx={{ color: "text.primary", fontWeight: 700 }}
        >
          {marker.label}
        </Typography>
        {marker.content ? (
          <Typography variant="caption" color="text.secondary">
            {marker.content}
          </Typography>
        ) : null}
      </div>
      {rows}
    </section>
  );
};

/** Lays the form out as tabs, sections and rows. */
export const FormLayout = ({
  layout,
  activeTab,
  onTabChange,
  onNext,
  renderField,
  footer,
}: FormLayoutProps) => {
  const baseId = useId();
  // Tab headers and Previous/Next only exist with tabs. Without them the form is one panel.
  const tabbed = layout.tabs.length > 0;
  const tabs = tabbed ? layout.tabs : [plainPanel(layout.lead)];
  const last = tabs.length - 1;
  const sectionsOf = (sections: FormSection[]) =>
    sections.map((section) => (
      <Section key={section.key} section={section} renderField={renderField} />
    ));

  return (
    <>
      {tabbed ? sectionsOf(layout.lead) : null}

      {tabbed ? (
        <Tabs
          value={activeTab}
          onChange={(_, index: number) => onTabChange(index)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          aria-label="Form steps"
        >
          {tabs.map((tab, index) => (
            <Tab
              key={tab.key}
              label={tab.title}
              id={`${baseId}-tab-${index}`}
              aria-controls={`${baseId}-panel-${index}`}
            />
          ))}
        </Tabs>
      ) : null}

      {tabs.map((tab, index) => (
        // All panels stay mounted: values and errors of hidden tabs are kept.
        <div
          key={tab.key}
          role={tabbed ? "tabpanel" : undefined}
          id={`${baseId}-panel-${index}`}
          aria-labelledby={tabbed ? `${baseId}-tab-${index}` : undefined}
          hidden={tabbed && index !== activeTab}
          className="flex flex-col gap-4"
        >
          {/* Going back is a small link above the fields, so it never competes with
              Next, Submit or Reset below them. */}
          {tabbed && index > 0 ? (
            <Button
              size="small"
              variant="text"
              color="inherit"
              startIcon={
                <ArrowBackRoundedIcon
                  sx={{ "[dir=rtl] &": { transform: "scaleX(-1)" } }}
                />
              }
              onClick={() => onTabChange(index - 1)}
              sx={{ alignSelf: "flex-start" }}
            >
              {tab.previousLabel}
            </Button>
          ) : null}

          {tab.sections.map((section) => (
            <Section key={section.key} section={section} renderField={renderField} />
          ))}

          {tabbed && index < last ? (
            <Button fullWidth variant={BUTTON_VARIANT_BY_TYPE.submit} onClick={onNext}>
              {tab.nextLabel}
            </Button>
          ) : null}

          {index === last ? footer : null}
        </div>
      ))}

      {tabbed ? sectionsOf(layout.trail) : null}
    </>
  );
};
