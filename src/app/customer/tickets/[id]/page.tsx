"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { TopNav } from "@/src/components/portal/TopNav";
import { PortalFooter } from "@/src/components/portal/PortalFooter";
import { useParams } from "next/navigation";
import { useAppSelector } from "@/src/store/hooks";
import { selectUser } from "@/src/store/slices/authSlice";
import { ProtectedRoute } from "@/src/components/auth/ProtectedRoute";
import {
  fetchTicket,
  fetchTicketComments,
  createTicketComment,
  updateTicketStatus,
  uploadTicketAttachment,
  rateTicket,
  TicketComment,
} from "@/src/services/portalService";
import { formatDistanceToNow, format } from "date-fns";
import { Loader2, Star, CheckCircle2 } from "lucide-react";

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
  rating?: number | null;
  ratingFeedback?: string | null;
  ratedAt?: string | null;
  attachments?: {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    fileUrl: string;
  }[];
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
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadStatusMsg, setUploadStatusMsg] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [ratingFeedbackText, setRatingFeedbackText] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isFirstLoadRef = useRef(true);
  const userScrolledUpRef = useRef(false);
  const prevMessagesJsonRef = useRef<string>("");
  const previousMessageCountRef = useRef(0);

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
      await uploadTicketAttachment(id, currentUser.id, file);
      setUploadStatusMsg(`Attached ${file.name}`);
      toast.success(`Attached ${file.name}`);
      setTimeout(() => setUploadStatusMsg(null), 3500);

      const attachmentMarkdown = isImgOnly
        ? `\n![${file.name}](Image: ${file.name})\n`
        : `\n[Attachment: ${file.name}]\n`;
      setReply((prev) => prev + attachmentMarkdown);

      void loadTicketData();
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

  const loadTicketData = useCallback(async (showLoading = false) => {
    if (!id) return;
    if (showLoading) setIsLoading(true);

    try {
      const ticketData = (await fetchTicket(id)) as CustomerTicket;
      setTicket(ticketData);

      const commentsData = await fetchTicketComments(id);

      const msgs: Message[] = commentsData.map((c: TicketComment) => {
        const isCustomer = c.user?.id === ticketData.customer?.id;
        return {
          id: c.id,
          type: isCustomer ? "customer" : "agent",
          text: c.message,
          agentName: isCustomer ? undefined : (c.user?.fullName || c.user?.name || "Support Agent"),
          time: format(new Date(c.createdAt), "h:mm a"),
        };
      });

      msgs.unshift({
        id: "initial-desc",
        type: "customer",
        text: ticketData.description,
        time: format(new Date(ticketData.createdAt), "h:mm a"),
      });

      const jsonSignature = JSON.stringify(msgs.map((m) => m.id + (m.text || "")));
      if (jsonSignature !== prevMessagesJsonRef.current) {
        prevMessagesJsonRef.current = jsonSignature;
        setMessages(msgs);
      }
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

    const refreshTimer = window.setInterval(() => {
      void loadTicketData();
    }, 3000);

    return () => {
      window.clearTimeout(initialLoadTimer);
      window.clearInterval(refreshTimer);
    };
  }, [loadTicketData]);

  useEffect(() => {
    if (messages.length === 0) return;

    if (isFirstLoadRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
      isFirstLoadRef.current = false;
      previousMessageCountRef.current = messages.length;
    } else if (messages.length > previousMessageCountRef.current && !userScrolledUpRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      previousMessageCountRef.current = messages.length;
    }
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
      toast.success("Message sent successfully!");
      setTimeout(() => setSent(false), 2500);

      const isCustomerReply = !ticket?.customer?.id || ticket.customer.id === currentUser.id;
      const newMessage: Message = {
        id: createdComment?.id || `local-${Date.now()}`,
        type: isCustomerReply ? "customer" : "agent",
        text,
        agentName: isCustomerReply ? undefined : (currentUser.fullName || "Support Agent"),
        time: createdComment?.createdAt
          ? format(new Date(createdComment.createdAt), "h:mm a")
          : format(new Date(), "h:mm a"),
      };

      setMessages((previous) => {
        if (previous.some((message) => message.id === newMessage.id)) return previous;
        return [...previous, newMessage];
      });

      userScrolledUpRef.current = false;
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);

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
      <ProtectedRoute allowedRoles={["customer", "agent", "admin"]}>
        <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
          <TopNav activePage="tickets" />
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <Loader2 className="size-8 animate-spin text-blue-600" />
            <p className="mt-3 text-sm text-slate-600">Loading ticket details...</p>
          </div>
          <PortalFooter />
        </div>
      </ProtectedRoute>
    );
  }

  if (!ticket) {
    return (
      <ProtectedRoute allowedRoles={["customer", "agent", "admin"]}>
        <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
          <TopNav activePage="tickets" />
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-md">
              <p className="text-base font-semibold text-slate-900 mb-2">Ticket not found</p>
              <p className="text-sm text-slate-500 mb-5">
                This ticket may have been removed or is unavailable.
              </p>
              <Link
                href="/customer/my-ticket"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                Back to My Tickets
              </Link>
            </div>
          </div>
          <PortalFooter />
        </div>
      </ProtectedRoute>
    );
  }

  const statusStyles: Record<string, string> = {
    OPEN: "bg-blue-50 text-blue-700 border-blue-200",
    IN_PROGRESS: "bg-indigo-50 text-indigo-700 border-indigo-200",
    RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    CLOSED: "bg-slate-100 text-slate-700 border-slate-200",
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    ASSIGNED: "bg-teal-50 text-teal-700 border-teal-200",
  };

  const priorityStyles: Record<string, string> = {
    CRITICAL: "text-red-700 bg-red-50 border-red-200",
    HIGH: "text-orange-700 bg-orange-50 border-orange-200",
    MEDIUM: "text-amber-700 bg-amber-50 border-amber-200",
    LOW: "text-slate-700 bg-slate-100 border-slate-200",
  };

  return (
    <ProtectedRoute allowedRoles={["customer", "agent", "admin"]}>
      <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased">
        <TopNav activePage="tickets" />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-6">
          {/* ── Left: Conversation Area ─────────────────────────── */}
          <div className="flex-1 flex flex-col gap-5 min-w-0">
            {/* Ticket Header */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md">
                    {ticket.ticketNumber || `#${ticket.id.slice(0, 8)}`}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                      statusStyles[ticket.status] || "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {ticket.status.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-slate-500">
                    Created {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                  {ticket.subject}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {ticket.status !== "RESOLVED" && ticket.status !== "CLOSED" && (
                  <button
                    type="button"
                    disabled={isResolving}
                    onClick={async () => {
                      setIsResolving(true);
                      try {
                        await updateTicketStatus(id, "RESOLVED");
                        toast.success("Ticket marked as resolved!");
                        void loadTicketData(true);
                      } catch (err: unknown) {
                        console.error("Failed to resolve ticket", err);
                        const errObj = err as { response?: { data?: { message?: string } } };
                        const errorMsg =
                          errObj?.response?.data?.message ||
                          "Failed to resolve ticket. Please try again.";
                        toast.error(errorMsg);
                      } finally {
                        setIsResolving(false);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isResolving ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    )}
                    {isResolving ? "Resolving..." : "Mark as Resolved"}
                  </button>
                )}
                <Link
                  href="/customer/my-ticket"
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Back
                </Link>
              </div>
            </div>

            {/* ── CSAT Rating Section (Shown for RESOLVED or CLOSED tickets) ── */}
            {(ticket.status === "RESOLVED" || ticket.status === "CLOSED") && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="size-5 text-amber-500 fill-amber-500" />
                  <h2 className="font-display text-base font-bold text-amber-950">
                    Customer Satisfaction Survey
                  </h2>
                </div>

                {ticket.rating ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-amber-900 font-medium">Your Rating:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`size-5 ${
                              star <= ticket.rating!
                                ? "text-amber-500 fill-amber-500"
                                : "text-slate-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-bold text-sm text-amber-900 ml-1">({ticket.rating}/5)</span>
                      <span className="ml-auto text-xs text-amber-800 bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                        <CheckCircle2 className="size-3.5 text-amber-600" /> Rating Submitted
                      </span>
                    </div>
                    {ticket.ratingFeedback && (
                      <p className="text-sm italic text-amber-950 bg-white/80 p-3 rounded-xl border border-amber-200">
                        &ldquo;{ticket.ratingFeedback}&rdquo;
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-amber-900">
                      How satisfied were you with the support you received for this ticket?
                    </p>

                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = star <= (hoverRating || selectedRating);
                        return (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setSelectedRating(star)}
                            className="p-1 transition-transform hover:scale-110 focus:outline-none cursor-pointer"
                          >
                            <Star
                              className={`size-6 transition-colors ${
                                isFilled
                                  ? "text-amber-500 fill-amber-500"
                                  : "text-amber-300 hover:text-amber-400"
                              }`}
                            />
                          </button>
                        );
                      })}
                      {selectedRating > 0 && (
                        <span className="text-xs font-semibold text-amber-900 ml-2">
                          {selectedRating === 5
                            ? "Excellent (5/5)"
                            : selectedRating === 4
                            ? "Good (4/5)"
                            : selectedRating === 3
                            ? "Average (3/5)"
                            : selectedRating === 2
                            ? "Poor (2/5)"
                            : "Terrible (1/5)"}
                        </span>
                      )}
                    </div>

                    {selectedRating > 0 && (
                      <div className="space-y-2.5 pt-1">
                        <textarea
                          value={ratingFeedbackText}
                          onChange={(e) => setRatingFeedbackText(e.target.value)}
                          placeholder="Add optional comments or feedback for the support agent..."
                          className="w-full rounded-xl border border-amber-300 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                          rows={2}
                        />

                        <button
                          type="button"
                          disabled={isSubmittingRating}
                          onClick={async () => {
                            setIsSubmittingRating(true);
                            try {
                              await rateTicket(id, selectedRating, ratingFeedbackText);
                              toast.success("Thank you for your rating!");
                              void loadTicketData(true);
                            } catch (err) {
                              console.error("Failed to submit rating", err);
                              toast.error("Failed to submit rating. Please try again.");
                            } finally {
                              setIsSubmittingRating(false);
                            }
                          }}
                          className="rounded-xl bg-amber-600 hover:bg-amber-700 px-4 py-2 text-xs sm:text-sm font-semibold text-white transition-colors inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {isSubmittingRating ? (
                            <>
                              <Loader2 className="size-4 animate-spin" />
                              <span>Submitting...</span>
                            </>
                          ) : (
                            <span>Submit Feedback</span>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Timeline */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2 min-h-[340px] max-h-[540px] border border-slate-200 bg-white rounded-2xl p-5 sm:p-6 shadow-xs"
            >
              {messages.map((msg, i) => {
                if (msg.type === "event") {
                  return (
                    <div key={msg.id || i} className="flex justify-center my-3">
                      <div className="bg-slate-50 px-3.5 py-1 rounded-full border border-slate-200 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[15px] text-slate-500">info</span>
                        <span className="text-xs text-slate-600">{msg.eventText}</span>
                      </div>
                    </div>
                  );
                }
                if (msg.type === "customer") {
                  return (
                    <div key={msg.id || i} className="flex flex-col items-end">
                      <div className="max-w-[85%] bg-blue-600 text-white p-4 rounded-2xl rounded-br-sm shadow-xs">
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-400 px-1">
                        <span>{msg.time}</span>
                        <span className="material-symbols-outlined text-[14px] text-blue-500">done_all</span>
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={msg.id || i} className="flex flex-col items-start">
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[14px] text-blue-600">
                          support_agent
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-slate-800">{msg.agentName}</span>
                    </div>
                    <div className="max-w-[85%] bg-slate-100 text-slate-900 p-4 rounded-2xl rounded-bl-sm border border-slate-200">
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-400 px-1">{msg.time}</div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Reply Editor */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => void handleFileSelect(e, false)}
                className="hidden"
              />

              {/* Top Toolbar */}
              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-200 bg-slate-50 text-slate-600 text-sm">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => insertFormatting("**", "**", "bold text")}
                  title="Bold"
                  className="px-2 py-1 hover:bg-slate-200/70 rounded-lg font-bold font-serif hover:text-slate-900 transition-colors cursor-pointer"
                >
                  B
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => insertFormatting("*", "*", "italic text")}
                  title="Italic"
                  className="px-2 py-1 hover:bg-slate-200/70 rounded-lg italic font-serif hover:text-slate-900 transition-colors cursor-pointer"
                >
                  I
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => insertFormatting("[", "](https://example.com)", "link title")}
                  title="Insert Link"
                  className="p-1.5 hover:bg-slate-200/70 rounded-lg hover:text-slate-900 transition-colors cursor-pointer flex items-center"
                >
                  <span className="material-symbols-outlined text-[18px]">link</span>
                </button>

                <div className="h-4 w-px bg-slate-200 mx-1" />

                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => insertFormatting("\n- ", "", "list item")}
                  title="Bulleted List"
                  className="p-1.5 hover:bg-slate-200/70 rounded-lg hover:text-slate-900 transition-colors cursor-pointer flex items-center"
                >
                  <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => insertFormatting("`", "`", "code")}
                  title="Inline Code"
                  className="px-1.5 py-1 hover:bg-slate-200/70 rounded-lg font-mono text-xs hover:text-slate-900 transition-colors cursor-pointer"
                >
                  &lt;&gt;
                </button>

                {uploadStatusMsg && (
                  <span className="text-xs text-blue-600 font-semibold ml-auto flex items-center gap-1">
                    {isUploadingFile && <Loader2 className="size-3 animate-spin" />}
                    {uploadStatusMsg}
                  </span>
                )}
              </div>

              <textarea
                ref={textareaRef}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={3}
                placeholder="Type your reply here... (Ctrl + Enter to send)"
                className="w-full px-4 py-3 min-h-[90px] focus:outline-none resize-none text-sm text-slate-900 placeholder:text-slate-400 bg-transparent"
              />

              <div className="px-4 py-3 border-t border-slate-200 flex justify-between items-center bg-slate-50/70 relative">
                <div className="flex items-center gap-1 relative" ref={emojiRef}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingFile}
                    title="Attach File"
                    className="p-2 hover:bg-slate-200/70 rounded-lg text-slate-500 hover:text-blue-600 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[20px]">attach_file</span>
                  </button>

                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                    title="Insert Emoji"
                    className="p-2 hover:bg-slate-200/70 rounded-lg text-slate-500 hover:text-amber-600 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">sentiment_satisfied</span>
                  </button>

                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => insertFormatting("@support ", "", "")}
                    title="Mention Support"
                    className="p-2 hover:bg-slate-200/70 rounded-lg text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">alternate_email</span>
                  </button>

                  {showEmojiPicker && (
                    <div className="modal-pop absolute bottom-12 left-0 z-30 bg-white border border-slate-200 rounded-2xl p-3 shadow-xl grid grid-cols-6 gap-1.5 text-lg w-64">
                      {["😊", "👍", "🎉", "🙏", "🚀", "❤️", "💡", "🐛", "💬", "⚡", "✅", "⭐"].map(
                        (emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              insertFormatting(emoji, "", "");
                              setShowEmojiPicker(false);
                            }}
                            className="p-2 hover:bg-slate-100 rounded-xl transition-transform hover:scale-110 text-center cursor-pointer"
                          >
                            {emoji}
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {sent && (
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      Message sent!
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!reply.trim() || isSending}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer"
                  >
                    {isSending ? (
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

          {/* ── Right: Sidebar ─────────────────────────────────── */}
          <aside className="w-full lg:w-[320px] flex flex-col gap-5 shrink-0">
            <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                Ticket Details
              </h2>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-500">Assignee</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
                      {ticket.assignedAgent
                        ? (ticket.assignedAgent.fullName || ticket.assignedAgent.name || "?")
                            .substring(0, 2)
                            .toUpperCase()
                        : "—"}
                    </div>
                    <span className="font-medium text-slate-900">
                      {ticket.assignedAgent
                        ? ticket.assignedAgent.fullName || ticket.assignedAgent.name || "Assigned agent"
                        : "Unassigned"}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-500">Priority</span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-semibold ${
                      priorityStyles[ticket.priority?.toUpperCase() || "LOW"] ||
                      "text-slate-700 bg-slate-100 border-slate-200"
                    }`}
                  >
                    {ticket.priority}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-500">Category</span>
                  <span className="font-medium text-slate-900">
                    {ticket.category?.name || "Uncategorized"}
                  </span>
                </div>
              </div>
            </section>

            {ticket.attachments && ticket.attachments.length > 0 && (
              <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                  Attachments ({ticket.attachments.length})
                </h2>
                <div className="grid grid-cols-2 gap-2.5">
                  {ticket.attachments.map((att) => {
                    const isImg =
                      att.fileType?.startsWith("image/") ||
                      /\.(png|jpg|jpeg|gif|webp)(\?.*)?$/i.test(att.fileName);
                    return (
                      <a
                        key={att.id}
                        href={att.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50 block"
                      >
                        {isImg ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={att.fileUrl}
                            alt={att.fileName}
                            className="h-full w-full object-cover opacity-90 transition-all group-hover:scale-105 group-hover:opacity-100"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-slate-400">
                            <span className="material-symbols-outlined text-[28px]">description</span>
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 truncate bg-slate-900/75 px-2 py-1 text-[10px] text-white backdrop-blur-xs">
                          {att.fileName}
                        </div>
                      </a>
                    );
                  })}
                </div>
              </section>
            )}
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
    </ProtectedRoute>
  );
}
