import { useRef, useState, type ReactNode } from "react";
import BookmarkAddOutlinedIcon from "@mui/icons-material/BookmarkAddOutlined";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloudDoneOutlinedIcon from "@mui/icons-material/CloudDoneOutlined";
import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import RedoRoundedIcon from "@mui/icons-material/RedoRounded";
import UndoRoundedIcon from "@mui/icons-material/UndoRounded";
import Tooltip from "@mui/material/Tooltip";
import { parseFormSchema, toFormSchema } from "@/features/form-schema";
import { Logo } from "@/ui/Logo";
import { toast } from "@/ui/toast";
import { downloadText } from "@/utils/download";
import { useFormBuilderContext } from "../context/useFormBuilderContext";
import { MOD_KEY } from "../hooks/useUndoShortcuts";
import { SaveTemplateDialog } from "../templates/SaveTemplateDialog";

type AppHeaderProps = {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  savedAt: number | null;
  /** Opens the field list. Only offered where the palette isn't always visible. */
  onOpenFields: () => void;
};

const Shortcut = ({ label, keys }: { label: string; keys: string }) => (
  <span className="flex items-center gap-2">
    {label}
    <kbd className="rounded bg-white/15 px-1 font-sans text-[10px]">{keys}</kbd>
  </span>
);

const ToolButton = ({
  label,
  tooltip,
  onClick,
  disabled,
  children,
}: {
  label: string;
  tooltip?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) => (
  <Tooltip title={tooltip ?? label} enterDelay={300}>
    {/* The span keeps the tooltip working while the button is disabled. */}
    <span>
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        disabled={disabled}
        className="text-ink-muted hover:bg-plum/[0.07] hover:text-plum focus-visible:outline-plum grid size-8 place-items-center rounded-xl transition-[color,background-color,scale,opacity] duration-150 focus-visible:outline-2 active:scale-90 disabled:pointer-events-none disabled:opacity-35 sm:size-9"
      >
        {children}
      </button>
    </span>
  </Tooltip>
);

export const AppHeader = ({
  undo,
  redo,
  canUndo,
  canRedo,
  savedAt,
  onOpenFields,
}: AppHeaderProps) => {
  const [saveOpen, setSaveOpen] = useState(false);
  const { fields, setFields, getFields } = useFormBuilderContext();
  const fileInput = useRef<HTMLInputElement>(null);
  const isEmpty = fields.length === 0;

  const exportSchema = () => {
    downloadText(
      "form.schema.json",
      JSON.stringify(toFormSchema(getFields()), null, 2),
      "application/json",
    );
    toast.success("Schema exported", {
      description: "Saved as form.schema.json",
    });
  };

  const importSchema = async (file: File) => {
    try {
      const result = parseFormSchema(JSON.parse(await file.text()));
      if (!result.ok) {
        toast.error("That file isn't a form schema", {
          description: result.error,
        });
        return;
      }
      setFields(result.schema.fields);
      toast.success(`Imported ${result.schema.fields.length} fields`, {
        description: file.name,
        action: { label: "Undo", onClick: undo },
      });
    } catch {
      toast.error("Couldn't read that file", {
        description: "Choose a valid .json file.",
      });
    }
  };

  const clearForm = () => {
    const count = getFields().length;
    setFields([]);
    toast.info(`Cleared ${count} ${count === 1 ? "field" : "fields"}`, {
      duration: 6000,
      action: { label: "Undo", onClick: undo },
    });
  };

  return (
    <header className="border-line col-span-full flex h-14 items-center justify-between gap-2 border-b bg-white/80 px-2 backdrop-blur sm:gap-4 sm:px-4">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <span className="lg:hidden">
          <ToolButton label="Open field list" onClick={onOpenFields}>
            <MenuRoundedIcon fontSize="small" />
          </ToolButton>
        </span>
        <Logo className="size-8 shrink-0" />
        <div className="hidden min-w-0 sm:block">
          <h1 className="text-ink mb-0.5 truncate text-sm leading-tight font-semibold">
            Formia
          </h1>
          <p className="text-ink-muted flex items-center gap-1 text-[11px] leading-tight">
            {savedAt ? (
              <span
                key={savedAt}
                className="animate-fade-in inline-flex items-center gap-1"
              >
                <CloudDoneOutlinedIcon sx={{ fontSize: 13 }} />
                Saved in this browser
              </span>
            ) : (
              "Build, preview and export forms"
            )}
          </p>
        </div>
      </div>

      <nav
        aria-label="Form actions"
        className="flex shrink-0 items-center gap-0.5"
      >
        <ToolButton
          label="Undo"
          tooltip={<Shortcut label="Undo" keys={`${MOD_KEY} Z`} />}
          onClick={undo}
          disabled={!canUndo}
        >
          <UndoRoundedIcon fontSize="small" />
        </ToolButton>
        <ToolButton
          label="Redo"
          tooltip={<Shortcut label="Redo" keys={`${MOD_KEY} ⇧ Z`} />}
          onClick={redo}
          disabled={!canRedo}
        >
          <RedoRoundedIcon fontSize="small" />
        </ToolButton>

        <span aria-hidden className="bg-line mx-1.5 h-5 w-px" />

        <ToolButton
          label="Import schema"
          onClick={() => fileInput.current?.click()}
        >
          <FileUploadOutlinedIcon fontSize="small" />
        </ToolButton>
        <ToolButton
          label="Export schema"
          onClick={exportSchema}
          disabled={isEmpty}
        >
          <FileDownloadOutlinedIcon fontSize="small" />
        </ToolButton>
        <ToolButton
          label="Save as template"
          onClick={() => setSaveOpen(true)}
          disabled={isEmpty}
        >
          <BookmarkAddOutlinedIcon fontSize="small" />
        </ToolButton>
        <ToolButton label="Clear form" onClick={clearForm} disabled={isEmpty}>
          <DeleteSweepOutlinedIcon fontSize="small" />
        </ToolButton>

        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void importSchema(file);
          }}
        />
      </nav>

      <SaveTemplateDialog open={saveOpen} onClose={() => setSaveOpen(false)} />
    </header>
  );
};
