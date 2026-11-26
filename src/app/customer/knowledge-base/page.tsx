"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  FolderOpen,
  Headphones,
  LifeBuoy,
  Plus,
  Search,
  Server,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import { TopNav } from "@/src/components/portal/TopNav";
import { PortalFooter } from "@/src/components/portal/PortalFooter";
import {
  fetchAllKnowledgeBaseArticles,
  fetchPublicCategories,
  KnowledgeBaseArticleRecord,
  BackendCategory,
} from "@/src/services/portalService";

function getCategoryMeta(name: string, departmentName?: string) {
  const lower = name.toLowerCase();
  if (lower.includes("bill") || lower.includes("pay") || lower.includes("invoic")) {
    return {
      icon: "payments",
      desc: departmentName ? `${departmentName} · Plans & invoices` : "Invoices, plans, and billing",
    };
  }
  if (lower.includes("tech") || lower.includes("it") || lower.includes("hard") || lower.includes("system")) {
    return {
      icon: "settings",
      desc: departmentName ? `${departmentName} · Setup & systems` : "Setup and troubleshooting",
    };
  }
  if (lower.includes("sec") || lower.includes("account") || lower.includes("auth") || lower.includes("pass")) {
    return {
      icon: "admin_panel_settings",
      desc: departmentName ? `${departmentName} · Security & SSO` : "2FA, SSO, and permissions",
    };
  }
  if (lower.includes("api") || lower.includes("integ") || lower.includes("dev") || lower.includes("code")) {
    return {
      icon: "api",
      desc: departmentName ? `${departmentName} · Developer tools` : "Integrations and webhooks",
    };
  }
  return {
    icon: "folder_open",
    desc: departmentName ? `${departmentName} guides` : "Helpful guides & documentation",
  };
}

