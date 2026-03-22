import type { ChatSettings } from "./types/settings";

export const DEFAULT_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
export const CAN_EDIT_API_BASE_URL = import.meta.env.DEV;

export const SETTINGS_STORAGE_KEY = "lagom-ui-chat-settings";
export const LOGIN_PATH = "/auth/login";
export const REFRESH_PATH = "/auth/refresh";
export const LOGOUT_PATH = "/auth/logout";

export const DEFAULT_CHAT_SETTINGS: ChatSettings = {
  apiBaseUrl: DEFAULT_API_BASE_URL,
  chatPath: "/chat",
  assistantName: "Lagom UI",
  autoExpandReasoning: false,
};

export function normalizeApiBaseUrl(value: string | null | undefined) {
  if (!CAN_EDIT_API_BASE_URL) {
    return DEFAULT_API_BASE_URL;
  }

  return value?.trim() || DEFAULT_API_BASE_URL;
}

export function normalizeApiPath(
  value: string | null | undefined,
  fallback: string,
) {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return fallback;
  }

  return trimmedValue.startsWith("/") ? trimmedValue : `/${trimmedValue}`;
}
