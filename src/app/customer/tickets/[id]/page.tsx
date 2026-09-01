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

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
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
        : `\n[📎 ${file.name}]\n`;
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

  const toolbarActions: Record<string, { label: string; action: () => void }> = {
    format_bold: {
      label: "Bold",
      action: () => insertFormatting("**", "**", "bold text"),
    },
    format_italic: {
      label: "Italic",
      action: () => insertFormatting("*", "*", "italic text"),
    },
    format_list_bulleted: {
      label: "Bulleted List",
      action: () => insertFormatting("\n- ", "", "list item"),
    },
    link: {
      label: "Insert Link",
      action: () => insertFormatting("[", "](https://example.com)", "link title"),
    },
    attach_file: {
      label: "Attach File",
      action: () => fileInputRef.current?.click(),
    },
    image: {
      label: "Insert Image",
      action: () => imageInputRef.current?.click(),
    },
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

      const jsonSignature = JSON.stringify(msgs.map(m => m.id + (m.text || "")));
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
    <ProtectedRoute allowedRoles={["customer", "agent", "admin"]}>
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
              {ticket.status !== "RESOLVED" && ticket.status !== "CLOSED" && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await updateTicketStatus(id, "RESOLVED");
                      void loadTicketData(true);
                    } catch (err) {
                      console.error("Failed to resolve ticket", err);
                    }
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-lg font-body-md font-semibold hover:bg-surface-tint active:scale-95 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  Mark as Resolved
                </button>
              )}
              <Link
                href="/customer/my-ticket"
                className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg font-body-md font-medium hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                Back
              </Link>
            </div>
          </div>

          {/* ── CSAT Rating Section (Shown for RESOLVED or CLOSED tickets) ── */}
          {(ticket.status === "RESOLVED" || ticket.status === "CLOSED") && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-5 shadow-xs transition-all">
              <div className="flex items-center gap-2 mb-2">
                <Star className="size-5 text-amber-500 fill-amber-500" />
                <h3 className="font-headline-md text-headline-sm font-semibold text-amber-950">
                  Customer Satisfaction Survey
                </h3>
              </div>

              {ticket.rating ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-body-md text-amber-900 font-medium">Your Rating:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`size-5 ${
                            star <= ticket.rating!
                              ? "text-amber-500 fill-amber-500"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-amber-900 ml-1">({ticket.rating}/5)</span>
                    <span className="ml-auto text-xs text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                      <CheckCircle2 className="size-3.5 text-amber-600" /> Rating Submitted
                    </span>
                  </div>
                  {ticket.ratingFeedback && (
                    <p className="text-body-sm italic text-amber-900 bg-white/70 p-3 rounded-lg border border-amber-200">
                      &ldquo;{ticket.ratingFeedback}&rdquo;
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-body-md text-amber-900">
                    How satisfied were you with the support you received for this ticket?
                  </p>

                  {/* 5-Star Interactive Selector */}
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = star <= (hoverRating || selectedRating);
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setSelectedRating(star)}
                          className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                        >
                          <Star
                            className={`size-7 transition-colors ${
                              isFilled
                                ? "text-amber-500 fill-amber-500"
                                : "text-amber-300 hover:text-amber-400"
                            }`}
                          />
                        </button>
                      );
                    })}
                    {selectedRating > 0 && (
                      <span className="text-label-md font-bold text-amber-900 ml-2">
                        {selectedRating === 5
                          ? "Excellent! ⭐⭐⭐⭐⭐"
                          : selectedRating === 4
                          ? "Good ⭐⭐⭐⭐"
                          : selectedRating === 3
                          ? "Average ⭐⭐⭐"
                          : selectedRating === 2
                          ? "Poor ⭐⭐"
                          : "Terrible ⭐"}
                      </span>
                    )}
                  </div>

                  {selectedRating > 0 && (
                    <div className="space-y-2 animate-in fade-in duration-200">
                      <textarea
                        value={ratingFeedbackText}
                        onChange={(e) => setRatingFeedbackText(e.target.value)}
                        placeholder="Add optional comments or feedback for the support agent..."
                        className="w-full rounded-lg border border-amber-300 bg-white p-3 text-body-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                        className="rounded-lg bg-amber-600 px-4 py-2 font-body-md font-bold text-white shadow-sm hover:bg-amber-700 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
            className="flex-1 space-y-stack-md overflow-y-auto custom-scrollbar pr-1 min-h-[350px] max-h-[550px] border border-outline-variant bg-surface-container-lowest rounded-xl p-6 shadow-sm"
          >
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
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm mt-4">
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
            <div className="flex items-center gap-1.5 p-2 px-3 border-b border-outline-variant bg-surface-container-low/50 text-on-surface-variant font-medium text-sm">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertFormatting("**", "**", "bold text")}
                title="Bold"
                className="px-2 py-0.5 hover:bg-surface-container-high rounded font-bold font-serif hover:text-on-surface transition-colors cursor-pointer"
              >
                B
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertFormatting("*", "*", "italic text")}
                title="Italic"
                className="px-2 py-0.5 hover:bg-surface-container-high rounded italic font-serif hover:text-on-surface transition-colors cursor-pointer"
              >
                I
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertFormatting("[", "](https://example.com)", "link title")}
                title="Insert Link"
                className="p-1 hover:bg-surface-container-high rounded hover:text-on-surface transition-colors cursor-pointer flex items-center"
              >
                <span className="material-symbols-outlined text-[18px]">link</span>
              </button>

              <div className="h-4 w-px bg-outline-variant mx-1" />

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertFormatting("\n- ", "", "list item")}
                title="Bulleted List"
                className="p-1 hover:bg-surface-container-high rounded hover:text-on-surface transition-colors cursor-pointer flex items-center"
              >
                <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertFormatting("`", "`", "code")}
                title="Inline Code"
                className="px-1.5 py-0.5 hover:bg-surface-container-high rounded font-mono text-xs hover:text-on-surface transition-colors cursor-pointer"
              >
                &lt;&gt;
              </button>

              {uploadStatusMsg && (
                <span className="text-xs text-primary font-bold ml-auto flex items-center gap-1 animate-pulse">
                  {isUploadingFile && <Loader2 className="size-3 animate-spin" />}
                  {uploadStatusMsg}
                </span>
              )}
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              placeholder="Type your reply here... (Ctrl + Enter to send)"
              className="w-full px-4 py-3 min-h-[85px] focus:outline-none resize-none font-body-md text-body-md placeholder:text-outline bg-transparent"
            />

            {/* Bottom Bar / Action Footer */}
            <div className="p-3 px-4 border-t border-outline-variant flex justify-between items-center bg-surface-container-lowest relative">
              <div className="flex items-center gap-2 relative" ref={emojiRef}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingFile}
                  title="Attach File"
                  className="p-2 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-primary transition-colors cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[20px]">attach_file</span>
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setShowEmojiPicker((prev) => !prev)}
                  title="Insert Emoji"
                  className="p-2 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-amber-500 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">sentiment_satisfied</span>
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => insertFormatting("@support ", "", "")}
                  title="Mention Support"
                  className="p-2 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">alternate_email</span>
                </button>

                {/* Floating Emoji Picker */}
                {showEmojiPicker && (
                  <div className="absolute bottom-12 left-0 z-30 bg-surface-container-lowest border border-outline-variant rounded-2xl p-3 shadow-2xl grid grid-cols-6 gap-2 text-xl animate-in fade-in zoom-in-95 duration-150 w-64">
                    {["😊", "👍", "🎉", "🙏", "🚀", "❤️", "💡", "🐛", "💬", "⚡", "✅", "⭐"].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          insertFormatting(emoji, "", "");
                          setShowEmojiPicker(false);
                        }}
                        className="p-2 hover:bg-surface-container-high rounded-xl transition-transform hover:scale-125 text-center cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                {sent && (
                  <span className="text-xs font-semibold text-green-600 flex items-center gap-1 animate-in fade-in duration-200">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    Message sent!
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!reply.trim() || isSending}
                  className="bg-primary text-on-primary px-6 py-2 rounded-xl font-body-md font-bold hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer"
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

          {/* Attachments Section */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-md shadow-sm">
              <h2 className="text-label-md font-bold text-on-surface-variant uppercase tracking-wider mb-4">
                Attachments ({ticket.attachments.length})
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {ticket.attachments.map((att) => {
                  const isImg = att.fileType?.startsWith("image/") || /\.(png|jpg|jpeg|gif|webp)(\?.*)?$/i.test(att.fileName);
                  return (
                    <a
                      key={att.id}
                      href={att.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-square overflow-hidden rounded-lg border border-outline-variant bg-surface-container-low block"
                    >
                      {isImg ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={att.fileUrl}
                          alt={att.fileName}
                          className="h-full w-full object-cover opacity-85 transition-all group-hover:scale-105 group-hover:opacity-100"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-on-surface-variant">
                          <span className="material-symbols-outlined text-[28px]">description</span>
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 truncate bg-black/60 px-2 py-1 text-[10px] text-white backdrop-blur-xs">
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
