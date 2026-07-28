"use client";

import { useState } from "react";
import { X, HelpCircle, Check } from "lucide-react";

interface QuickReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string;
}

const CANNED_RESPONSES = [
  {
    label: "Password Reset",
    text: "Hi there, I can help you reset your password. Please click the link sent to your email to proceed.",
  },
  {
    label: "Technical Issue",
    text: "Hello, we are investigating the technical issue you reported. Our engineering team is on it.",
  },
  {
    label: "Closing Ticket",
    text: "Thank you for your patience. We have resolved the issue and are now closing this ticket.",
  },
  {
    label: "Escalation",
    text: "I am escalating this ticket to our Senior Infrastructure team for further review.",
  },
];

export function QuickReplyModal({
  isOpen,
  onClose,
  ticketId,
}: QuickReplyModalProps) {
  const [replyText, setReplyText] = useState("");
  const [selectedCanned, setSelectedCanned] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCannedSelect = (label: string, text: string) => {
    setSelectedCanned(label);
    setReplyText(text);
  };

  const handleClear = () => {
    setReplyText("");
    setSelectedCanned(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-6 py-4">
          <div>
            <span className="font-code font-bold text-primary">
              #{ticketId}
            </span>
            <h3 className="text-body-lg font-bold text-on-surface">
              Critical Database Latency in EU-West-1 Instance
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-surface-container-high"
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-4 p-6">
          {/* Last Message Preview */}
          <div className="rounded-lg border border-outline-variant bg-surface-container-low p-3">
            <p className="mb-1 text-label-md font-bold uppercase text-on-surface-variant">
              Last Message
            </p>
            <p className="text-body-md italic text-on-surface">
              "The database is timing out every 30 seconds. We need an immediate
              fix as this is affecting our production environment in Europe."
            </p>
          </div>

          {/* Canned Responses */}
          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-1.5">
              <label className="text-label-md font-bold uppercase text-on-surface-variant">
                Canned Responses
              </label>
              <HelpCircle
                aria-hidden
                className="size-4 cursor-help text-outline"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {CANNED_RESPONSES.map((canned) => {
                const isSelected = selectedCanned === canned.label;
                return (
                  <button
                    key={canned.label}
                    onClick={() => handleCannedSelect(canned.label, canned.text)}
                    className={`flex items-center rounded-xl border px-3 py-1.5 text-label-md transition-all active:scale-95 ${
                      isSelected
                        ? "border-blue-700 bg-blue-600 text-white"
                        : "border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100"
                    }`}
                  >
                    {isSelected && (
                      <Check aria-hidden className="mr-1 size-3.5" />
                    )}
                    {canned.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reply Area */}
          <div className="space-y-2">
            <div className="mb-1 flex items-center justify-between">
              <label className="text-label-md font-bold uppercase text-on-surface-variant">
                Your Reply
              </label>
              {replyText && (
                <button
                  onClick={handleClear}
                  className="text-[10px] font-bold uppercase text-error hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            <textarea
              value={replyText}
              onChange={(e) => {
                setReplyText(e.target.value);
                if (selectedCanned) setSelectedCanned(null);
              }}
              className="h-32 w-full resize-none rounded-lg border border-outline-variant bg-surface p-3 text-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Type your response here..."
            />
          </div>

          {/* Templates */}
          <div className="space-y-2">
            <p className="text-label-md font-bold uppercase text-on-surface-variant">
              Quick Templates
            </p>
            <div className="flex flex-wrap gap-2">
              <button className="rounded-full border border-outline-variant bg-surface-container px-3 py-1.5 text-label-md transition-colors hover:bg-surface-container-high">
                Request Info
              </button>
              <button className="rounded-full border border-outline-variant bg-surface-container px-3 py-1.5 text-label-md transition-colors hover:bg-surface-container-high">
                Issue Resolved
              </button>
              <button className="rounded-full border border-outline-variant bg-surface-container px-3 py-1.5 text-label-md transition-colors hover:bg-surface-container-high">
                Escalating
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 border-t border-outline-variant bg-surface-container-low px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-label-md font-bold text-on-surface-variant transition-colors hover:bg-surface-container-high"
          >
            Cancel
          </button>
          <button className="rounded-lg bg-primary px-6 py-2 text-label-md font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:bg-surface-tint active:scale-95">
            Send Reply
          </button>
        </div>
      </div>
    </div>
  );
}
