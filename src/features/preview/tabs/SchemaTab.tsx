import { useMemo } from "react";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import Tooltip from "@mui/material/Tooltip";
import { toFormSchema, type FormField } from "@/features/form-schema";
import { downloadText } from "@/utils/download";
import { CodePanel } from "./CodePanel";

export const DownloadButton = ({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) => (
  <Tooltip title={label}>
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="focus-visible:outline-plum grid size-8 place-items-center rounded-lg text-white/70 transition-[color,background-color,scale,translate] duration-150 hover:translate-y-px hover:bg-white/10 hover:text-white focus-visible:outline-2 active:scale-95"
    >
      <FileDownloadOutlinedIcon sx={{ fontSize: 17 }} />
    </button>
  </Tooltip>
);

/** The builder's own JSON: import it later, or render it with your own engine. */
const SchemaTab = ({ fields }: { fields: FormField[] }) => {
  const json = useMemo(() => JSON.stringify(toFormSchema(fields), null, 2), [fields]);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-ink-muted text-xs leading-5">
        The portable definition of this form. Save it to re-import later from the toolbar,
        or feed it to your own renderer.
      </p>
      <CodePanel
        title="form.schema.json"
        code={json}
        language="json"
        actions={
          <DownloadButton
            label="Download JSON"
            onClick={() => downloadText("form.schema.json", json, "application/json")}
          />
        }
      />
    </div>
  );
};

export default SchemaTab;
