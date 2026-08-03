"use client";

import { useState, useRef, useCallback } from "react";
import {
  Bold,
  Italic,
  List,
  Link2,
  Paperclip,
  Image as ImageIcon,
  Send,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

import { TOOLBAR_ACTIONS, TOOLBAR_ATTACHMENTS } from "@/src/constants/appConfig";

export function TicketReplyEditor() {
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(async () => {
    if (!body.trim()) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 800));
    setSending(false);
    setBody("");
    toast.success("Your message has been sent successfully.");
    textareaRef.current?.focus();
  }, [body]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-md">
      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b border-outline-variant bg-surface-container-low p-2">
        {TOOLBAR_ACTIONS.map(({ icon: Icon, label }) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            title={label}
            className="rounded p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high active:scale-95"
          >
            <Icon aria-hidden className="size-4" strokeWidth={2} />
          </button>
        ))}

        {/* Divider */}
        <div className="mx-1 h-5 w-px bg-outline-variant" aria-hidden />

        {TOOLBAR_ATTACHMENTS.map(({ icon: Icon, label }) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            title={label}
            className="rounded p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high active:scale-95"
          >
            <Icon aria-hidden className="size-4" strokeWidth={2} />
          </button>
        ))}
      </div>

      {/* Text area */}
      <textarea
        ref={textareaRef}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your reply here…"
        rows={5}
        className="w-full resize-none border-none bg-transparent p-4 text-body-md placeholder:text-outline outline-none focus:ring-0"
        aria-label="Reply message"
      />

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-outline-variant bg-surface-container-lowest px-4 py-3">
        <span className="hidden text-label-md text-on-surface-variant sm:block">
          Press{" "}
          <kbd className="rounded border border-outline-variant bg-surface-container-low px-1 py-0.5 font-mono text-[11px]">
            Ctrl
          </kbd>{" "}
          +{" "}
          <kbd className="rounded border border-outline-variant bg-surface-container-low px-1 py-0.5 font-mono text-[11px]">
            Enter
          </kbd>{" "}
          to send
        </span>

        <button
          type="button"
          onClick={handleSend}
          disabled={sending || !body.trim()}
          className="ml-auto flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-body-md font-semibold text-on-primary shadow-sm transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? (
            <>
              <Loader2 aria-hidden className="size-4 animate-spin" />
              Sending…
            </>
          ) : (
            <>
              Send Message
              <Send aria-hidden className="size-4" strokeWidth={2} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
