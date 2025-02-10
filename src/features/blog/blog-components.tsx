import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import atomOneDark from "react-syntax-highlighter/dist/cjs/styles/prism/material-dark";

export const Codeblock = ({ children, language }) => {
  return (
    <div className="w-full overflow-x-auto">
      <SyntaxHighlighter
        code={children || ""}
        language={language || "jsx"}
        style={atomOneDark}
        wrapLongLines
        showInlineLineNumbers={true}
        lineProps={{
          style: { wordBreak: "break-all", whiteSpace: "pre-wrap" },
        }}
        wrapLines={true}
      />
    </div>
  );
};
