"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Send,
  Ticket,
  X,
} from "lucide-react";
import { TopNav } from "@/src/components/portal/TopNav";
import { PortalFooter } from "@/src/components/portal/PortalFooter";
import {
  fetchMyTickets,
  fetchPublicCategories,
  fetchAllKnowledgeBaseArticles,
  QueueTicket,
  BackendCategory,
  KnowledgeBaseArticleRecord,
} from "@/src/services/portalService";

export default function CustomerSupportPage() {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [tickets, setTickets] = useState<QueueTicket[]>([]);
  const [categories, setCategories] = useState<BackendCategory[]>([]);
  const [popularArticles, setPopularArticles] = useState<KnowledgeBaseArticleRecord[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeBaseArticleRecord | null>(null);

  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    Array<{ sender: "bot" | "user"; text: string; time: string }>
  >([
    {
      sender: "bot",
      text: "Hi there! Welcome to Kinetic Support. How can we help you today?",
      time: "Just now",
    },
  ]);
  const [chatInput, setChatInput] = useState("");

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages((prev) => [
      ...prev,
      { sender: "user", text: userMsg, time: "Just now" },
    ]);
    setChatInput("");
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Thanks for reaching out! For tracked follow-up, you can also submit a ticket and our support team will respond shortly.",
          time: "Just now",
        },
      ]);
    }, 600);
  };

  const loadTickets = useCallback(async () => {
    setLoadingTickets(true);
    try {
      const data = await fetchMyTickets({ limit: 8 });
      setTickets(data);
    } catch (err) {
      console.warn("Failed to load customer tickets:", err);
    } finally {
      setLoadingTickets(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const cats = await fetchPublicCategories();
      setCategories(cats);
    } catch (err) {
      console.warn("Failed to load categories:", err);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  const loadPopularArticles = useCallback(async () => {
    setLoadingArticles(true);
    try {
      const articles = await fetchAllKnowledgeBaseArticles(false);
      setPopularArticles(articles.slice(0, 4));
    } catch (err) {
      console.warn("Failed to load KB articles:", err);
    } finally {
      setLoadingArticles(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadTickets();
      void loadCategories();
      void loadPopularArticles();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadTickets, loadCategories, loadPopularArticles]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "Escape") {
        setSelectedArticle(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/customer/knowledge-base?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <TopNav activePage="support" />

      <main className="flex-1">
        {/* Clean Light Support Header */}
        <section className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="mx-auto max-w-4xl text-center space-y-5">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden />
              Support Center · All Systems Operational
            </span>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              How can we assist you?
            </h1>

            <p className="text-base text-slate-600 max-w-2xl mx-auto">
              Search our help guides, start a live conversation, or check the status of your open support requests.
            </p>

            <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto pt-1">
              <div className="relative flex items-center">
                <Search className="size-4 text-slate-400 absolute left-4 pointer-events-none" aria-hidden />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search help articles before creating a ticket..."
                  className="w-full pl-11 pr-24 py-3 rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer transition-colors"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* Support Channels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/customer/knowledge-base"
                className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-300 soft-shadow transition-all hover:-translate-y-0.5 flex flex-col gap-3"
              >
                <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <BookOpen className="size-5" aria-hidden />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Knowledge Base</h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Self-serve documentation and troubleshooting guides.
                  </p>
                </div>
                <span className="mt-auto text-blue-600 font-semibold inline-flex items-center gap-1 text-sm group-hover:underline">
                  Browse library <ArrowRight className="size-4" aria-hidden />
                </span>
              </Link>

              <Link
                href="/customer/create-ticket"
                className="group bg-blue-600 hover:bg-blue-700 p-5 rounded-2xl text-white soft-shadow transition-all hover:-translate-y-0.5 flex flex-col gap-3"
              >
                <div className="h-10 w-10 rounded-xl bg-white/15 text-white flex items-center justify-center">
                  <Plus className="size-5" aria-hidden />
                </div>
                <div>
                  <h2 className="text-base font-semibold">Create a Ticket</h2>
                  <p className="text-sm text-blue-100 mt-1">
                    Submit a tracked support case to our team.
                  </p>
                </div>
                <span className="mt-auto text-white font-semibold inline-flex items-center gap-1 text-sm group-hover:underline">
                  Open case <ArrowRight className="size-4" aria-hidden />
                </span>
              </Link>

              <button
                type="button"
                onClick={() => setIsLiveChatOpen(true)}
                className="group text-left bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-300 soft-shadow transition-all hover:-translate-y-0.5 flex flex-col gap-3 cursor-pointer"
              >
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <MessageSquare className="size-5" aria-hidden />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Live Chat</h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Ask quick questions with our support assistant.
                  </p>
                </div>
                <span className="mt-auto text-blue-600 font-semibold inline-flex items-center gap-1 text-sm group-hover:underline">
                  Start chat <ArrowRight className="size-4" aria-hidden />
                </span>
              </button>
            </div>

            {/* Help Topics */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900">Help Topics</h2>
                <Link
                  href="/customer/knowledge-base"
                  className="text-sm font-semibold text-blue-600 hover:underline"
                >
                  View all topics
                </Link>
              </div>

              {loadingCategories ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-4 rounded-xl bg-white border border-slate-200 animate-pulse h-20" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(categories.length > 0
                    ? categories.slice(0, 8).map((cat) => ({
                        id: cat.id,
                        name: cat.name,
                        icon:
                          cat.name.toLowerCase().includes("billing")
                            ? "payments"
                            : cat.name.toLowerCase().includes("tech") ||
                              cat.name.toLowerCase().includes("system")
                            ? "settings_suggest"
                            : cat.name.toLowerCase().includes("sec") ||
                              cat.name.toLowerCase().includes("policy")
                            ? "verified_user"
                            : "topic",
                      }))
                    : [
                        { id: "1", name: "Billing", icon: "payments" },
                        { id: "2", name: "Technical", icon: "settings_suggest" },
                        { id: "3", name: "Security", icon: "verified_user" },
                        { id: "4", name: "Onboarding", icon: "rocket_launch" },
                      ]
                  ).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedTopic(cat.name);
                        router.push(`/customer/knowledge-base?q=${encodeURIComponent(cat.name)}`);
                      }}
                      className={`p-4 rounded-xl text-center flex flex-col items-center gap-2 transition-colors cursor-pointer border ${
                        selectedTopic === cat.name
                          ? "bg-blue-50 border-blue-400 text-blue-700"
                          : "bg-white hover:bg-slate-50 border-slate-200 text-slate-800"
                      }`}
                    >
                      <span className="material-symbols-outlined text-blue-600 text-2xl" aria-hidden>
                        {cat.icon}
                      </span>
                      <span className="text-xs font-semibold truncate max-w-full">
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Recent Tickets */}
            <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden soft-shadow">
              <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/70">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    My Recent Support Tickets
                  </h2>
                  <p className="text-xs text-slate-500">
                    Quick status of your latest requests
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => void loadTickets()}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="size-3.5" aria-hidden />
                    Refresh
                  </button>
                  <Link
                    href="/customer/my-ticket"
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    All tickets
                  </Link>
                </div>
              </div>

              <div className="overflow-x-auto">
                {loadingTickets ? (
                  <div className="p-8 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
                    <RefreshCw className="size-4 animate-spin" aria-hidden />
                    <span>Loading your tickets...</span>
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="p-10 text-center space-y-2">
                    <Ticket className="size-8 text-slate-400 mx-auto" aria-hidden />
                    <p className="text-sm font-semibold text-slate-900">No support tickets yet</p>
                    <p className="text-xs text-slate-500">
                      Need help? Create a new request and track progress here.
                    </p>
                    <div className="pt-2">
                      <Link
                        href="/customer/create-ticket"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                      >
                        <Plus className="size-3.5" aria-hidden />
                        Create Ticket
                      </Link>
                    </div>
                  </div>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                        <th className="px-5 py-3 font-semibold">Ticket</th>
                        <th className="px-4 py-3 font-semibold">Subject</th>
                        <th className="px-4 py-3 font-semibold">Priority</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-5 py-3 font-semibold text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tickets.map((tkt) => {
                        const ticketCode =
                          tkt.ticketNumber || `#TKT-${tkt.id.slice(0, 5).toUpperCase()}`;
                        const statusStr = (tkt.status || "OPEN").replace(/_/g, " ");
                        const upper = statusStr.toUpperCase();
                        const isResolved = upper === "RESOLVED" || upper === "CLOSED";
                        const isInProgress = upper === "IN PROGRESS";

                        return (
                          <tr key={tkt.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-700">
                              <Link
                                href={`/customer/tickets/${tkt.id}`}
                                className="hover:text-blue-600"
                              >
                                {ticketCode}
                              </Link>
                            </td>
                            <td className="px-4 py-3.5 font-medium text-slate-900 max-w-xs truncate">
                              <Link
                                href={`/customer/tickets/${tkt.id}`}
                                className="hover:text-blue-600"
                              >
                                {tkt.subject}
                              </Link>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="px-2 py-0.5 rounded-md text-xs font-medium uppercase bg-slate-100 text-slate-700">
                                {tkt.priority || "MEDIUM"}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                  isInProgress
                                    ? "bg-blue-50 text-blue-700"
                                    : isResolved
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-amber-50 text-amber-700"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    isInProgress
                                      ? "bg-blue-500"
                                      : isResolved
                                      ? "bg-emerald-500"
                                      : "bg-amber-500"
                                  }`}
                                />
                                {statusStr}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <Link
                                href={`/customer/tickets/${tkt.id}`}
                                className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold transition-colors"
                              >
                                View
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 soft-shadow">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                System Status
              </h3>
              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-emerald-900 text-sm">
                    All Systems Operational
                  </span>
                </div>
                <CheckCircle2 className="size-4 text-emerald-600" aria-hidden />
              </div>
              <p className="mt-2.5 text-xs text-slate-500">
                API gateway, database, and live notifications verified.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 soft-shadow">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
                Popular Guides
              </h3>
              {loadingArticles ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 rounded-lg bg-slate-100 animate-pulse" />
                  ))}
                </div>
              ) : (
                <ul className="space-y-3.5">
                  {(popularArticles.length > 0
                    ? popularArticles
                    : [
                        {
                          id: "1",
                          title: "Setting up Multi-Factor Auth",
                          category: "Account Security",
                          content: "Enable two-factor authentication from Profile Settings.",
                          slug: "mfa-setup",
                          published: true,
                          createdAt: new Date().toISOString(),
                        },
                        {
                          id: "2",
                          title: "Understanding API Rate Limits",
                          category: "Technical",
                          content: "Review request quotas and best practices for webhooks.",
                          slug: "api-rate-limits",
                          published: true,
                          createdAt: new Date().toISOString(),
                        },
                      ]
                  ).map((art) => (
                    <li key={art.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedArticle(art)}
                        className="w-full text-left flex items-start gap-3 group cursor-pointer"
                      >
                        <FileText
                          className="size-4 text-blue-600 mt-0.5 shrink-0"
                          aria-hidden
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {art.title}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {art.category || "Guide"} · 4 min read
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4">
              <div>
                <h3 className="text-base font-bold">Need immediate help?</h3>
                <p className="text-sm text-slate-300 mt-1">
                  Our support line is available for urgent technical requests.
                </p>
              </div>
              <div className="space-y-2.5">
                <a
                  href="tel:+18008583569"
                  className="flex items-center gap-2.5 p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors text-sm font-medium"
                >
                  <Phone className="size-4 text-blue-400" aria-hidden />
                  <span>+1 (800) TKT-FLOW</span>
                </a>
                <a
                  href="mailto:support@tmspro.io"
                  className="flex items-center gap-2.5 p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors text-sm font-medium"
                >
                  <Mail className="size-4 text-blue-400" aria-hidden />
                  <span>support@tmspro.io</span>
                </a>
              </div>
            </div>
          </aside>
        </div>

        {/* Article Modal */}
        {selectedArticle && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
            onClick={() => setSelectedArticle(null)}
          >
            <div
              className="modal-pop bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 md:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200 mb-5">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                  {selectedArticle.category || "Guide"}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedArticle(null)}
                  aria-label="Close article"
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                {selectedArticle.title}
              </h2>
              <div className="text-slate-700 text-base leading-relaxed whitespace-pre-wrap mb-6">
                {selectedArticle.content || "Support documentation guide."}
              </div>
              <div className="flex justify-end pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedArticle(null)}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Live Chat Drawer */}
        {isLiveChatOpen && (
          <div className="modal-pop fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] max-w-sm bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <MessageSquare className="size-4 text-white" aria-hidden />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Support Assistant</h4>
                  <p className="text-[11px] text-slate-300">Typically replies immediately</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLiveChatOpen(false)}
                aria-label="Close chat"
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-4 h-72 overflow-y-auto space-y-3 bg-slate-50 text-sm">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${
                    msg.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white rounded-br-xs"
                        : "bg-white border border-slate-200 text-slate-800 rounded-bl-xs"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleSendChatMessage}
              className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
              />
              <button
                type="submit"
                aria-label="Send message"
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl transition-colors cursor-pointer"
              >
                <Send className="size-4" />
              </button>
            </form>
          </div>
        )}
      </main>

      <PortalFooter />
    </div>
  );
}