const DEFAULT_TOPICS = [
  { id: "billing", name: "Billing", desc: "Invoices, plans, and usage", icon: "payments" },
  { id: "technical", name: "Technical", desc: "Setup and troubleshooting", icon: "settings" },
  { id: "security", name: "Account Security", desc: "2FA, SSO, and permissions", icon: "admin_panel_settings" },
  { id: "api", name: "API Documentation", desc: "Integrations and webhooks", icon: "api" },
];

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [articles, setArticles] = useState<KnowledgeBaseArticleRecord[]>([]);
  const [backendCategories, setBackendCategories] = useState<BackendCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([
    "All",
    "Troubleshooting",
    "Policy",
    "Systems",
    "Billing",
  ]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeBaseArticleRecord | null>(null);
  const [helpfulFeedback, setHelpfulFeedback] = useState<Record<string, "yes" | "no">>({});
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const updateSearchQuery = (nextQuery: string) => {
    setSearchQuery(nextQuery);
    setCurrentPage(1);
  };

  const updateSelectedCategory = (nextCategory: string) => {
    setSelectedCategory(nextCategory);
    setCurrentPage(1);
  };

  // Read optional ?q= param on mount
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const q = new URLSearchParams(window.location.search).get("q");
      if (q) {
        setSearchQuery(q);
        setCurrentPage(1);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const toggleBookmark = (id: string, title: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setToastMessage(`Removed "${title}" from saved articles.`);
      } else {
        next.add(id);
        setToastMessage(`Saved "${title}" for quick access.`);
      }
      setTimeout(() => setToastMessage(null), 3000);
      return next;
    });
  };

  useEffect(() => {
    fetchPublicCategories()
      .then((cats) => {
        setBackendCategories(cats);
        const names = Array.from(
          new Set([
            "All",
            ...cats.map((c) => c.name).filter(Boolean),
            "Troubleshooting",
            "Policy",
            "Systems",
            "Billing",
          ])
        );
        setCategories(names);
      })
      .catch((err) => console.error("Failed to load categories:", err));
  }, []);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      setIsLoading(true);
      fetchAllKnowledgeBaseArticles(false, searchQuery)
        .then((data) => {
          if (!active) return;
          setArticles(data);
          const articleCatNames = data.map((a) => a.category).filter(Boolean) as string[];
          setCategories((prev) => Array.from(new Set([...prev, ...articleCatNames])));
        })
        .catch((err) => console.error("Failed to load KB articles:", err))
        .finally(() => {
          if (active) setIsLoading(false);
        });
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [searchQuery]);

  // '/' focuses search, Escape closes modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "Escape") {
        setSelectedArticle(null);
        setShowStatusModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredArticles = articles.filter((art) => {
    if (selectedCategory === "All") return true;
    return (art.category || "Troubleshooting").toLowerCase() === selectedCategory.toLowerCase();
  });

  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage) || 1;
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <TopNav activePage="knowledge-base" />

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium">
          <CheckCircle2 className="size-4 text-emerald-400 shrink-0" aria-hidden />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1">
        {/* Clean Modern Light Hero */}
        <section className="bg-gradient-to-b from-white via-white to-slate-50 border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <div className="mx-auto max-w-3xl text-center space-y-5">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-semibold">
              <BookOpen className="size-3.5" aria-hidden />
              Self-Service Help Center
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
              How can we help you today?
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
              Search guides, troubleshoot common questions, or open a support ticket with our team.
            </p>

            {/* Clean Search Input */}
            <div className="max-w-2xl mx-auto pt-2">
              <div className="relative flex items-center">
                <Search
                  className="size-5 text-slate-400 absolute left-4 pointer-events-none"
                  aria-hidden
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => updateSearchQuery(e.target.value)}
                  placeholder="Search guides, billing, account security, or API docs..."
                  className="w-full pl-12 pr-24 py-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm sm:text-base shadow-xs focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => updateSearchQuery("")}
                    aria-label="Clear search"
                    className="absolute right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <X className="size-4" />
                  </button>
                ) : (
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-500 font-mono text-xs absolute right-3.5 pointer-events-none">
                    /
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
                <span className="text-slate-500 font-medium">Popular:</span>
                {["SLA Rules", "Telegram Bot Sync", "OAuth 2.0", "Webhooks", "Billing Plans"].map(
                  (tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => updateSearchQuery(tag)}
                      className="px-3 py-1 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-200 transition-colors font-medium cursor-pointer"
                    >
                      {tag}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions Bar */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() =>
                document.getElementById("articles-section")?.scrollIntoView({ behavior: "smooth" })
              }
              className="text-left bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-6 soft-shadow transition-all hover:-translate-y-0.5 flex flex-col gap-3 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <BookOpen className="size-5" aria-hidden />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Browse Documentation</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Step-by-step setup guides, FAQs, and workflow instructions.
                </p>
              </div>
              <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-blue-600">
                View articles <ArrowRight className="size-4" aria-hidden />
              </span>
            </button>

            <Link
              href="/customer/create-ticket"
              className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-6 soft-shadow transition-all hover:-translate-y-0.5 flex flex-col gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                <Plus className="size-5" aria-hidden />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Submit a Support Ticket</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Need help from an engineer? Open a tracked request in seconds.
                </p>
              </div>
              <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-blue-600">
                Create ticket <ArrowRight className="size-4" aria-hidden />
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setShowStatusModal(true)}
              className="text-left bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl p-6 soft-shadow transition-all hover:-translate-y-0.5 flex flex-col gap-3 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Server className="size-5" aria-hidden />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">System Status</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Check live availability across API, realtime chat, and auth.
                </p>
              </div>
              <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden />
                All Systems Operational
              </span>
            </button>
          </div>
        </section>

        {/* Browse by Topic */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12">
          <div className="flex items-end justify-between gap-4 mb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Browse by Topic</h2>
              <p className="text-sm text-slate-600 mt-0.5">
                Pick a category to filter relevant help guides.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                updateSelectedCategory("All");
                document.getElementById("articles-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-sm font-semibold text-blue-600 hover:underline cursor-pointer"
            >
              Show all
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(backendCategories.length > 0
              ? backendCategories.slice(0, 8).map((cat) => {
                  const meta = getCategoryMeta(cat.name, cat.department?.name);
                  return {
                    id: cat.id || cat.name,
                    name: cat.name,
                    desc: meta.desc,
                    icon: meta.icon,
                    department: cat.department?.name,
                  };
                })
              : DEFAULT_TOPICS.map((t) => ({ ...t, department: undefined }))
            ).map((topic) => {
              const isActive =
                selectedCategory.toLowerCase() === topic.name.toLowerCase();
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => {
                    updateSelectedCategory(topic.name);
                    document
                      .getElementById("articles-section")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`text-left p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    isActive
                      ? "bg-blue-50/70 border-blue-400 shadow-xs"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]" aria-hidden>
                      {topic.icon}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 truncate">
                      {topic.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {topic.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Published Help Articles */}
        <section
          id="articles-section"
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {searchQuery
                  ? `Results for "${searchQuery}"`
                  : "Knowledge Base Articles"}
              </h2>
              <p className="text-sm text-slate-600 mt-0.5">
                Clear guides written and maintained by our support engineering team.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => updateSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-slate-900 text-white"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-slate-200 rounded-2xl p-6 h-48 animate-pulse space-y-3"
                >
                  <div className="h-5 w-24 bg-slate-100 rounded-full" />
                  <div className="h-5 w-3/4 bg-slate-100 rounded" />
                  <div className="h-12 w-full bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="py-16 text-center bg-white border border-slate-200 rounded-2xl px-6">
              <FolderOpen className="size-10 text-slate-400 mx-auto mb-3" aria-hidden />
              <h3 className="text-base font-semibold text-slate-900">
                No matching articles found
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto mt-1 mb-5">
                Try clearing your filters or searching with different keywords. Still stuck? Open a ticket directly.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    updateSearchQuery("");
                    updateSelectedCategory("All");
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Reset Filters
                </button>
                <Link
                  href="/customer/create-ticket"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                >
                  Submit Ticket
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginatedArticles.map((art) => {
                  const authorName =
                    art.createdBy?.fullName || art.createdBy?.name || "Support Team";
                  const dateStr = art.createdAt
                    ? new Date(art.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Recently";
                  const readTime = `${Math.max(
                    2,
                    Math.ceil((art.content?.length || 250) / 300)
                  )} min read`;
                  const isBookmarked = bookmarks.has(art.id);

                  return (
                    <article
                      key={art.id}
                      onClick={() => setSelectedArticle(art)}
                      className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-6 soft-shadow hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/70">
                              {art.category || "Guide"}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                              <Clock className="size-3" aria-hidden />
                              {readTime}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => toggleBookmark(art.id, art.title, e)}
                            aria-label={isBookmarked ? "Remove bookmark" : "Save article"}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isBookmarked
                                ? "text-amber-600 bg-amber-50"
                                : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            <Bookmark
                              className={`size-4 ${isBookmarked ? "fill-amber-500" : ""}`}
                            />
                          </button>
                        </div>

                        <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
                          {art.title}
                        </h3>
                        <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                          {art.content}
                        </p>
                      </div>

                      <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <FileText className="size-3.5 text-slate-400" aria-hidden />
                          {authorName}
                        </span>
                        <span>{dateStr}</span>
                      </div>
                    </article>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 disabled:opacity-40 hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 disabled:opacity-40 hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Clean Help CTA Banner */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
          <div className="rounded-2xl bg-slate-900 text-white p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-xl space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-300">
                <ShieldCheck className="size-4" aria-hidden />
                24/7 Customer Care
              </div>
              <h2 className="text-2xl font-bold tracking-tight">
                Can&apos;t find what you&apos;re looking for?
              </h2>
              <p className="text-sm sm:text-base text-slate-300">
                Submit a support request or start a conversation with our team and track progress from your dashboard.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/customer/create-ticket"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
              >
                <Plus className="size-4" aria-hidden />
                Submit a Ticket
              </Link>
              <Link
                href="/customer/support"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition-colors"
              >
                <Headphones className="size-4" aria-hidden />
                Contact Support
              </Link>
            </div>
          </div>
        </section>

        {/* Article Reader Modal */}
        {selectedArticle && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
            onClick={() => setSelectedArticle(null)}
          >
            <div
              className="modal-pop bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 md:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200 mb-6">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    {selectedArticle.category || "Guide"}
                  </span>
                  <span className="font-mono text-xs text-slate-500">
                    #
                    {selectedArticle.slug
                      ? selectedArticle.slug
                          .slice(selectedArticle.slug.lastIndexOf("-") + 1)
                          .toUpperCase()
                      : selectedArticle.id.slice(0, 8)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedArticle(null)}
                  aria-label="Close article"
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                {selectedArticle.title}
              </h2>

              <div className="flex items-center gap-3 text-xs text-slate-500 mb-6 pb-4 border-b border-slate-200">
                <span>
                  By{" "}
                  <strong className="text-slate-700">
                    {selectedArticle.createdBy?.fullName ||
                      selectedArticle.createdBy?.name ||
                      "Support Team"}
                  </strong>
                </span>
                <span aria-hidden>·</span>
                <span>
                  {selectedArticle.createdAt
                    ? new Date(selectedArticle.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Recently updated"}
                </span>
              </div>

              <div className="text-slate-700 text-base leading-relaxed whitespace-pre-wrap mb-8">
                {selectedArticle.content}
              </div>

              <div className="pt-5 border-t border-slate-200 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">
                    Was this article helpful?
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setHelpfulFeedback((prev) => ({
                          ...prev,
                          [selectedArticle.id]: "yes",
                        }))
                      }
                      className={`px-3.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                        helpfulFeedback[selectedArticle.id] === "yes"
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                      }`}
                    >
                      <ThumbsUp className="size-3.5" aria-hidden />
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setHelpfulFeedback((prev) => ({
                          ...prev,
                          [selectedArticle.id]: "no",
                        }))
                      }
                      className={`px-3.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                        helpfulFeedback[selectedArticle.id] === "no"
                          ? "bg-red-600 text-white border-red-600"
                          : "border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-700"
                      }`}
                    >
                      <ThumbsDown className="size-3.5" aria-hidden />
                      No
                    </button>
                  </div>
                </div>

                {helpfulFeedback[selectedArticle.id] === "no" && (
                  <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
                    <span className="inline-flex items-center gap-2">
                      <LifeBuoy className="size-4 text-amber-600 shrink-0" aria-hidden />
                      Still need help? Our team can walk through this with you.
                    </span>
                    <Link
                      href="/customer/create-ticket"
                      className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700 text-center"
                    >
                      Open a Ticket
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* System Status Modal */}
        {showStatusModal && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
            onClick={() => setShowStatusModal(false)}
          >
            <div
              className="modal-pop bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200 mb-5">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h3 className="font-bold text-lg text-slate-900">System Status</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  aria-label="Close status modal"
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { name: "API Gateway & REST Services", detail: "Primary endpoints healthy" },
                  { name: "Database Cluster (PostgreSQL)", detail: "Connected and responsive" },
                  { name: "Live Notifications & Chat", detail: "Socket.io gateway online" },
                  { name: "Authentication & SSO", detail: "JWT & OAuth active" },
                ].map((svc) => (
                  <div
                    key={svc.name}
                    className="flex items-center justify-between p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl"
                  >
                    <div>
                      <p className="font-semibold text-sm text-slate-900">{svc.name}</p>
                      <p className="text-xs text-slate-600">{svc.detail}</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                      Operational
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <PortalFooter />
    </div>
  );
}
