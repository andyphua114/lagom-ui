import { useState } from "react";
import { useChatSettings } from "../hooks/useChatSettings";
import { useAutoScroll } from "../hooks/useAutoScroll";
import { sendMessage } from "../services/api";
import type { ChatMessage } from "../types/chat";
import { ChatInput } from "./ChatInput";
import { MessageBubble } from "./MessageBubble";
import { SettingsModal } from "./SettingsModal";

const initialAssistantMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "",
};

function createMessageId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function ChatPage() {
  const { settings, updateSettings, resetSettings } = useChatSettings();
  const [messages, setMessages] = useState<ChatMessage[]>([
    initialAssistantMessage,
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const endRef = useAutoScroll([messages, loading, error]);

  async function handleSendMessage(message: string) {
    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: message,
    };

    setError(null);
    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setLoading(true);

    try {
      const response = await sendMessage(message, settings);

      const assistantMessage: ChatMessage = {
        id: createMessageId(),
        role: "assistant",
        content: response.answer,
        reasoning: response.reasoning,
      };

      setMessages((currentMessages) => [...currentMessages, assistantMessage]);
    } catch (caughtError) {
      const messageText =
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong while contacting the assistant.";

      setError(messageText);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col">
      <section className="flex-1 overflow-y-auto px-4 pb-40 pt-8 sm:px-6 sm:pt-10">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          <header className="mx-auto w-full max-w-3xl px-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-slate-500 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
                  {settings.assistantName}
                </div>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                  Ask a question, get the answer, and expand reasoning only when
                  you want the details.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition hover:border-slate-200 hover:text-slate-900"
              >
                <span className="text-base leading-none">+</span>
                Settings
              </button>
            </div>
          </header>

          <div className="mx-auto flex w-full max-w-3xl flex-col gap-10">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                defaultExpandReasoning={settings.autoExpandReasoning}
              />
            ))}

            {loading ? (
              <div className="flex justify-start">
                <div className="rounded-full border border-white/80 bg-white/90 px-4 py-2 text-sm text-slate-500 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
                  <span className="animate-loading">Thinking...</span>
                </div>
              </div>
            ) : null}

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <div ref={endRef} />
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0">
        <ChatInput disabled={loading} onSend={handleSendMessage} />
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onSave={updateSettings}
        onReset={resetSettings}
      />
    </main>
  );
}
