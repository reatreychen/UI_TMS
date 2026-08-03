"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useAppSelector } from "@/src/store/hooks";
import { selectUser } from "@/src/store/slices/authSlice";
import {
  fetchTicketComments,
  createTicketComment,
  TicketComment,
  TicketCommentUser,
} from "@/src/services/portalService";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import {
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  Code,
  Paperclip,
  Smile,
  AtSign,
  Send,
} from "lucide-react";

interface AgentTicketChatProps {
  ticketId: string;
  ticketDesc?: string;
  ticketCreatedAt?: string;
  customerId?: string;
  customerName?: string;
  customerAvatarUrl?: string;
}

interface TicketChatMessage {
  id: string;
  type: "agent" | "customer";
  text: string;
  author: string;
  time: string;
  avatarUrl?: string;
}

function readStoredMessages(storageKey: string): TicketChatMessage[] | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as TicketChatMessage[]) : null;
  } catch {
    return null;
  }
}

function saveMessages(storageKey: string, messages: TicketChatMessage[]) {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(storageKey, JSON.stringify(messages));
  } catch {
    // Ignore storage errors; the API remains the source of truth.
  }
}

function roleName(user?: TicketCommentUser) {
  if (!user?.role) return "";
  return typeof user.role === "string" ? user.role : user.role.name || "";
}

