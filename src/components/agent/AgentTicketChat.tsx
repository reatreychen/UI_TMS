import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useAppSelector } from "@/src/store/hooks";
import { selectUser } from "@/src/store/slices/authSlice";
import {
  fetchTicketComments,
  createTicketComment,
  uploadTicketAttachment,
  TicketComment,
  TicketCommentUser,
} from "@/src/services/portalService";
import type { AgentTicketAttachment } from "@/src/constants/agentTicketDetail";
import { format } from "date-fns";
import {
  Loader2,
  FileText,
  ExternalLink,
  Download,
  X,
  ZoomIn,
  Sparkles,
} from "lucide-react";
import { aiDraftReply } from "@/src/services/aiAssistService";


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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  const isFirstLoadRef = useRef(true);
  const userScrolledUpRef = useRef(false);
  const storageKey = `agentTicketChat_${ticketId}`;

  const [messages, setMessages] = useState<TicketChatMessage[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeImageModal, setActiveImageModal] = useState<{ url: string; name: string } | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadStatusMsg, setUploadStatusMsg] = useState<string | null>(null);
  const [aiDrafting, setAiDrafting] = useState(false);


  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const insertFormatting = (prefix: string, suffix: string = "", defaultText: string = "") => {
    const textarea = textareaRef.current;
    const currentReply = reply;

    let start = currentReply.length;
    let end = currentReply.length;

    if (textarea) {
      start = textarea.selectionStart ?? currentReply.length;
      end = textarea.selectionEnd ?? currentReply.length;
    }

    const selected = currentReply.substring(start, end);
    const textToInsert = selected.length > 0 ? selected : defaultText;
    const replacement = `${prefix}${textToInsert}${suffix}`;
    const newText = currentReply.substring(0, start) + replacement + currentReply.substring(end);

    setReply(newText);

    requestAnimationFrame(() => {
      if (textarea) {
        textarea.focus();
        if (selected.length > 0) {
          textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
        } else {
          const newCursorPos = start + prefix.length + textToInsert.length + suffix.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }
      }
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, isImgOnly = false) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !currentUser?.id) return;
    const file = files[0];

    setIsUploadingFile(true);
    setUploadStatusMsg(`Uploading ${file.name}...`);
    try {
      await uploadTicketAttachment(ticketId, currentUser.id, file);
      setUploadStatusMsg(`Attached ${file.name}`);
      toast.success(`Attached ${file.name}`);
      setTimeout(() => setUploadStatusMsg(null), 3500);

      const attachmentMarkdown = isImgOnly
        ? `\n![${file.name}](Image: ${file.name})\n`
        : `\n[📎 ${file.name}]\n`;
      setReply((prev) => prev + attachmentMarkdown);

      void loadMessages();
    } catch (err) {
      console.error("Failed to upload attachment", err);
      toast.error("Failed to upload attachment. Please try again.");
      setUploadStatusMsg(null);
    } finally {
      setIsUploadingFile(false);
      e.target.value = "";
    }
  };

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
      toast.success("Message sent successfully!");

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
        <div className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-sm">
          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => void handleFileSelect(e, false)}
            className="hidden"
          />
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => void handleFileSelect(e, true)}
            className="hidden"
          />

          {/* Top Toolbar (Formatting) */}
          <div className="flex items-center gap-1.5 border-b border-outline-variant bg-surface-container-low/50 px-3 py-2 text-sm text-on-surface-variant font-medium">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => insertFormatting("**", "**", "bold text")}
              title="Bold"
              className="rounded px-2 py-0.5 font-serif font-bold transition-colors hover:bg-surface-container-high hover:text-on-surface cursor-pointer"
            >
              B
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => insertFormatting("*", "*", "italic text")}
              title="Italic"
              className="rounded px-2 py-0.5 font-serif italic transition-colors hover:bg-surface-container-high hover:text-on-surface cursor-pointer"
            >
              I
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => insertFormatting("[", "](https://example.com)", "link title")}
              title="Insert Link"
              className="flex items-center rounded p-1 transition-colors hover:bg-surface-container-high hover:text-on-surface cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">link</span>
            </button>

            <div className="mx-1 h-4 w-px bg-outline-variant" />

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => insertFormatting("\n- ", "", "list item")}
              title="Bulleted List"
              className="flex items-center rounded p-1 transition-colors hover:bg-surface-container-high hover:text-on-surface cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => insertFormatting("`", "`", "code")}
              title="Inline Code"
              className="rounded px-1.5 py-0.5 font-mono text-xs transition-colors hover:bg-surface-container-high hover:text-on-surface cursor-pointer"
            >
              &lt;&gt;
            </button>

            {uploadStatusMsg && (
              <span className="ml-auto flex items-center gap-1 text-xs font-bold text-primary animate-pulse">
                {isUploadingFile && <Loader2 className="size-3 animate-spin" />}
                {uploadStatusMsg}
              </span>
            )}
          </div>

          <textarea
            ref={textareaRef}
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            placeholder="Type your reply here... (Ctrl + Enter to send)"
            className="min-h-[85px] w-full resize-none border-none bg-transparent px-4 py-3 text-body-md placeholder:text-outline outline-none focus:ring-0"
          />

          {/* Bottom Bar / Action Footer */}
          <div className="relative flex items-center justify-between border-t border-outline-variant bg-surface-container-lowest p-3 px-4">
            <div className="relative flex items-center gap-2" ref={emojiRef}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingFile}
                title="Attach File"
                className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">attach_file</span>
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                title="Insert Emoji"
                className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-amber-500 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">sentiment_satisfied</span>
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertFormatting("@customer ", "", "")}
                title="Mention Customer"
                className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">alternate_email</span>
              </button>

              {/* Floating Emoji Picker */}
              {showEmojiPicker && (
                <div className="absolute bottom-12 left-0 z-30 grid w-64 grid-cols-6 gap-2 rounded-2xl border border-outline-variant bg-surface-container-lowest p-3 text-xl shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                  {["😊", "👍", "🎉", "🙏", "🚀", "❤️", "💡", "🐛", "💬", "⚡", "✅", "⭐"].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        insertFormatting(emoji, "", "");
                        setShowEmojiPicker(false);
                      }}
                      className="rounded-xl p-2 text-center transition-transform hover:scale-125 hover:bg-surface-container-high cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* AI Draft Reply button */}
              <button
                type="button"
                id="ai-draft-reply-btn"
                disabled={aiDrafting || sending}
                onClick={async () => {
                  setAiDrafting(true);
                  const draft = await aiDraftReply(ticketId);
                  setAiDrafting(false);
                  if (draft) {
                    setReply(draft);
                    textareaRef.current?.focus();
                    toast.success("AI draft ready — review and edit before sending!");
                  } else {
                    toast.error("AI draft failed. Please check your Gemini API key.");
                  }
                }}
                title="Generate AI draft reply"
                className="flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2 text-label-md font-semibold text-primary transition-all hover:bg-primary/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              >
                {aiDrafting ? (
                  <><Loader2 className="size-3.5 animate-spin" /><span>Drafting…</span></>
                ) : (
                  <><Sparkles className="size-3.5" /><span>Draft with AI</span></>
                )}
              </button>

              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={!reply.trim() || sending}
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2 text-body-md font-bold text-on-primary shadow-sm transition-all hover:brightness-110 active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
              >
                {sending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send Message</span>
                    <span className="material-symbols-outlined text-[18px]">send</span>
                  </>
                )}
              </button>
            </div>
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
