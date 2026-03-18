import type { ChatMessage } from "../types/chat";
import { MarkdownContent } from "./MarkdownContent";
import { ReasoningDropdown } from "./ReasoningDropdown";

interface MessageBubbleProps {
  message: ChatMessage;
  defaultExpandReasoning?: boolean;
}

export function MessageBubble({
  message,
  defaultExpandReasoning = false,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isPendingAssistant = !isUser && message.pending;

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <article // max-w-[min(85%,44rem)] rounded-[28px]
        className={[
          "max-w-[min(85%,44rem)] rounded-[28px]",
          isUser
            ? "border px-5 py-2 shadow-[0_12px_30px_rgba(15,23,42,0.06)] border-slate-900/5 bg-slate-900 text-white"
            : "max-w-[min(85%,44rem)] rounded-[28px]", // 'border-white/70 bg-white/95 text-slate-800'
        ].join(" ")}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap text-[15px] leading-7">
            {message.content}
          </p>
        ) : isPendingAssistant && !message.content ? (
          <div className="rounded-full border border-white/80 bg-white/90 px-4 py-2 text-sm text-slate-500 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
            <span className="animate-loading">Thinking...</span>
          </div>
        ) : (
          <MarkdownContent content={message.content} />
        )}
        {!isUser && message.reasoning ? (
          <ReasoningDropdown
            reasoning={message.reasoning}
            defaultOpen={defaultExpandReasoning}
          />
        ) : null}
      </article>
    </div>
  );
}
