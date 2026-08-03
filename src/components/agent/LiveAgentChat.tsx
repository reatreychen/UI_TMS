"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { io, Socket } from "socket.io-client";
import { Loader2, Send, Paperclip, Smile, AtSign, Bold, Italic, Link as LinkIcon, List, Code, FileText, Download } from "lucide-react";
import { useAppSelector } from "@/src/store/hooks";
import { selectUser } from "@/src/store/slices/authSlice";
import {
  fetchChatSessionMessages,
  sendChatSessionMessage,
  ChatMessage,
  ChatSession,
} from "@/src/services/chatService";

interface LiveAgentChatProps {
  sessionId: string;
  session?: ChatSession;
}

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1$/, "") || "http://localhost:8000";

export function LiveAgentChat({ sessionId, session }: LiveAgentChatProps) {
  const currentUser = useAppSelector(selectUser);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const storageKey = `liveAgentChat_${sessionId}`;

  const saveMessagesToStorage = (msgs: ChatMessage[]) => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify(msgs));
    } catch {
      // ignore storage errors
    }
  };

  const loadStoredMessages = (): ChatMessage[] | null => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.sessionStorage.getItem(storageKey);
      if (!raw) return null;
      return JSON.parse(raw) as ChatMessage[];
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);

    const stored = loadStoredMessages();
    if (stored?.length) {
      setMessages(stored);
      setLoading(false);
    }

    fetchChatSessionMessages(sessionId)
      .then((data) => {
        setMessages(data);
        saveMessagesToStorage(data);
        setError(null);
      })
      .catch((err) => {
        console.error("Failed to load chat messages", err);
        setError("Unable to refresh chat history. Showing saved messages.");
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

  useEffect(() => {
    if (messages.length > 0) {
      setLoading(false);
    }
  }, [messages]);

  useEffect(() => {
    if (!sessionId) return;

    const socket = io(`${SOCKET_URL}/ws/chat`, {
      transports: ["websocket"],
      auth: {
        token: typeof window !== "undefined" ? localStorage.getItem("accessToken") : undefined,
      },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_session", { sessionId });
    });

    socket.on("session_history", (history: ChatMessage[]) => {
      if (Array.isArray(history)) {
        setMessages(history);
        saveMessagesToStorage(history);
        setError(null);
      }
    });

    socket.on("new_message", (message: ChatMessage) => {
      setMessages((prev) => {
        const next = [...prev, message];
        saveMessagesToStorage(next);
        return next;
      });
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connect error", err);
    });

    return () => {
      socket.emit("leave_session", { sessionId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [sessionId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!reply.trim() || !currentUser?.id) return;
    setSending(true);
    try {
      const newMessage = await sendChatSessionMessage(sessionId, currentUser.id, reply.trim());
      setReply("");
      setMessages((prev) => {
        const next = [...prev, newMessage];
        saveMessagesToStorage(next);
        return next;
      });
    } catch (err) {
      console.error("Failed to send chat message", err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const title = session?.customer?.fullName || session?.customerId || "Customer";

  return (
    <div className="flex h-full flex-1 flex-col rounded-[28px] border border-outline-variant bg-surface shadow-sm">
      <div className="border-b border-outline-variant px-6 py-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-label-md font-medium uppercase tracking-[0.2em] text-on-surface-variant">
              Live chat
            </p>
            <h2 className="text-headline-sm font-semibold text-on-surface">
              {title}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 rounded-full bg-surface-container px-4 py-2 text-sm text-on-surface-variant">
            <span>Session</span>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">{sessionId.slice(0, 8)}</span>
          </div>
        </div>
      </div>

      <div className="custom-scrollbar flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-[24px] border border-dashed border-outline-variant bg-surface-container-low p-12 text-on-surface-variant">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-[24px] border border-dashed border-outline-variant bg-surface-container-low p-12 text-center text-on-surface-variant">
            No messages yet. Start the conversation.
          </div>
        ) : null}
        {error && (
          <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
            {error}
          </div>
        )}
        {messages.length > 0 && (
          <>
            {messages.map((msg) => {
              const isAgent = msg.sender?.role !== "CUSTOMER";
              const authorName = msg.sender?.fullName || msg.sender?.name || (isAgent ? "Agent" : "Customer");
              const avatarUrl = msg.sender?.avatarUrl;
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-3 ${isAgent ? "justify-end" : "justify-start"}`}
                >
                  {!isAgent && (
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-outline-variant bg-surface-container-high">
                      {avatarUrl ? (
                        <Image
                          src={avatarUrl}
                          alt={authorName}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-sm text-on-surface-variant">
                          {authorName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  )}

                  <div className={`max-w-[85%] ${isAgent ? "ml-auto" : ""}`}>
                    <div className={`mb-1 flex items-center gap-2 text-sm ${isAgent ? "justify-end" : "justify-start"}`}>
                      {!isAgent && <span className="font-semibold text-on-surface">{authorName}</span>}
                      <span className="text-label-md text-on-surface-variant">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                      </span>
                      {isAgent && <span className="font-semibold text-primary">You</span>}
                    </div>

                    <div
                      className={`rounded-xl p-4 text-body-md leading-relaxed shadow-sm ${
                        isAgent
                          ? "rounded-br-[4px] rounded-tl-[24px] rounded-tr-[24px] rounded-bl-[24px] bg-primary-container text-on-primary-container"
                          : "rounded-bl-[4px] rounded-tr-[24px] rounded-tl-[24px] rounded-br-[24px] border border-outline-variant bg-surface-container-high text-on-surface"
                      }`}
                    >
                      {msg.message}
                    </div>
                    {isAgent && (
                      <div className="mt-1 flex justify-end text-label-md text-on-surface-variant">
                        <span className="flex items-center gap-1">
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
                          <span className="material-symbols-outlined text-[16px]">done_all</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="border-t border-outline-variant bg-surface-container-low px-6 py-5">
        <div className="rounded-[28px] border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={4}
              placeholder="Type your message..."
              className="min-h-[120px] w-full resize-none rounded-[20px] border border-outline-variant bg-transparent px-4 py-3 text-body-md placeholder:text-outline focus:border-primary focus:outline-none focus:ring-0"
            />
            <div className="flex flex-col items-stretch justify-between gap-3">
              <button
                onClick={handleSend}
                disabled={!reply.trim() || sending}
                className="inline-flex items-center justify-center gap-2 rounded-[20px] bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? <Loader2 className="size-[18px] animate-spin" /> : "Send"}
                {!sending && <Send aria-hidden className="size-[18px]" />}
              </button>
              <div className="flex items-center justify-between gap-2 rounded-[20px] bg-surface-container px-3 py-2">
                <button className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container"><Paperclip aria-hidden className="size-5" /></button>
                <button className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container"><Smile aria-hidden className="size-5" /></button>
                <button className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container"><AtSign aria-hidden className="size-5" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
