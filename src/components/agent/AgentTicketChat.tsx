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
import type { AgentTicketAttachment } from "@/src/constants/agentTicketDetail";
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
  FileText,
  ExternalLink,
  Download,
  X,
  ZoomIn,
} from "lucide-react";

interface AgentTicketChatProps {
  ticketId: string;
  ticketDesc?: string;
  ticketCreatedAt?: string;
  customerId?: string;
  customerName?: string;
  customerAvatarUrl?: string;
  attachments?: AgentTicketAttachment[];
}

interface TicketChatMessage {
  id: string;
  type: "agent" | "customer";
  text: string;
  author: string;
  time: string;
  avatarUrl?: string;
  attachments?: AgentTicketAttachment[];
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

export function isImageAttachment(att: AgentTicketAttachment): boolean {
  if (att.fileType?.startsWith("image/")) return true;
  const urlOrName = (att.fileUrl || att.fileName || att.name || "").toLowerCase();
  return /\.(png|jpg|jpeg|gif|webp|svg)(\?.*)?$/i.test(urlOrName);
}

export function formatBytes(bytes?: number): string {
  if (!bytes || isNaN(bytes)) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AgentTicketChat({
  ticketId,
  ticketDesc,
  ticketCreatedAt,
  customerId,
  customerName,
  customerAvatarUrl,
  attachments = [],
}: AgentTicketChatProps) {
  const currentUser = useAppSelector(selectUser);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isFirstLoadRef = useRef(true);
  const userScrolledUpRef = useRef(false);
  const storageKey = `agentTicketChat_${ticketId}`;

  const [messages, setMessages] = useState<TicketChatMessage[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeImageModal, setActiveImageModal] = useState<{ url: string; name: string } | null>(null);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 120;
    userScrolledUpRef.current = !isNearBottom;
  };

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
          attachments: attachments && attachments.length > 0 ? attachments : undefined,
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
  }, [attachments, customerAvatarUrl, customerId, customerName, storageKey, ticketCreatedAt, ticketDesc, ticketId]);

  useEffect(() => {
    const initialLoadTimer = window.setTimeout(() => {
      void loadMessages(true);
    }, 0);

    const refreshTimer = window.setInterval(() => {
      void loadMessages();
    }, 3000);

    return () => {
      window.clearTimeout(initialLoadTimer);
      window.clearInterval(refreshTimer);
    };
  }, [loadMessages]);

  useEffect(() => {
    if (messages.length === 0) return;

    if (isFirstLoadRef.current) {
      chatEndRef.current?.scrollIntoView({ behavior: "auto" });
      isFirstLoadRef.current = false;
    } else if (!userScrolledUpRef.current) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
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

      userScrolledUpRef.current = false;
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);

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
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="custom-scrollbar flex-1 space-y-6 overflow-y-auto p-container-margin"
      >
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

                  {/* Attachment rendering */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-3 space-y-3 border-t border-outline-variant/40 pt-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                        Attachments ({message.attachments.length})
                      </p>

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {message.attachments.map((att, idx) => {
                          const isImg = isImageAttachment(att);
                          const fileName = att.fileName || att.name || "Attachment";
                          const fileUrl = att.fileUrl || "#";
                          const fileSizeFormatted = att.fileSize ? formatBytes(att.fileSize) : att.size || "";

                          if (isImg && fileUrl !== "#") {
                            return (
                              <div
                                key={att.id || idx}
                                className="group relative cursor-pointer overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest shadow-xs transition-all hover:shadow-md"
                                onClick={() => setActiveImageModal({ url: fileUrl, name: fileName })}
                              >
                                <div className="relative aspect-video w-full overflow-hidden bg-black/5">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={fileUrl}
                                    alt={fileName}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                                    <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900 shadow">
                                      <ZoomIn className="size-3.5" />
                                      View Image
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between p-2 text-xs">
                                  <span className="truncate font-medium text-on-surface" title={fileName}>
                                    {fileName}
                                  </span>
                                  {fileSizeFormatted && (
                                    <span className="ml-1 shrink-0 text-on-surface-variant">
                                      {fileSizeFormatted}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          }

                          return (
                            <a
                              key={att.id || idx}
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-2.5 text-xs text-on-surface transition-colors hover:bg-surface-container-low"
                            >
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
                                <FileText className="size-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-medium text-on-surface">{fileName}</p>
                                {fileSizeFormatted && (
                                  <p className="text-[11px] text-on-surface-variant">{fileSizeFormatted}</p>
                                )}
                              </div>
                              <ExternalLink className="size-3.5 text-on-surface-variant" />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
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

      {/* Reply input section */}
      <div className="border-t border-outline-variant bg-surface-container-low p-3">
        <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
          <div className="flex items-center gap-1 border-b border-outline-variant bg-surface-container-low px-3 py-1.5">
            <button type="button" aria-label="Bold" title="Bold" className="rounded p-1 text-on-surface-variant transition-colors hover:bg-surface-container-high">
              <Bold aria-hidden className="size-4" />
            </button>
            <button type="button" aria-label="Italic" title="Italic" className="rounded p-1 text-on-surface-variant transition-colors hover:bg-surface-container-high">
              <Italic aria-hidden className="size-4" />
            </button>
            <button type="button" aria-label="Link" title="Link" className="rounded p-1 text-on-surface-variant transition-colors hover:bg-surface-container-high">
              <LinkIcon aria-hidden className="size-4" />
            </button>
            <div className="mx-1 h-4 w-px bg-outline-variant" aria-hidden />
            <button type="button" aria-label="List" title="List" className="rounded p-1 text-on-surface-variant transition-colors hover:bg-surface-container-high">
              <List aria-hidden className="size-4" />
            </button>
            <button type="button" aria-label="Code" title="Code" className="rounded p-1 text-on-surface-variant transition-colors hover:bg-surface-container-high">
              <Code aria-hidden className="size-4" />
            </button>
          </div>

          <textarea
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder="Type your reply here... (Ctrl + Enter to send)"
            className="min-h-[64px] w-full resize-none border-none bg-transparent px-4 py-2.5 text-body-md placeholder:text-outline outline-none focus:ring-0"
          />

          <div className="flex items-center justify-between border-t border-outline-variant bg-surface-container-lowest px-3 py-2">
            <div className="flex items-center gap-1">
              <button type="button" aria-label="Attach file" className="rounded-full p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container">
                <Paperclip aria-hidden className="size-4" />
              </button>
              <button type="button" aria-label="Add emoji" className="rounded-full p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container">
                <Smile aria-hidden className="size-4" />
              </button>
              <button type="button" aria-label="Mention customer" className="rounded-full p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container">
                <AtSign aria-hidden className="size-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={!reply.trim() || sending}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-1.5 text-sm font-bold text-white shadow-xs transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? <Loader2 className="size-4 animate-spin" /> : "Send Message"}
              {!sending && <Send aria-hidden className="size-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Full Image Lightbox Modal */}
      {activeImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setActiveImageModal(null)}
        >
          <div
            className="relative flex max-h-[90vh] max-w-[90vw] flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-5 py-3">
              <h3 className="truncate font-semibold text-on-surface">{activeImageModal.name}</h3>
              <div className="flex items-center gap-2">
                <a
                  href={activeImageModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="flex items-center gap-1 rounded-lg bg-surface-container-high px-3 py-1.5 text-xs font-semibold text-on-surface transition-colors hover:bg-surface-variant"
                >
                  <Download className="size-3.5" />
                  Download
                </a>
                <button
                  type="button"
                  onClick={() => setActiveImageModal(null)}
                  className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>
            <div className="flex max-h-[80vh] items-center justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeImageModal.url}
                alt={activeImageModal.name}
                className="max-h-[75vh] max-w-[85vw] object-contain rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
