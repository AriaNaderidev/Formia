import { useState } from "react";
import { FormRenderer } from "../form-renderer";
import { toFormSchema } from "../form-schema";
import { useFormBuilderContext } from "../form-builder/context/useFormBuilderContext";
import { CodeBlock } from "../../shared/ui/CodeBlock";
import { PreviewTabs, Tab } from "./tabs/PreviewTabs";
import { usePreviewTabs } from "./tabs/usePreviewTabs";

const TabsList = () => (
  <div className="flex h-10 w-50 items-center justify-evenly rounded-md bg-[#e6e6e6] p-2 text-sm text-gray-500">
    <Tab id="prev">Preview</Tab>
    <Tab id="json">Json</Tab>
    <Tab id="data">Data</Tab>
  </div>
);

const TabsContent = () => {
  const { active, setActive } = usePreviewTabs();
  const { fields, formData, setFormData } = useFormBuilderContext();
  const schema = toFormSchema(fields);

  return (
    <div className="h-full w-full overflow-auto rounded-lg p-2 shadow-[0px_0px_3px_#9ca3af]">
      {active === "prev" ? (
        <FormRenderer
          key={JSON.stringify(schema)}
          schema={schema}
          onSubmit={(data) => {
            setFormData(data);
            setActive("data");
          }}
        />
      ) : active === "json" ? (
        <CodeBlock value={schema} />
      ) : (
        <CodeBlock value={formData} />
      )}
    </div>
  );
};

export const PreviewPanel = () => {
  const [active, setActive] = useState("prev");
  const { fields } = useFormBuilderContext();

  if (fields.length === 0) return null;

  return (
    <PreviewTabs value={{ active, setActive }}>
      <div className="flex flex-col items-center justify-between gap-2 p-2">
        <TabsList />
        <TabsContent />
      </div>
    </PreviewTabs>
  );
};
