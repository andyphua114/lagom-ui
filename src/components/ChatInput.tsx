import { useState } from 'react';

interface ChatInputProps {
  disabled?: boolean;
  onSend: (message: string) => Promise<void> | void;
}

export function ChatInput({ disabled = false, onSend }: ChatInputProps) {
  const [value, setValue] = useState('');

  async function handleSubmit() {
    const message = value.trim();
    if (!message || disabled) {
      return;
    }

    setValue('');
    await onSend(message);
  }

  return (
    <div className="border-t border-slate-200/80 bg-white/75 px-4 py-4 backdrop-blur-xl sm:px-6">
      <div className="mx-auto flex max-w-3xl items-end gap-3 rounded-[28px] border border-slate-200 bg-white p-3 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <textarea
          rows={1}
          value={value}
          disabled={disabled}
          placeholder="Ask anything..."
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              void handleSubmit();
            }
          }}
          className="max-h-40 min-h-[52px] flex-1 resize-none border-0 bg-transparent px-3 py-3 text-[15px] text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
        />
        <button
          type="button"
          disabled={disabled || !value.trim()}
          onClick={() => void handleSubmit()}
          className="inline-flex h-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Send
        </button>
      </div>
    </div>
  );
}
