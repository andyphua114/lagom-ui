import type { ChatMessage } from '../types/chat';
import { MarkdownContent } from './MarkdownContent';
import { ReasoningDropdown } from './ReasoningDropdown';

interface MessageBubbleProps {
  message: ChatMessage;
  defaultExpandReasoning?: boolean;
}

export function MessageBubble({
  message,
  defaultExpandReasoning = false,
}: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <article
        className={[
          'max-w-[min(85%,44rem)] rounded-[28px] border px-5 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]',
          isUser
            ? 'border-slate-900/5 bg-slate-900 text-white'
            : 'border-white/70 bg-white/95 text-slate-800',
        ].join(' ')}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap text-[15px] leading-7">{message.content}</p>
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
