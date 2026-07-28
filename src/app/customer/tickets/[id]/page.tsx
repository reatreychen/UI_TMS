"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { TopNav } from "@/src/components/portal/TopNav";
import { PortalFooter } from "@/src/components/portal/PortalFooter";

// ── Static mock data ──────────────────────────────────────────────────────────
const TICKET = {
  id: "#TMS-1024",
  subject: "Login Issue",
  status: "IN PROGRESS",
  createdAt: "Oct 24, 2023",
  assignee: "Sarah Jenkins",
  priority: "High",
  category: "Authentication",
  slaDue: "4h 12m",
};

type MessageType = "customer" | "agent" | "event";
interface Message {
  type: MessageType;
  text?: string;
  agentName?: string;
  time?: string;
  eventText?: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    type: "customer",
    text: "Hi support team, I'm unable to log in to my dashboard since this morning. I keep getting a \"403 Forbidden\" error after entering my credentials. I've already tried clearing my browser cache.",
    time: "10:45 AM",
  },
  {
    type: "agent",
    agentName: "Sarah J. (Agent)",
    text: "Hello! I'm sorry to hear you're having trouble. I've checked our logs and it seems your account was temporarily flagged due to multiple failed login attempts from a new IP address. I'm looking into your session history now to verify.",
    time: "11:02 AM",
  },
  {
    type: "event",
    eventText: "Ticket reassigned to Security Team by Sarah J.",
  },
  {
    type: "agent",
    agentName: "Sarah J. (Agent)",
    text: "Could you please provide a screenshot of the exact error page you're seeing? This will help us confirm if it's a global firewall block or a specific user-level restriction.",
    time: "11:15 AM",
  },
];

const ACTIVITY_LOG = [
  { label: "Ticket", action: "Reassigned", time: "11:05 AM by Sarah J.", dot: "bg-primary" },
  { label: "Status changed to", action: "In Progress", time: "10:55 AM", dot: "bg-outline-variant" },
  { label: "Ticket", action: "Created", time: "10:45 AM by Customer", dot: "bg-outline-variant" },
];