export function AgentTicketChat({
  ticketId,
  ticketDesc,
  ticketCreatedAt,
  customerId,
  customerName,
  customerAvatarUrl,
}: AgentTicketChatProps) {
  const currentUser = useAppSelector(selectUser);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const storageKey = `agentTicketChat_${ticketId}`;

  const [messages, setMessages] = useState<TicketChatMessage[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async (showLoading = false) => {
    if (!ticketId) return;

    if (showLoading) {
      const stored = readStoredMessages(storageKey);
      if (stored?.length) {
        setMessages(stored);
        setLoading(false);
      } else {
        setLoading(true);
      }
    }

    try {
      const comments = await fetchTicketComments(ticketId);
      const nextMessages: TicketChatMessage[] = [];

      // Keep the original ticket request in the same timeline as replies.
      if (ticketDesc?.trim()) {
        nextMessages.push({
          id: `initial-desc-${ticketId}`,
          type: "customer",
          text: ticketDesc,
          author: customerName || "Customer",
          time: ticketCreatedAt ? format(new Date(ticketCreatedAt), "h:mm a") : "",
          avatarUrl: customerAvatarUrl,
        });
      }

      nextMessages.push(
        ...comments.map((comment: TicketComment) => {
          const commentRole = roleName(comment.user).toLowerCase();
          const isCustomer = customerId
            ? comment.user?.id === customerId
            : commentRole.includes("customer");

          const message: TicketChatMessage = {
            id: comment.id,
            type: isCustomer ? "customer" : "agent",
            text: comment.message,
            author:
              comment.user?.fullName ||
              comment.user?.name ||
              (isCustomer ? customerName || "Customer" : "Agent"),
            time: comment.createdAt ? format(new Date(comment.createdAt), "h:mm a") : "",
            avatarUrl: comment.user?.avatarUrl || comment.user?.profileImage,
          };

          return message;
        }),
      );

      setMessages(nextMessages);
      saveMessages(storageKey, nextMessages);
      setError(null);
    } catch (err) {
      console.error("Failed to load comments", err);
      setError("Unable to refresh chat right now. Showing saved chat.");
    } finally {
      setLoading(false);
    }
  }, [customerAvatarUrl, customerId, customerName, storageKey, ticketCreatedAt, ticketDesc, ticketId]);

  useEffect(() => {
    const initialLoadTimer = window.setTimeout(() => {
      void loadMessages(true);
    }, 0);

    // Ticket comments do not have a websocket channel yet. Polling keeps the
    // agent and customer views in sync without requiring a browser refresh.
    const refreshTimer = window.setInterval(() => {
      void loadMessages();
    }, 3000);

    return () => {
      window.clearTimeout(initialLoadTimer);
      window.clearInterval(refreshTimer);
    };
  }, [loadMessages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!reply.trim() || !currentUser?.id) return;

    const text = reply.trim();
    setSending(true);

    try {
      const createdComment = await createTicketComment({
        ticketId,
        userId: currentUser.id,
        message: text,
        isInternal: false,
      });

      setReply("");

      // The create endpoint does not include the related user, so add the
      // sent message locally instead of waiting for a second page refresh.
      const message: TicketChatMessage = {
        id: createdComment?.id || `local-${Date.now()}`,
        type: "agent",
        text,
        author: currentUser.fullName || "Agent",
        time: createdComment?.createdAt
          ? format(new Date(createdComment.createdAt), "h:mm a")
          : format(new Date(), "h:mm a"),
        avatarUrl: currentUser.profileImage,
      };

      setMessages((previous) => {
        if (previous.some((item) => item.id === message.id)) return previous;
        const next = [...previous, message];
        saveMessages(storageKey, next);
        return next;
      });

      void loadMessages();
    } catch (err) {
      console.error("Failed to send message", err);
      setError("Unable to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="flex flex-1 flex-col border-r border-outline-variant bg-surface">
      <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto p-container-margin">
        {error && (
          <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
            {error}
          </div>
        )}

        {loading && messages.length === 0 ? (
          <div className="flex min-h-[240px] items-center justify-center text-on-surface-variant">
            <Loader2 className="size-7 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-outline-variant bg-surface-container-low p-8 text-center text-on-surface-variant">
            No messages yet. Start the conversation.
          </div>
        ) : (
          messages.map((message) => {
            const isAgent = message.type === "agent";

            return (
              <div
                key={message.id}
                className={`mb-4 flex flex-col ${isAgent ? "items-end" : "items-start"}`}
              >
                {!isAgent && (
                  <div className="mb-1 flex items-center gap-2 px-1">
                    <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border border-outline-variant bg-surface-container-high">
                      {message.avatarUrl ? (
                        <Image
                          src={message.avatarUrl}
                          alt={message.author}
                          width={24}
                          height={24}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] text-on-surface-variant">
                          {message.author.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-label-md font-bold text-on-surface">{message.author}</span>
                  </div>
                )}

                <div
                  className={`max-w-[85%] p-4 shadow-sm ${
                    isAgent
                      ? "rounded-xl rounded-br-sm bg-primary-container text-on-primary-container"
                      : "rounded-xl rounded-bl-sm border border-outline-variant bg-surface-container-high text-on-surface"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-body-md">{message.text}</p>
                </div>

                <div className="mt-1 flex items-center gap-1 px-1 text-label-md text-on-surface-variant">
                  <span>{message.time}</span>
                  {isAgent && (
                    <span className="material-symbols-outlined text-[14px]">done_all</span>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="border-t border-outline-variant bg-surface-container-low p-container-margin">
        <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-md">
          <div className="flex items-center gap-1 border-b border-outline-variant bg-surface-container-low p-2">
            <button type="button" aria-label="Bold" title="Bold" className="rounded p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high">
              <Bold aria-hidden className="size-5" />
            </button>
            <button type="button" aria-label="Italic" title="Italic" className="rounded p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high">
              <Italic aria-hidden className="size-5" />
            </button>
            <button type="button" aria-label="Link" title="Link" className="rounded p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high">
              <LinkIcon aria-hidden className="size-5" />
            </button>
            <div className="mx-1 h-5 w-px bg-outline-variant" aria-hidden />
            <button type="button" aria-label="List" title="List" className="rounded p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high">
              <List aria-hidden className="size-5" />
            </button>
            <button type="button" aria-label="Code" title="Code" className="rounded p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high">
              <Code aria-hidden className="size-5" />
            </button>
          </div>

          <textarea
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={5}
            placeholder="Type your reply here..."
            className="min-h-[120px] w-full resize-none border-none bg-transparent p-4 text-body-md placeholder:text-outline outline-none focus:ring-0"
          />

          <div className="flex items-center justify-between border-t border-outline-variant bg-surface-container-lowest px-4 py-3">
            <div className="flex items-center gap-1">
              <button type="button" aria-label="Attach file" className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container">
                <Paperclip aria-hidden className="size-5" />
              </button>
              <button type="button" aria-label="Add emoji" className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container">
                <Smile aria-hidden className="size-5" />
              </button>
              <button type="button" aria-label="Mention customer" className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container">
                <AtSign aria-hidden className="size-5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={!reply.trim() || sending}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 font-bold text-white shadow-md transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? <Loader2 className="size-[18px] animate-spin" /> : "Send Message"}
              {!sending && <Send aria-hidden className="size-[18px]" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
