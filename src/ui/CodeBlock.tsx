import { memo, useMemo } from "react";
import type { RootContent } from "hast";
import { refractor } from "refractor/core";
import bash from "refractor/bash";
import json from "refractor/json";
import tsx from "refractor/tsx";

// The core build plus three languages instead of all of Prism's grammars.
refractor.register(bash);
refractor.register(json);
refractor.register(tsx);

export type CodeLanguage = "bash" | "json" | "tsx";

type CodeBlockProps = {
  code: string;
  language: CodeLanguage;
  showLineNumbers?: boolean;
};

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const toHtml = (nodes: RootContent[]): string =>
  nodes
    .map((node) => {
      if (node.type === "text") return escapeHtml(node.value);
      if (node.type !== "element") return "";
      const classes = node.properties.className;
      const attr = Array.isArray(classes) ? ` class="${classes.join(" ")}"` : "";
      return `<${node.tagName}${attr}>${toHtml(node.children)}</${node.tagName}>`;
    })
    .join("");

/**
 * Tokenizing is cheap (about 10 ms for a whole form); what made switching slow was building
 * a React element with its own inline style for every token. The tokens are rendered as one
 * HTML string instead and coloured by the `.code-block` rules in index.css. Prism escapes
 * the code, and `escapeHtml` covers the text nodes, so only generated markup is injected.
 */
export const CodeBlock = memo(function CodeBlock({
  code,
  language,
  showLineNumbers = false,
}: CodeBlockProps) {
  const html = useMemo(() => toHtml(refractor.highlight(code, language).children), [code, language]);
  const lineNumbers = useMemo(() => {
    if (!showLineNumbers) return "";
    return Array.from({ length: code.split("\n").length }, (_, i) => i + 1).join("\n");
  }, [code, showLineNumbers]);

  return (
    <div className="code-block flex w-max min-w-full">
      {showLineNumbers ? (
        <pre aria-hidden className="code-block-lines">
          {lineNumbers}
        </pre>
      ) : null}
      <pre className="code-block-pre">
        <code className={`language-${language}`} dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
});
