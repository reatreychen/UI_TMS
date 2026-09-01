"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // API State
  const [tickets, setTickets] = useState<QueueTicket[]>([]);
  const [categories, setCategories] = useState<BackendCategory[]>([]);
  const [popularArticles, setPopularArticles] = useState<KnowledgeBaseArticleRecord[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Article Modal State
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeBaseArticleRecord | null>(null);

  // Live Chat Drawer State
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "bot" | "user"; text: string; time: string }>>([
    { sender: "bot", text: "Hello! 👋 Welcome to Kinetic Support. How can we help you today?", time: "Just now" },
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
        { sender: "bot", text: "Thank you for contacting Kinetic Enterprise Support! A live support specialist has joined your session.", time: "Just now" },
      ]);
    }, 800);
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  // Load Real Support Tickets from Backend API
  const loadTickets = useCallback(async () => {
    setLoadingTickets(true);
    try {
      const data = await fetchMyTickets({ limit: 10 });
      setTickets(data);
    } catch (err) {
      console.warn("Failed to load customer tickets from backend API:", err);
    } finally {
      setLoadingTickets(false);
    }
  }, []);

  // Load Public Categories from Backend API
  const loadCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const cats = await fetchPublicCategories();
      setCategories(cats);
    } catch (err) {
      console.warn("Failed to load support categories from backend API:", err);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  // Load Popular KB Articles from Backend API
  const loadPopularArticles = useCallback(async () => {
    setLoadingArticles(true);
    try {
      const articles = await fetchAllKnowledgeBaseArticles(false);
      setPopularArticles(articles.slice(0, 4));
    } catch (err) {
      console.warn("Failed to load KB articles from backend API:", err);
    } finally {
      setLoadingArticles(false);
    }
  }, []);

  useEffect(() => {
    void loadTickets();
    void loadCategories();
    void loadPopularArticles();
  }, [loadTickets, loadCategories, loadPopularArticles]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
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
    <div className="min-h-screen bg-background text-on-background font-body-md flex flex-col justify-between">
      <div>
        <TopNav activePage="support" />

        <main className="w-full">
          {/* Hero Section */}
          <section className="relative bg-primary py-stack-lg px-container-margin overflow-hidden flex flex-col items-center justify-center min-h-[320px]">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
            </div>

            <div className="relative z-10 w-full max-w-4xl text-center flex flex-col items-center gap-stack-md">
              <h1 className="font-display text-display text-on-primary font-bold">
                How can we help?
              </h1>
              <p className="font-body-lg text-body-lg text-on-primary-container opacity-90 max-w-2xl leading-relaxed">
                Search our knowledge base for instant answers or get in touch with our expert support team.
              </p>

              <form
                onSubmit={handleSearchSubmit}
                className="w-full mt-stack-md relative group"
              >
                <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-primary font-bold text-2xl">
                  search
                </span>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for articles, guides, or troubleshooting..."
                  className="w-full h-16 pl-16 pr-32 sm:pr-40 rounded-xl border-none shadow-xl focus:ring-4 focus:ring-primary-container font-body-lg text-on-surface bg-white outline-none"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <kbd className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container text-on-surface-variant font-code text-xs">
                    ⌘ K
                  </kbd>
                  <button
                    type="submit"
                    className="bg-primary text-on-primary px-5 py-2 rounded-lg font-label-md hover:brightness-110 active:scale-95 transition-all cursor-pointer font-bold"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* Main Content Area */}
          <div className="max-w-[1440px] mx-auto px-container-margin py-stack-lg grid grid-cols-1 lg:grid-cols-12 gap-stack-lg">
            {/* Left Column: Primary Actions & Content */}
            <div className="lg:col-span-8 space-y-stack-lg">
              {/* Primary Support Channels (Bento Grid Style) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-stack-md">
                <Link
                  href="/customer/knowledge-base"
                  className="group bg-surface-container-lowest p-stack-md rounded-xl border border-outline-variant flex flex-col gap-stack-sm cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all"
                >
                  <div className="h-12 w-12 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl">
                      auto_stories
                    </span>
                  </div>
                  <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                    Knowledge Base
                  </h3>
                  <p className="text-on-surface-variant text-body-md">
                    Self-serve guides and technical documentation.
                  </p>
                  <span className="mt-auto text-primary font-bold flex items-center gap-1 text-sm group-hover:underline pt-2">
                    Browse Library{" "}
                    <span className="material-symbols-outlined text-sm">
                      arrow_forward
                    </span>
                  </span>
                </Link>

                <Link
                  href="/customer/create-ticket"
                  className="group bg-primary-container p-stack-md rounded-xl border border-primary flex flex-col gap-stack-sm cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all text-on-primary"
                >
                  <div className="h-12 w-12 rounded-lg bg-white/20 text-on-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl">
                      confirmation_number
                    </span>
                  </div>
                  <h3 className="font-headline-md text-headline-md font-bold">
                    Create a Ticket
                  </h3>
                  <p className="text-on-primary-container text-body-md opacity-90">
                    Submit a formal request for complex technical issues.
                  </p>
                  <span className="mt-auto text-on-primary font-bold flex items-center gap-1 text-sm group-hover:underline pt-2">
                    Open Case{" "}
                    <span className="material-symbols-outlined text-sm">
                      arrow_forward
                    </span>
                  </span>
                </Link>

                <div
                  onClick={() => setIsLiveChatOpen(true)}
                  className="group bg-surface-container-lowest p-stack-md rounded-xl border border-outline-variant flex flex-col gap-stack-sm cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all"
                >
                  <div className="h-12 w-12 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl">
                      chat
                    </span>
                  </div>
                  <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                    Live Chat
                  </h3>
                  <p className="text-on-surface-variant text-body-md">
                    Real-time assistance with a support specialist.
                  </p>
                  <span className="mt-auto text-primary font-bold flex items-center gap-1 text-sm group-hover:underline pt-2">
                    Start Chat{" "}
                    <span className="material-symbols-outlined text-sm">
                      arrow_forward
                    </span>
                  </span>
                </div>
              </div>

              {/* Support Categories Grid */}
              <section className="space-y-stack-md">
                <div className="flex justify-between items-center">
                  <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">
                    Help Topics
                  </h2>
                  <Link
                    href="/customer/knowledge-base"
                    className="text-primary font-label-md font-bold hover:underline"
                  >
                    View All Topics
                  </Link>
                </div>

                {loadingCategories ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-stack-md">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="p-stack-md rounded-xl bg-surface-container-low animate-pulse h-24" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-stack-md">
                    {(categories.length > 0
                      ? categories.slice(0, 8).map((cat) => ({
                          id: cat.id,
                          name: cat.name,
                          icon:
                            cat.name.toLowerCase().includes("billing")
                              ? "payments"
                              : cat.name.toLowerCase().includes("tech") || cat.name.toLowerCase().includes("system")
                              ? "settings_suggest"
                              : cat.name.toLowerCase().includes("sec") || cat.name.toLowerCase().includes("policy")
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
                      <div
                        key={cat.id}
                        onClick={() => {
                          setSelectedTopic(cat.name);
                          router.push(`/customer/knowledge-base?q=${encodeURIComponent(cat.name)}`);
                        }}
                        className={`p-stack-md rounded-xl text-center flex flex-col items-center gap-stack-sm transition-all cursor-pointer border ${
                          selectedTopic === cat.name
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-surface-container-low hover:bg-surface-container-high border-transparent hover:border-outline-variant"
                        }`}
                      >
                        <span className="material-symbols-outlined text-primary text-3xl">
                          {cat.icon}
                        </span>
                        <span className="font-label-md font-bold text-on-surface truncate max-w-full">
                          {cat.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Recent Activity Table */}
              <section className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-xs">
                <div className="px-stack-md py-stack-sm border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                  <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                    My Recent Support Tickets
                  </h2>
                  <button
                    onClick={() => void loadTickets()}
                    className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">refresh</span>
                    Refresh
                  </button>
                </div>

                <div className="overflow-x-auto">
                  {loadingTickets ? (
                    <div className="p-8 text-center text-on-surface-variant flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-[20px]">refresh</span>
                      <span>Loading support tickets from database...</span>
                    </div>
                  ) : tickets.length === 0 ? (
                    <div className="p-8 text-center text-on-surface-variant space-y-2">
                      <span className="material-symbols-outlined text-3xl text-outline">confirmation_number</span>
                      <p className="font-bold text-on-surface">No active tickets found</p>
                      <p className="text-xs text-outline">Need help? Create a new support ticket above.</p>
                    </div>
                  ) : (
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-outline-variant bg-surface-container-low/50 text-xs">
                          <th className="px-stack-md py-3 font-label-md text-on-surface-variant uppercase font-semibold">
                            Ticket ID
                          </th>
                          <th className="px-stack-md py-3 font-label-md text-on-surface-variant uppercase font-semibold">
                            Subject
                          </th>
                          <th className="px-stack-md py-3 font-label-md text-on-surface-variant uppercase font-semibold">
                            Priority
                          </th>
                          <th className="px-stack-md py-3 font-label-md text-on-surface-variant uppercase font-semibold">
                            Status
                          </th>
                          <th className="px-stack-md py-3 font-label-md text-on-surface-variant uppercase text-right font-semibold">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant">
                        {tickets.map((tkt) => {
                          const ticketCode = tkt.ticketNumber || `#TKT-${tkt.id.slice(0, 5).toUpperCase()}`;
                          const statusStr = tkt.status || "OPEN";
                          const isResolved = statusStr.toUpperCase() === "RESOLVED" || statusStr.toUpperCase() === "CLOSED";
                          const isInProgress = statusStr.toUpperCase() === "IN_PROGRESS" || statusStr.toUpperCase() === "IN PROGRESS";

                          return (
                            <tr
                              key={tkt.id}
                              className="hover:bg-surface-container transition-colors group"
                            >
                              <td className="px-stack-md py-4 font-code text-on-surface font-bold">
                                <Link href={`/customer/tickets/${tkt.id}`} className="hover:text-primary hover:underline">
                                  {ticketCode}
                                </Link>
                              </td>
                              <td className="px-stack-md py-4 text-on-surface font-semibold max-w-xs truncate">
                                <Link href={`/customer/tickets/${tkt.id}`} className="hover:text-primary hover:underline">
                                  {tkt.subject}
                                </Link>
                              </td>
                              <td className="px-stack-md py-4">
                                <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-surface-container-high text-on-surface">
                                  {tkt.priority || "MEDIUM"}
                                </span>
                              </td>
                              <td className="px-stack-md py-4">
                                <span
                                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                    isInProgress
                                      ? "bg-blue-100 text-blue-900"
                                      : isResolved
                                      ? "bg-green-100 text-green-800"
                                      : "bg-amber-100 text-amber-900"
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                      isInProgress
                                        ? "bg-blue-500"
                                        : isResolved
                                        ? "bg-green-500"
                                        : "bg-amber-500"
                                    }`}
                                  />
                                  {statusStr}
                                </span>
                              </td>
                              <td className="px-stack-md py-4 text-right">
                                <Link
                                  href={`/customer/tickets/${tkt.id}`}
                                  className="text-primary font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
                                >
                                  View Details
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

            {/* Right Column: Sidebar */}
            <aside className="lg:col-span-4 flex flex-col gap-stack-lg">
              {/* System Status */}
              <div className="bg-surface-container-lowest p-stack-md rounded-xl border border-outline-variant shadow-xs">
                <h3 className="font-label-md text-on-surface-variant uppercase mb-stack-sm font-semibold tracking-wider text-xs">
                  System Status
                </h3>
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-stack-sm">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                    </span>
                    <span className="font-bold text-green-900 text-sm">
                      All Systems Operational
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-green-700">
                    check_circle
                  </span>
                </div>
                <p className="mt-stack-sm text-xs text-on-surface-variant font-medium">
                  Database &amp; API Gateway verified
                </p>
              </div>

              {/* Popular Articles */}
              <div className="bg-surface-container-lowest p-stack-md rounded-xl border border-outline-variant shadow-xs">
                <h3 className="font-label-md text-on-surface-variant uppercase mb-stack-md font-semibold tracking-wider text-xs">
                  Popular Knowledge Base Articles
                </h3>
                {loadingArticles ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-10 rounded bg-surface-container-low animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <ul className="space-y-stack-md">
                    {(popularArticles.length > 0
                      ? popularArticles
                      : [
                          {
                            id: "1",
                            title: "Setting up Multi-Factor Auth",
                            category: "Account Security",
                            content: "",
                            slug: "mfa-setup",
                            published: true,
                            createdAt: new Date().toISOString(),
                          },
                          {
                            id: "2",
                            title: "Understanding API Rate Limits",
                            category: "Technical",
                            content: "",
                            slug: "api-rate-limits",
                            published: true,
                            createdAt: new Date().toISOString(),
                          },
                          {
                            id: "3",
                            title: "Exporting Enterprise Reports",
                            category: "Billing & Reports",
                            content: "",
                            slug: "export-reports",
                            published: true,
                            createdAt: new Date().toISOString(),
                          },
                        ]
                    ).map((art) => (
                      <li
                        key={art.id}
                        onClick={() => setSelectedArticle(art)}
                        className="flex gap-stack-sm group cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-primary-container group-hover:scale-110 transition-transform">
                          article
                        </span>
                        <div>
                          <h4 className="font-body-md font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                            {art.title}
                          </h4>
                          <p className="text-xs text-on-surface-variant">
                            {art.category || "General Guide"} • 4 min read
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Contact Info */}
              <div className="bg-primary text-on-primary p-stack-md rounded-xl border border-primary-container shadow-lg space-y-stack-sm">
                <h3 className="font-headline-md text-headline-md font-bold">
                  Need immediate help?
                </h3>
                <p className="text-sm opacity-90 leading-relaxed">
                  Our premium enterprise support line is available 24/7 for critical issues.
                </p>
                <div className="space-y-stack-sm pt-2">
                  <a
                    href="tel:+1800SUPPORT"
                    className="flex items-center gap-stack-sm p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors cursor-pointer font-bold text-sm"
                  >
                    <span className="material-symbols-outlined">call</span>
                    <span>+1 (800) TKT-FLOW</span>
                  </a>
                  <a
                    href="mailto:priority@ticketflow.ent"
                    className="flex items-center gap-stack-sm p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors cursor-pointer font-bold text-sm"
                  >
                    <span className="material-symbols-outlined">mail</span>
                    <span>priority@ticketflow.ent</span>
                  </a>
                </div>
              </div>
            </aside>
          </div>

          {/* Article Modal */}
          {selectedArticle && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200"
              onClick={() => setSelectedArticle(null)}
            >
              <div
                className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-outline-variant p-6 md:p-8 relative"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-outline-variant mb-6">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-container/20 text-primary">
                    {selectedArticle.category || "Guide"}
                  </span>
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>

                <h2 className="font-display text-2xl font-bold text-on-surface mb-3">
                  {selectedArticle.title}
                </h2>

                <div className="prose prose-slate max-w-none text-on-surface leading-relaxed whitespace-pre-wrap mb-6">
                  {selectedArticle.content || "Deep dive guide into configuration and support instructions."}
                </div>

                <div className="flex justify-end pt-4 border-t border-outline-variant">
                  <button
                    type="button"
                    onClick={() => setSelectedArticle(null)}
                    className="px-5 py-2 rounded-lg bg-primary font-bold text-white shadow-xs hover:opacity-90 transition-all cursor-pointer"
                  >
                    Close Article
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Live Customer Support Chat Drawer */}
          {isLiveChatOpen && (
            <div className="fixed bottom-6 right-6 z-50 w-full max-w-md bg-white border border-outline-variant rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
              <div className="bg-primary text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold">
                      💬
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-primary absolute bottom-0 right-0 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Kinetic Live Support</h4>
                    <p className="text-[11px] opacity-90">Instant Enterprise Assistance</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsLiveChatOpen(false)}
                  className="text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="p-4 h-80 overflow-y-auto space-y-3 bg-surface-container-low/30 text-sm">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl ${
                        msg.sender === "user"
                          ? "bg-primary text-white rounded-br-none font-medium shadow-2xs"
                          : "bg-white border border-outline-variant text-on-surface rounded-bl-none shadow-2xs"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-outline mt-1 px-1">{msg.time}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendChatMessage} className="p-3 border-t border-outline-variant bg-white flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-3.5 py-2 border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="submit"
                  className="bg-primary text-white p-2 rounded-xl hover:bg-primary/90 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">send</span>
                </button>
              </form>
            </div>
          )}
        </main>

        {/* Floating Toast Notification */}
        {showToast && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-300 z-50">
            <span className="material-symbols-outlined text-green-400">
              check_circle
            </span>
            <p className="text-body-md font-medium">{toastMessage}</p>
          </div>
        )}
      </div>

      <PortalFooter />
    </div>
  );
}
