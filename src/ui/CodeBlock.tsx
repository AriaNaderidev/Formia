import { memo } from "react";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

// PrismLight + three languages instead of the full Prism bundle (~300 languages).
SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("tsx", tsx);

export type CodeLanguage = "bash" | "json" | "tsx";

type CodeBlockProps = {
  code: string;
  language: CodeLanguage;
  showLineNumbers?: boolean;
};

const CUSTOM_STYLE = {
  margin: 0,
  padding: "1rem 1.25rem",
  background: "transparent",
  fontSize: "0.8125rem",
  lineHeight: 1.65,
};

const CODE_TAG_PROPS = {
  style: {
    fontFamily:
      '"JetBrains Mono", "Fira Code", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  },
};

const LINE_NUMBER_STYLE = {
  minWidth: "2.25em",
  paddingRight: "1.25em",
  color: "rgba(255,255,255,0.22)",
  userSelect: "none" as const,
};

/** Highlighting is the expensive part, so it only re-runs when the code changes. */
export const CodeBlock = memo(function CodeBlock({
  code,
  language,
  showLineNumbers = false,
}: CodeBlockProps) {
  return (
    <SyntaxHighlighter
      language={language}
      style={oneDark}
      customStyle={CUSTOM_STYLE}
      codeTagProps={CODE_TAG_PROPS}
      showLineNumbers={showLineNumbers}
      lineNumberStyle={LINE_NUMBER_STYLE}
    >
      {code}
    </SyntaxHighlighter>
  );
});
