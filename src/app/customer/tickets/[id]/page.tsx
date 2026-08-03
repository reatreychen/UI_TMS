"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { TopNav } from "@/src/components/portal/TopNav";
import { PortalFooter } from "@/src/components/portal/PortalFooter";
import { useParams } from "next/navigation";
import { useAppSelector } from "@/src/store/hooks";
import { selectUser } from "@/src/store/slices/authSlice";
import {
  fetchTicket,
  fetchTicketComments,
  createTicketComment,
  TicketComment,
} from "@/src/services/portalService";
import { formatDistanceToNow, format } from "date-fns";
import { Loader2 } from "lucide-react";

type MessageType = "customer" | "agent" | "event";
interface Message {
  id: string;
  type: MessageType;
  text?: string;
  agentName?: string;
  time?: string;
  eventText?: string;
}

interface CustomerTicket {
  id: string;
  ticketNumber?: string;
  subject: string;
  status: string;
  createdAt: string;
  description: string;
  priority: string;
  category?: { name?: string };
  customer?: { id: string };
  assignedAgent?: { fullName?: string; name?: string };
}

export default function TicketDetailPage() {
  const { id } = useParams() as { id: string };
  const currentUser = useAppSelector(selectUser);

  const [ticket, setTicket] = useState<CustomerTicket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadTicketData = useCallback(async (showLoading = false) => {
    if (!id) return;
    if (showLoading) setIsLoading(true);

    try {
      const ticketData = (await fetchTicket(id)) as CustomerTicket;
      setTicket(ticketData);

      const commentsData = await fetchTicketComments(id);
      
      // Transform comments to messages
      const msgs: Message[] = commentsData.map((c: TicketComment) => {
        const isCustomer = c.user?.id === ticketData.customer?.id;
        return {
          id: c.id,
          type: isCustomer ? "customer" : "agent",
          text: c.message,
          agentName: isCustomer ? undefined : (c.user?.fullName || c.user?.name || "Agent"),
          time: format(new Date(c.createdAt), "h:mm a"),
        };
      });

      // Add the initial ticket description as the first message
      msgs.unshift({
        id: "initial-desc",
        type: "customer",
        text: ticketData.description,
        time: format(new Date(ticketData.createdAt), "h:mm a"),
      });

      setMessages(msgs);
    } catch (error) {
      console.error("Failed to fetch ticket data", error);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const initialLoadTimer = window.setTimeout(() => {
      void loadTicketData(true);
    }, 0);

    // Keep the customer view synchronized with replies from the agent.
    const refreshTimer = window.setInterval(() => {
      void loadTicketData();
    }, 3000);

    return () => {
      window.clearTimeout(initialLoadTimer);
      window.clearInterval(refreshTimer);
    };
  }, [loadTicketData]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!reply.trim() || !currentUser?.id) return;
    const text = reply.trim();
    setIsSending(true);
    try {
      const createdComment = await createTicketComment({
        ticketId: id,
        userId: currentUser.id,
        message: text,
        isInternal: false,
      });
      setReply("");
      setSent(true);
      setTimeout(() => setSent(false), 2500);

      // Show the sent message immediately. The next poll reconciles it with
      // the API and also picks up replies from the agent.
      const newMessage: Message = {
        id: createdComment?.id || `local-${Date.now()}`,
        type: "agent",
        text,
        agentName: currentUser.fullName || "Agent",
        time: createdComment?.createdAt
          ? format(new Date(createdComment.createdAt), "h:mm a")
          : format(new Date(), "h:mm a"),
      };

      setMessages((previous) => {
        if (previous.some((message) => message.id === newMessage.id)) return previous;
        return [...previous, newMessage];
      });

      void loadTicketData();
    } catch (err) {
      console.error("Failed to send reply", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-on-surface font-body-md items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="mt-4 text-on-surface-variant">Loading ticket details...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-on-surface font-body-md items-center justify-center">
        <p className="text-on-surface-variant">Ticket not found.</p>
        <Link href="/customer/my-ticket" className="mt-4 text-primary hover:underline">
          Go back
        </Link>
      </div>
    );
  }

  const statusStyles: Record<string, string> = {
    OPEN: "bg-blue-100 text-blue-700",
    IN_PROGRESS: "bg-purple-100 text-purple-700",
    RESOLVED: "bg-green-100 text-green-700",
    CLOSED: "bg-gray-100 text-gray-700",
    PENDING: "bg-orange-100 text-orange-700",
    ASSIGNED: "bg-teal-100 text-teal-700",
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
                <span className={`text-label-md font-label-md px-2 py-0.5 rounded-full ${statusStyles[ticket.status] || "bg-gray-100 text-gray-700"}`}>
                  {ticket.status.replace(/_/g, " ")}
                </span>
                <span className="text-label-md text-on-surface-variant">
                  Created {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                </span>
              </div>
              <h1 className="font-headline-md text-headline-md text-on-surface">
                {ticket.ticketNumber || ticket.id.slice(0,8)} - {ticket.subject}
              </h1>
            </div>
            <div className="flex gap-2">
              <Link
                href="/customer/my-ticket"
                className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg font-body-md font-medium hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                Back
              </Link>
            </div>
          </div>

          {/* Timeline */}
          <div className="flex-1 space-y-stack-md overflow-y-auto custom-scrollbar pr-1 min-h-[400px] border border-outline-variant bg-surface-container-lowest rounded-xl p-6 shadow-sm">
            {messages.map((msg, i) => {
              if (msg.type === "event") {
                return (
                  <div key={msg.id || i} className="flex justify-center my-4">
                    <div className="bg-surface-container-low px-4 py-1 rounded-full border border-outline-variant flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant">info</span>
                      <span className="text-label-md text-on-surface-variant">{msg.eventText}</span>
                    </div>
                  </div>
                );
              }
              if (msg.type === "customer") {
                return (
                  <div key={msg.id || i} className="flex flex-col items-end mb-4">
                    <div className="max-w-[85%] bg-primary-container text-on-primary-container p-4 rounded-xl rounded-br-sm shadow-sm">
                      <p className="font-body-md text-body-md whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-label-md text-on-surface-variant px-1">
                      <span>{msg.time}</span>
                      <span className="material-symbols-outlined text-[14px] [font-variation-settings:'FILL'_1]">done_all</span>
                    </div>
                  </div>
                );
              }
              return (
                <div key={msg.id || i} className="flex flex-col items-start mb-4">
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <div className="w-6 h-6 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center">
                      <span className="material-symbols-outlined text-[14px] text-on-surface-variant">support_agent</span>
                    </div>
                    <span className="text-label-md font-bold text-on-surface">{msg.agentName}</span>
                  </div>
                  <div className="max-w-[85%] bg-surface-container-high text-on-surface p-4 rounded-xl rounded-bl-sm border border-outline-variant shadow-sm">
                    <p className="font-body-md text-body-md whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  <div className="mt-1 text-label-md text-on-surface-variant px-1">{msg.time}</div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Reply Editor */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-md mt-4">
            <div className="flex items-center gap-1 p-2 border-b border-outline-variant bg-surface-container-low">
              {["format_bold", "format_italic", "format_list_bulleted", "link", "attach_file", "image"].map((icon) => (
                <button
                  key={icon}
                  type="button"
                  className="material-symbols-outlined p-1.5 hover:bg-surface-container-high rounded text-on-surface-variant transition-colors"
                >
                  {icon}
                </button>
              ))}
            </div>
            <textarea
              ref={textareaRef}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={5}
              placeholder="Type your reply here..."
              className="w-full p-4 min-h-[120px] focus:outline-none resize-none font-body-md text-body-md placeholder:text-outline bg-transparent"
            />
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
                disabled={!reply.trim() || isSending}
                className="bg-primary text-on-primary px-6 py-2 rounded-lg font-body-md font-semibold hover:bg-surface-tint active:scale-95 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSending ? <Loader2 className="size-4 animate-spin" /> : null}
                {isSending ? "Sending..." : "Send Message"}
                {!isSending && <span className="material-symbols-outlined text-[18px]">send</span>}
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
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary text-[10px] font-bold">
                    {ticket.assignedAgent
                      ? (ticket.assignedAgent.fullName || ticket.assignedAgent.name || "?")
                          .substring(0, 2)
                          .toUpperCase()
                      : "-"}
                  </div>
                  <span className="font-body-md font-medium text-on-surface">
                    {ticket.assignedAgent
                      ? ticket.assignedAgent.fullName || ticket.assignedAgent.name || "Assigned agent"
                      : "Unassigned"}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-body-md text-on-surface-variant">Priority</span>
                <div className="flex items-center gap-1.5 text-error">
                  <span className="material-symbols-outlined text-[16px] [font-variation-settings:'FILL'_1]">
                    priority_high
                  </span>
                  <span className="font-body-md font-bold">{ticket.priority}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-body-md text-on-surface-variant">Category</span>
                <span className="font-body-md text-on-surface">{ticket.category?.name || "Uncategorized"}</span>
              </div>
            </div>
          </section>
        </aside>
      </main>

      <PortalFooter />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}
