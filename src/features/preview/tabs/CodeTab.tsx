import { useDeferredValue, useEffect, useMemo, useState } from "react";
import TerminalRoundedIcon from "@mui/icons-material/TerminalRounded";
import {
  DEFAULT_COMPONENT_NAME,
  formatCode,
  generateFormCode,
  getFormattedCode,
  installCommand,
  toComponentName,
  warmFormatter,
  type FormLibrary,
  type PackageManager,
  type UiKit,
} from "@/features/codegen";
import type { FormField } from "@/features/form-schema";
import { CopyButton } from "@/ui/CopyButton";
import { SegmentedControl } from "@/ui/SegmentedControl";
import { downloadText } from "@/utils/download";
import { oneOf, useLocalStorageState } from "@/utils/useLocalStorageState";
import { CodePanel } from "./CodePanel";
import { DownloadButton } from "./SchemaTab";

const LIBRARIES = [
  { value: "rhf" as const, label: "React Hook Form", shortLabel: "RHF" },
  { value: "formik" as const, label: "Formik" },
  { value: "tanstack" as const, label: "TanStack Form", shortLabel: "TanStack" },
];

const LIBRARY_NOTES: Record<FormLibrary, string> = {
  rhf: "Uncontrolled inputs and a Zod resolver. The fastest option and the most widely used.",
  formik: "Formik with a Yup schema. A good fit for codebases that already use Formik.",
  tanstack: "Type-safe and headless, validated with a Zod Standard Schema.",
};

const UI_KITS = [
  { value: "tailwind" as const, label: "Tailwind CSS", shortLabel: "Tailwind" },
  { value: "mui" as const, label: "Material UI", shortLabel: "MUI" },
];

const MANAGERS: { value: PackageManager; label: string }[] = [
  { value: "npm", label: "npm" },
  { value: "pnpm", label: "pnpm" },
  { value: "yarn", label: "yarn" },
  { value: "bun", label: "bun" },
];

const Label = ({ children, htmlFor }: { children: string; htmlFor?: string }) => (
  <label htmlFor={htmlFor} className="text-ink-muted text-[11px] font-semibold tracking-wide uppercase">
    {children}
  </label>
);

/** Waits before formatting the other combinations, so it never competes with a click. */
const PREFETCH_DELAY_MS = 300;

/**
 * Shows the generated code at once and swaps in the formatted version when the worker is done
 * (or straight away if that combination was formatted before).
 */
const useFormattedCode = (raw: string, enabled: boolean) => {
  const [, setVersion] = useState(0);
  const [failed, setFailed] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || getFormattedCode(raw) !== undefined) return;
    let cancelled = false;
    formatCode(raw)
      .then(() => {
        if (!cancelled) setVersion((version) => version + 1);
      })
      .catch((error: unknown) => {
        // Unformatted code is still valid code; keep showing it.
        console.error("Could not format generated code", error);
        if (!cancelled) setFailed(raw);
      });
    return () => {
      cancelled = true;
    };
  }, [raw, enabled]);

  const formatted = getFormattedCode(raw);
  return {
    code: formatted ?? raw,
    isPending: formatted === undefined && failed !== raw,
  };
};

const CodeTab = ({ fields, active }: { fields: FormField[]; active: boolean }) => {
  const [library, setLibrary] = useLocalStorageState<FormLibrary>(
    "form-builder:codegen-library",
    "rhf",
    oneOf("rhf", "formik", "tanstack"),
  );
  const [ui, setUi] = useLocalStorageState<UiKit>(
    "form-builder:codegen-ui",
    "tailwind",
    oneOf("tailwind", "mui"),
  );
  const [manager, setManager] = useLocalStorageState<PackageManager>(
    "form-builder:package-manager",
    "npm",
    oneOf("npm", "pnpm", "yarn", "bun"),
  );
  const [nameInput, setNameInput] = useLocalStorageState(
    "form-builder:component-name",
    "ContactForm",
    (value) => typeof value === "string",
  );
  const componentName = useDeferredValue(nameInput);

  // The options respond to the click at once; building and highlighting the code follows
  // at low priority instead of blocking the toggle.
  const deferredLibrary = useDeferredValue(library);
  const deferredUi = useDeferredValue(ui);

  const generated = useMemo(
    () =>
      generateFormCode(fields, {
        library: deferredLibrary,
        ui: deferredUi,
        componentName,
      }),
    [fields, deferredLibrary, deferredUi, componentName],
  );
  const { code, isPending } = useFormattedCode(generated.code, active);

  useEffect(() => warmFormatter(), []);

  // Once this combination is formatted, quietly format the others so switching is instant.
  useEffect(() => {
    if (!active || isPending) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      for (const lib of LIBRARIES) {
        for (const kit of UI_KITS) {
          if (cancelled) return;
          if (lib.value === deferredLibrary && kit.value === deferredUi) continue;
          const { code: raw } = generateFormCode(fields, {
            library: lib.value,
            ui: kit.value,
            componentName,
          });
          await formatCode(raw).catch(() => {});
        }
      }
    }, PREFETCH_DELAY_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [active, isPending, fields, deferredLibrary, deferredUi, componentName]);
  const install = installCommand(generated.dependencies, manager);
  const resolvedName = toComponentName(nameInput);

  return (
    <div className="flex flex-col gap-4">
      <section aria-label="Code options" className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Form library</Label>
          <SegmentedControl
            ariaLabel="Form library"
            size="sm"
            value={library}
            onChange={setLibrary}
            segments={LIBRARIES}
          />
          <p key={library} className="text-ink-muted animate-fade-up text-xs leading-5">
            {LIBRARY_NOTES[library]}
          </p>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>UI kit</Label>
            <SegmentedControl
              ariaLabel="UI kit"
              size="sm"
              value={ui}
              onChange={setUi}
              fullLabelFrom="14rem"
              segments={UI_KITS}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="codegen-component-name">Component name</Label>
            <input
              id="codegen-component-name"
              value={nameInput}
              onChange={(event) => setNameInput(event.target.value)}
              placeholder={DEFAULT_COMPONENT_NAME}
              spellCheck={false}
              autoComplete="off"
              className="border-line text-ink focus:border-plum focus:ring-plum/15 h-9 rounded-xl border bg-white px-3 font-mono text-xs transition-[border-color,box-shadow] outline-none focus:ring-4"
            />
            {resolvedName !== nameInput.trim() ? (
              <p className="text-ink-muted animate-fade-up text-[11px]">
                Will be exported as <code className="text-plum font-mono">{resolvedName}</code>
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section aria-label="Install dependencies" className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <Label>Install</Label>
          <SegmentedControl
            ariaLabel="Package manager"
            size="sm"
            value={manager}
            onChange={setManager}
            segments={MANAGERS}
            className="w-52"
          />
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-[#282c34] py-1 ps-3 pe-1">
          <TerminalRoundedIcon sx={{ fontSize: 16 }} className="shrink-0 text-white/40" />
          <code key={install} className="animate-fade-in min-w-0 flex-1 truncate font-mono text-xs text-[#98c379]">
            {install}
          </code>
          <CopyButton text={install} label="install command" tone="dark" />
        </div>
      </section>

      <CodePanel
        title={generated.filename}
        code={code}
        language="tsx"
        pending={isPending}
        actions={
          <DownloadButton
            label={`Download ${generated.filename}`}
            onClick={() => downloadText(generated.filename, code || generated.code, "text/typescript")}
          />
        }
      />
    </div>
  );
};

export default CodeTab;
