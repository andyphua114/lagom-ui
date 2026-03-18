import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownContentProps {
  content: string;
  muted?: boolean;
}

export function MarkdownContent({
  content,
  muted = false,
}: MarkdownContentProps) {
  const proseTone = muted ? "text-slate-500" : "text-inherit";

  return (
    <div
      className={[
        "min-w-0 w-full",
        "prose prose-slate max-w-none text-[15px] leading-7",
        "prose-p:my-0 prose-headings:mb-3 prose-headings:mt-0 prose-headings:font-semibold",
        "prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg",
        "prose-pre:my-4 prose-pre:max-w-full prose-pre:overflow-x-auto prose-pre:whitespace-pre prose-pre:rounded-2xl prose-pre:bg-slate-950 prose-pre:px-4 prose-pre:py-3 prose-pre:text-slate-100",
        "prose-code:rounded prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.9em] prose-code:text-slate-800",
        "prose-code:before:content-none prose-code:after:content-none",
        "prose-pre:font-mono prose-pre:text-[13px] prose-pre:leading-6",
        "prose-strong:text-inherit prose-a:text-blue-600 hover:prose-a:text-blue-500",
        "prose-ul:my-3 prose-ol:my-3 prose-li:my-1 prose-blockquote:border-slate-300 prose-blockquote:text-inherit",
        proseTone,
      ].join(" ")}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre({ children }) {
            return (
              <div className="my-4 max-w-full overflow-x-auto rounded-2xl bg-slate-950">
                <pre className="m-0 w-max min-w-full whitespace-pre px-4 py-3 text-slate-100">
                  {children}
                </pre>
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
