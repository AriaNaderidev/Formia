import { useState, type ReactNode } from "react";
import type { FieldSpec } from "@/features/form-schema";
import { CopyButton } from "@/ui/CopyButton";
import { SegmentedControl } from "@/ui/SegmentedControl";

type SubmissionViewProps = {
  data: Record<string, unknown>;
  specs: FieldSpec[];
};

/** Files can't be serialized, so they show up as their metadata. */
const toSerializable = (data: Record<string, unknown>) =>
  JSON.stringify(
    data,
    (_key, value) =>
      value instanceof File
        ? { name: value.name, size: value.size, type: value.type }
        : value,
    2,
  );

const Empty = () => <span className="text-ink-muted/60">—</span>;

const Pill = ({ children }: { children: ReactNode }) => (
  <span className="bg-plum/[0.07] text-plum inline-flex max-w-full items-center truncate rounded-md px-1.5 py-0.5 text-xs font-medium">
    {children}
  </span>
);

const renderValue = (spec: FieldSpec, value: unknown): ReactNode => {
  const labelOf = (option: string) =>
    spec.field.options?.find((item) => item.value === option)?.label ?? option;

  if (value === undefined || value === null || value === "") return <Empty />;

  if (typeof value === "boolean") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-sm font-medium ${
          value ? "text-emerald-600" : "text-ink-muted"
        }`}
      >
        <span
          className={`size-1.5 rounded-full ${value ? "bg-emerald-500" : "bg-ink-muted/40"}`}
        />
        {value ? "Yes" : "No"}
      </span>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return <Empty />;
    return (
      <span className="flex flex-wrap justify-end gap-1">
        {value.map((item, index) => (
          <Pill key={index}>
            {item instanceof File ? item.name : labelOf(String(item))}
          </Pill>
        ))}
      </span>
    );
  }

  if (spec.field.type === "color") {
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-sm">
        <span
          className="border-line size-4 rounded border"
          style={{ backgroundColor: String(value) }}
        />
        {String(value)}
      </span>
    );
  }

  if (spec.field.type === "rating") {
    return (
      <span className="text-base tracking-wider text-amber-500">
        {"★".repeat(Number(value))}
        <span className="text-ink-muted/30">
          {"★".repeat(Math.max(0, (spec.field.max ?? 5) - Number(value)))}
        </span>
      </span>
    );
  }

  if (spec.field.type === "password") {
    return (
      <span className="font-mono text-sm">
        {"•".repeat(Math.min(String(value).length, 12))}
      </span>
    );
  }

  const text = spec.field.options ? labelOf(String(value)) : String(value);
  return (
    <span
      className={`text-ink text-sm break-words ${typeof value === "number" ? "tabular-nums" : ""}`}
    >
      {text}
    </span>
  );
};

/** The body of the "Form submitted" dialog: the values as a table, or the raw JSON. */
export const SubmissionView = ({ data, specs }: SubmissionViewProps) => {
  const [view, setView] = useState<"table" | "json">("table");
  const json = toSerializable(data);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <SegmentedControl
          ariaLabel="Submitted data view"
          size="sm"
          value={view}
          onChange={setView}
          segments={[
            { value: "table", label: "Fields" },
            { value: "json", label: "JSON" },
          ]}
          className="w-44"
        />
        <CopyButton text={json} label="submitted JSON" showText />
      </div>

      <div
        key={view}
        className="animate-fade-up"
      >
        {view === "table" ? (
          <dl className="divide-line border-line divide-y rounded-xl border">
            {specs.map((spec) => (
              <div
                key={spec.name}
                className="flex items-start justify-between gap-3 px-4 py-3"
              >
                <dt className="min-w-0">
                  <span className="text-ink block text-sm font-medium break-words">
                    {spec.label}
                  </span>
                  <span className="text-ink-muted block font-mono text-xs break-all">
                    {spec.name}
                  </span>
                </dt>
                <dd className="max-w-[55%] min-w-0 text-end">
                  {renderValue(spec, data[spec.name])}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <pre className="bg-[#282c34] p-4 font-mono text-[13px] leading-relaxed overflow-x-auto rounded-xl text-[#abb2bf]">
            {json}
          </pre>
        )}
      </div>
    </div>
  );
};