// ── Ticket Detail Page ────────────────────────────────────────────────────────
export default function TicketDetailPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [reply, setReply] = useState("");
  const [sent, setSent] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!reply.trim()) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [
      ...prev,
      { type: "customer", text: reply.trim(), time },
    ]);
    setReply("");
    setSent(true);
    setTimeout(() => setSent(false), 2500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-on-surface font-body-md">
      <TopNav activePage="tickets" />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-container-margin py-8 flex flex-col md:flex-row gap-gutter">

        {/* ── Left: Conversation Area ─────────────────────────── */}
        <div className="flex-1 flex flex-col gap-stack-md min-w-0">

          {/* Ticket Header */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-md flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-label-md font-label-md px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded-full">
                  {TICKET.status}
                </span>
                <span className="text-label-md text-on-surface-variant">
                  Created {TICKET.createdAt}
                </span>
              </div>
              <h1 className="font-headline-md text-headline-md text-on-surface">
                {TICKET.id} - {TICKET.subject}
              </h1>
            </div>
            <div className="flex gap-2">
              <Link
                href="/customer/my-tickets"
                className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg font-body-md font-medium hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                Back
              </Link>
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg font-body-md font-medium hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
                Close Ticket
              </button>
            </div>
          </div>

          {/* Timeline */}
          <div className="flex-1 space-y-stack-md overflow-y-auto custom-scrollbar pr-1">
            {messages.map((msg, i) => {
              if (msg.type === "event") {
                return (
                  <div key={i} className="flex justify-center my-4">
                    <div className="bg-surface-container-low px-4 py-1 rounded-full border border-outline-variant flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant">info</span>
                      <span
                        className="text-label-md text-on-surface-variant"
                        dangerouslySetInnerHTML={{ __html: (msg.eventText ?? "").replace(/Security Team|Sarah J\./g, (m) => `<strong>${m}</strong>`) }}
                      />
                    </div>
                  </div>
                );
              }
              if (msg.type === "customer") {
                return (
                  <div key={i} className="flex flex-col items-end">
                    <div className="max-w-[85%] bg-primary-container text-on-primary-container p-4 rounded-xl rounded-br-sm shadow-sm">
                      <p className="font-body-md text-body-md">{msg.text}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-label-md text-on-surface-variant px-1">
                      <span>{msg.time}</span>
                      <span className="material-symbols-outlined text-[14px] [font-variation-settings:'FILL'_1]">done_all</span>
                    </div>
                  </div>
                );
              }
              return (
                <div key={i} className="flex flex-col items-start">
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <div className="w-6 h-6 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center">
                      <span className="material-symbols-outlined text-[14px] text-on-surface-variant">support_agent</span>
                    </div>
                    <span className="text-label-md font-bold text-on-surface">{msg.agentName}</span>
                  </div>
                  <div className="max-w-[85%] bg-surface-container-high text-on-surface p-4 rounded-xl rounded-bl-sm border border-outline-variant shadow-sm">
                    <p className="font-body-md text-body-md">{msg.text}</p>
                  </div>
                  <div className="mt-1 text-label-md text-on-surface-variant px-1">{msg.time}</div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Reply Editor */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-md mt-4">
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b border-outline-variant bg-surface-container-low">
              {["format_bold", "format_italic", "format_list_bulleted", "link"].map((icon) => (
                <button
                  key={icon}
                  type="button"
                  className="material-symbols-outlined p-1.5 hover:bg-surface-container-high rounded text-on-surface-variant transition-colors"
                >
                  {icon}
                </button>
              ))}
              <div className="w-px h-6 bg-outline-variant mx-1" />
              {["attach_file", "image"].map((icon) => (
                <button
                  key={icon}
                  type="button"
                  className="material-symbols-outlined p-1.5 hover:bg-surface-container-high rounded text-on-surface-variant transition-colors"
                >
                  {icon}
                </button>
              ))}
            </div>
            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={5}
              placeholder="Type your reply here..."
              className="w-full p-4 min-h-[120px] focus:outline-none resize-none font-body-md text-body-md placeholder:text-outline bg-transparent"
            />
            {/* Send Row */}
            <div className="p-3 border-t border-outline-variant flex justify-between items-center bg-surface-container-lowest">
              <span className="text-label-md text-on-surface-variant">
                {sent ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    Message sent!
                  </span>
                ) : (
                  "Press Ctrl + Enter to send"
                )}
              </span>
              <button
                type="button"
                onClick={handleSend}
                disabled={!reply.trim()}
                className="bg-primary text-on-primary px-6 py-2 rounded-lg font-body-md font-semibold hover:bg-surface-tint active:scale-95 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Send Message
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Right: Sidebar ─────────────────────────────────── */}
        <aside className="w-full md:w-[340px] flex flex-col gap-stack-md">

          {/* Ticket Details */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-md shadow-sm">
            <h2 className="text-label-md font-bold text-on-surface-variant uppercase tracking-wider mb-4">
              Ticket Details
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-body-md text-on-surface-variant">Assignee</span>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-on-primary text-[10px] font-bold">
                    SJ
                  </div>
                  <span className="font-body-md font-medium text-on-surface">{TICKET.assignee}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-body-md text-on-surface-variant">Priority</span>
                <div className="flex items-center gap-1.5 text-error">
                  <span className="material-symbols-outlined text-[16px] [font-variation-settings:'FILL'_1]">
                    priority_high
                  </span>
                  <span className="font-body-md font-bold">{TICKET.priority}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-body-md text-on-surface-variant">Category</span>
                <span className="font-body-md text-on-surface">{TICKET.category}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-body-md text-on-surface-variant">SLA Due</span>
                <span className="font-body-md text-on-surface font-medium text-amber-600">
                  {TICKET.slaDue}
                </span>
              </div>
            </div>
          </section>

          {/* Attachments */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-md shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-label-md font-bold text-on-surface-variant uppercase tracking-wider">
                Attachments (2)
              </h2>
              <button type="button" className="text-primary font-bold text-label-md hover:underline">
                View All
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {/* Image attachment */}
              <div className="group relative rounded-lg border border-outline-variant overflow-hidden aspect-square bg-surface-container-low cursor-pointer flex items-center justify-center">
                <span className="material-symbols-outlined text-[40px] text-on-surface-variant opacity-50">
                  image
                </span>
                <div className="absolute bottom-0 inset-x-0 p-2 bg-black/40 backdrop-blur-sm text-white text-[10px] truncate">
                  error-403.png
                </div>
              </div>
              {/* PDF attachment */}
              <div className="group relative rounded-lg border border-outline-variant overflow-hidden aspect-square bg-surface-container-low flex flex-col items-center justify-center cursor-pointer">
                <span className="material-symbols-outlined text-on-surface-variant text-[32px]">
                  picture_as_pdf
                </span>
                <div className="absolute bottom-0 inset-x-0 p-2 bg-black/40 backdrop-blur-sm text-white text-[10px] truncate w-full">
                  system-logs.pdf
                </div>
              </div>
            </div>
          </section>

          {/* Activity Log */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-md shadow-sm flex-1">
            <h2 className="text-label-md font-bold text-on-surface-variant uppercase tracking-wider mb-4">
              Activity Log
            </h2>
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-outline-variant">
              {ACTIVITY_LOG.map((entry, i) => (
                <div key={i} className="relative">
                  <div className={`absolute -left-[22px] top-1 w-3 h-3 rounded-full ${entry.dot} border-2 border-surface-container-lowest`} />
                  <p className="font-body-md text-on-surface">
                    {entry.label} <strong>{entry.action}</strong>
                  </p>
                  <p className="text-label-md text-on-surface-variant">{entry.time}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </main>

      <PortalFooter />

      {/* Custom scrollbar style */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}
