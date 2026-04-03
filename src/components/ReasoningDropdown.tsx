import { useEffect, useState } from "react";
import { MarkdownContent } from "./MarkdownContent";

interface ReasoningDropdownProps {
  reasoning: string;
  defaultOpen?: boolean;
}

export function ReasoningDropdown({
  reasoning,
  defaultOpen = false,
}: ReasoningDropdownProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  useEffect(() => {
    setIsOpen(defaultOpen);
  }, [defaultOpen]);

  return (
    <div className="mt-3 rounded-2xl border border-slate-200/80 bg-slate-50/90">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
      >
        <span className="text-xs">
          {isOpen ? "Hide reasoning" : "Show reasoning"}
        </span>
        <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
          {isOpen ? "Open" : "Hidden"}
        </span>
      </button>

      {isOpen ? (
        <div className="border-t border-slate-200/80 px-4 py-3 text-sm leading-6 text-slate-500">
          <MarkdownContent content={reasoning} muted />
        </div>
      ) : null}
    </div>
  );
}
