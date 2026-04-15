import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { useAutoScroll } from "../hooks/useAutoScroll";
import { sendMessage } from "../services/api";
import type { ChatMessage } from "../types/chat";
import type { ChatSettings } from "../types/settings";
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

function createSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface ChatPageProps {
  resetSettings: () => void;
  settings: ChatSettings;
  updateSettings: (settings: ChatSettings) => void;
}

export function ChatPage({
  resetSettings,
  settings,
  updateSettings,
}: ChatPageProps) {
  const { authenticatedFetch, logout, user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    initialAssistantMessage,
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const endRef = useAutoScroll([messages, loading, error]);

  useEffect(() => {
    setSessionId(createSessionId());
  }, []);

  function handleNewChat() {
    setMessages([initialAssistantMessage]);
    setError(null);
    setSessionId(createSessionId());
  }

  async function handleSendMessage(message: string) {
    const assistantMessageId = createMessageId();
    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: message,
    };
    const assistantPlaceholder: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      pending: true,
    };

    setError(null);
    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
      assistantPlaceholder,
    ]);
    setLoading(true);

    try {
      const response = await sendMessage(
        message,
        settings,
        sessionId,
        authenticatedFetch,
        {
          onAnswerDelta(delta) {
            setMessages((currentMessages) =>
              currentMessages.map((currentMessage) =>
                currentMessage.id === assistantMessageId
                  ? {
                      ...currentMessage,
                      content: currentMessage.content + delta,
                      status: undefined,
                    }
                  : currentMessage,
              ),
            );
          },
          onStatusUpdate(status) {
            setMessages((currentMessages) =>
              currentMessages.map((currentMessage) =>
                currentMessage.id === assistantMessageId
                  ? { ...currentMessage, status }
                  : currentMessage,
              ),
            );
          },
        },
      );

      setMessages((currentMessages) =>
        currentMessages.map((currentMessage) =>
          currentMessage.id === assistantMessageId
            ? {
                ...currentMessage,
                content: response.answer,
                reasoning: response.reasoning,
                pending: false,
              }
            : currentMessage,
        ),
      );
    } catch (caughtError) {
      const messageText =
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong while contacting the assistant.";

      setMessages((currentMessages) =>
        currentMessages
          .filter(
            (currentMessage) =>
              currentMessage.id !== assistantMessageId ||
              currentMessage.content.length > 0,
          )
          .map((currentMessage) =>
            currentMessage.id === assistantMessageId
              ? { ...currentMessage, pending: false }
              : currentMessage,
          ),
      );
      setError(messageText);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col">
      <div className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/75 px-2 py-3 backdrop-blur-xl sm:px-15">
        <header className="mx-auto w-full">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="font-bold font-body text-xl relative -top-1">
                {settings.assistantName}
              </div>
              <button
                type="button"
                onClick={handleNewChat}
                className="relative -top-1 flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 font-bold text-white shadow-sm transition-colors hover:bg-slate-800 active:scale-95 duration-200"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 14 }}
                >
                  add
                </span>
                <span className="text-[14px]">New Chat</span>
              </button>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="font-bold font-body text-sm text-slate-900 dark:text-slate-100 relative -top-1">
                {user?.username ?? user?.id}
              </div>

              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors active:scale-95 duration-200"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  settings
                </span>
              </button>

              <button
                type="button"
                onClick={() => void logout()}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors active:scale-95 duration-200"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  logout
                </span>
              </button>
            </div>
          </div>
        </header>
      </div>

      <section className="flex-1 overflow-y-auto px-4 pb-40 pt-8 sm:px-6">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-10">
            {messages.length === 1 && messages[0].id === "welcome" ? (
              <h1 className="text-center text-5xl font-extrabold font-headline tracking-tighter text-on-surface">
                Where should we start?
              </h1>
            ) : null}
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                defaultExpandReasoning={settings.autoExpandReasoning}
              />
            ))}

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <div ref={endRef} />
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200/80 bg-white px-2 py-1 backdrop-blur-xl">
        <ChatInput disabled={loading} onSend={handleSendMessage} />
        <div className="mx-auto max-w-4xl text-center">
          <p className="pb-2 text-xs text-slate-600">
            {settings.assistantName} is AI and can make mistakes. Please
            double-check responses.
          </p>
        </div>
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
