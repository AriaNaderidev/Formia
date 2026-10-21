import { HiOutlineClipboardCopy } from "react-icons/hi";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

type CodeBlockProps = {
  value: unknown;
};

export const CodeBlock = ({ value }: CodeBlockProps) => {
  const json = JSON.stringify(value, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(json);
    } catch (error) {
      console.error(`Failed to copy: ${error}`);
    }
  };

  return (
    <div className="flex h-full flex-col items-end overflow-x-auto overflow-y-scroll rounded">
      <button
        type="button"
        className="h-[25px] w-[25px] cursor-pointer text-2xl"
        onClick={handleCopy}
        aria-label="Copy JSON"
      >
        <HiOutlineClipboardCopy />
      </button>
      <span className="h-full w-full">
        <SyntaxHighlighter language="json" style={oneDark}>
          {json}
        </SyntaxHighlighter>
      </span>
    </div>
  );
};