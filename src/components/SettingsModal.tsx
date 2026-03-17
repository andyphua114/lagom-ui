import { useEffect, useState } from 'react';
import { DEFAULT_CHAT_SETTINGS } from '../config';
import type { ChatSettings } from '../types/settings';

interface SettingsModalProps {
  isOpen: boolean;
  settings: ChatSettings;
  onClose: () => void;
  onSave: (settings: ChatSettings) => void;
  onReset: () => void;
}

export function SettingsModal({
  isOpen,
  settings,
  onClose,
  onSave,
  onReset,
}: SettingsModalProps) {
  const [draftSettings, setDraftSettings] = useState(settings);

  useEffect(() => {
    if (isOpen) {
      setDraftSettings(settings);
    }
  }, [isOpen, settings]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4 py-8 backdrop-blur-sm">
      <div
        className="absolute inset-0"
        aria-hidden="true"
        onClick={onClose}
      />

      <section className="relative z-10 w-full max-w-lg rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Settings
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Configure your chat workspace
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Adjust the backend connection and a couple of UI defaults without
              adding extra app complexity.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
            aria-label="Close settings"
          >
            ×
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">API base URL</span>
            <input
              type="text"
              value={draftSettings.apiBaseUrl}
              onChange={(event) =>
                setDraftSettings((current) => ({
                  ...current,
                  apiBaseUrl: event.target.value,
                }))
              }
              placeholder={DEFAULT_CHAT_SETTINGS.apiBaseUrl}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:bg-white"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Chat endpoint path</span>
            <input
              type="text"
              value={draftSettings.chatPath}
              onChange={(event) =>
                setDraftSettings((current) => ({
                  ...current,
                  chatPath: event.target.value,
                }))
              }
              placeholder={DEFAULT_CHAT_SETTINGS.chatPath}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:bg-white"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Assistant name</span>
            <input
              type="text"
              value={draftSettings.assistantName}
              onChange={(event) =>
                setDraftSettings((current) => ({
                  ...current,
                  assistantName: event.target.value,
                }))
              }
              placeholder={DEFAULT_CHAT_SETTINGS.assistantName}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:bg-white"
            />
          </label>

          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <input
              type="checkbox"
              checked={draftSettings.autoExpandReasoning}
              onChange={(event) =>
                setDraftSettings((current) => ({
                  ...current,
                  autoExpandReasoning: event.target.checked,
                }))
              }
              className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-300"
            />
            <span>
              <span className="block text-sm font-medium text-slate-700">
                Auto-expand reasoning
              </span>
              <span className="mt-1 block text-sm leading-6 text-slate-500">
                Keep it off for a cleaner ChatGPT-like flow, or enable it if you
                inspect chain-of-thought style details often.
              </span>
            </span>
          </label>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setDraftSettings(DEFAULT_CHAT_SETTINGS);
              onReset();
            }}
            className="rounded-full px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Reset defaults
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onSave(draftSettings);
                onClose();
              }}
              className="rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Save changes
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
