import type { ChatSettings } from "./types/settings";

export const DEFAULT_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export const SETTINGS_STORAGE_KEY = "lagom-ui-chat-settings";

export const DEFAULT_CHAT_SETTINGS: ChatSettings = {
  apiBaseUrl: DEFAULT_API_BASE_URL,
  chatPath: "/chat",
  assistantName: "Lagom UI",
  autoExpandReasoning: false,
};
