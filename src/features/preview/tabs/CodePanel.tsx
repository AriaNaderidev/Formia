import type { ReactNode } from "react";
import { CodeBlock, type CodeLanguage } from "@/ui/CodeBlock";
import { CopyButton } from "@/ui/CopyButton";

type CodePanelProps = {
  title: ReactNode;
  code: string;
  language: CodeLanguage;
  actions?: ReactNode;
  /** Shows a shimmer while new code is being prepared. */
  pending?: boolean;
  showLineNumbers?: boolean;
};

/** A dark code card with a title bar, copy button and optional extra actions. */
export const CodePanel = ({
  title,
  code,
  language,
  actions,
  pending = false,
  showLineNumbers = true,
}: CodePanelProps) => (
  // Dark surface: the global plum scrollbar thumb would vanish, so swap its colours (see index.css).
  <div className="relative overflow-hidden rounded-xl bg-[#282c34] shadow-[0_8px_24px_-12px_rgba(42,22,51,0.5)] [--scrollbar-thumb-hover:rgba(255,255,255,0.4)] [--scrollbar-thumb:rgba(255,255,255,0.18)]">
    <div className="flex items-center justify-between gap-2 border-b border-white/[0.07] py-1.5 ps-3 pe-1.5">
      <div className="flex min-w-0 items-center gap-2 text-xs text-white/60">
        <span aria-hidden className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]/80" />
          <span className="size-2.5 rounded-full bg-[#febc2e]/80" />
          <span className="size-2.5 rounded-full bg-[#28c840]/80" />
        </span>
        <span className="truncate font-mono">{title}</span>
      </div>
      <div className="flex shrink-0 items-center">
        {actions}
        <CopyButton text={code} label="code" tone="dark" showText />
      </div>
    </div>

    <div
      className={`overflow-x-auto transition-opacity duration-200 ${pending ? "opacity-60" : "opacity-100"}`}
      aria-busy={pending}
    >
      <CodeBlock code={code} language={language} showLineNumbers={showLineNumbers} />
    </div>

    {pending ? (
      <span
        aria-hidden
        className="animate-shimmer pointer-events-none absolute inset-x-0 top-[41px] h-0.5 bg-gradient-to-r from-transparent via-[#c678dd] to-transparent"
      />
    ) : null}
  </div>
);
