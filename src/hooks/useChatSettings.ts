import { useEffect, useState } from 'react';
import { DEFAULT_CHAT_SETTINGS, SETTINGS_STORAGE_KEY } from '../config';
import type { ChatSettings } from '../types/settings';

function normalizeChatSettings(value: Partial<ChatSettings> | null | undefined): ChatSettings {
  return {
    apiBaseUrl: value?.apiBaseUrl?.trim() || DEFAULT_CHAT_SETTINGS.apiBaseUrl,
    chatPath: value?.chatPath?.trim() || DEFAULT_CHAT_SETTINGS.chatPath,
    assistantName: value?.assistantName?.trim() || DEFAULT_CHAT_SETTINGS.assistantName,
    autoExpandReasoning:
      value?.autoExpandReasoning ?? DEFAULT_CHAT_SETTINGS.autoExpandReasoning,
  };
}

export function useChatSettings() {
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_CHAT_SETTINGS);

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!storedValue) {
        return;
      }

      const parsedValue = JSON.parse(storedValue) as Partial<ChatSettings>;
      setSettings(normalizeChatSettings(parsedValue));
    } catch {
      setSettings(DEFAULT_CHAT_SETTINGS);
    }
  }, []);

  function updateSettings(nextSettings: ChatSettings) {
    const normalizedSettings = normalizeChatSettings(nextSettings);
    setSettings(normalizedSettings);
    window.localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify(normalizedSettings),
    );
  }

  function resetSettings() {
    setSettings(DEFAULT_CHAT_SETTINGS);
    window.localStorage.removeItem(SETTINGS_STORAGE_KEY);
  }

  return {
    settings,
    updateSettings,
    resetSettings,
  };
}
