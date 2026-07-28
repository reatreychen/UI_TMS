"use client";

import { useState, useEffect } from "react";

interface KBArticle {
  id: string;
  ref: string;
  title: string;
  category: "Troubleshooting" | "Policy" | "Systems" | "Billing";
  author: string;
  authorInitials: string;
  lastUpdated: string;
  isOutdated?: boolean;
  views: string;
  status: "Published" | "Draft" | "Archived";
  content?: string;
}

export default function AdminKnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [showOutdatedOnly, setShowOutdatedOnly] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewArticle, setPreviewArticle] = useState<KBArticle | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Create Article Form
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<"Troubleshooting" | "Policy" | "Systems">("Troubleshooting");
  const [newContent, setNewContent] = useState("");

  const initialArticles: KBArticle[] = [
    {
      id: "KB-1",
      ref: "KB-20459",
      title: "Troubleshooting Wi-Fi 6E Connectivity",
      category: "Troubleshooting",
      author: "Alex Rivera",
      authorInitials: "AR",
      lastUpdated: "Oct 12, 2026",
      views: "4.2k",
      status: "Published",
      content: "This guide covers diagnostic procedures for 6GHz frequency band handshakes, WPA3 enterprise authentication protocols, and router firmware updates.",
    },
    {
      id: "KB-2",
      ref: "KB-8821",
      title: "Updated Remote Work Stipend Policy",
      category: "Policy",
      author: "Sarah Miller",
      authorInitials: "SM",
      lastUpdated: "Outdated (6m+)",
      isOutdated: true,
      views: "852",
      status: "Published",
      content: "Details regarding hardware allocation allowances, ergonomic home office reimbursements, and monthly internet subvention limits.",
    },
    {
      id: "KB-3",
      ref: "KB-9004",
      title: "Integrating New CRM Webhooks",
      category: "Systems",
      author: "James Dooley",
      authorInitials: "JD",
      lastUpdated: "Just now",
      views: "--",
      status: "Draft",
      content: "Step-by-step developer guide to setting up webhook endpoints, HMAC SHA-256 signature verification, and event payload listeners.",
    },
    {
      id: "KB-4",
      ref: "KB-1022",
      title: "Legacy VPN Setup (v2.4)",
      category: "Systems",
      author: "KB Admin",
      authorInitials: "KB",
      lastUpdated: "Jan 20, 2024",
      views: "12.1k",
      status: "Archived",
      content: "Instructions for deprecated OpenVPN clients. Recommended to migrate to WireGuard enterprise gateway.",
    },
  ];

  const [articles, setArticles] = useState<KBArticle[]>(initialArticles);

  // Global search bar listener
  useEffect(() => {
    const handleSearch = (e: Event) => {
      const customEvt = e as CustomEvent<string>;
      setSearchQuery(customEvt.detail || "");
    };

    window.addEventListener("admin-search", handleSearch);
    return () => window.removeEventListener("admin-search", handleSearch);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const handleArchive = (id: string) => {
    setArticles(
      articles.map((art) => (art.id === id ? { ...art, status: "Archived" } : art))
    );
    triggerToast("Article archived successfully.");
  };

  const handleRestore = (id: string) => {
    setArticles(
      articles.map((art) => (art.id === id ? { ...art, status: "Published" } : art))
    );
    triggerToast("Article restored to published status.");
  };

  const handleDelete = (id: string) => {
    setArticles(articles.filter((art) => art.id !== id));
    triggerToast("Article permanently deleted.");
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created: KBArticle = {
      id: `KB-${articles.length + 1}`,
      ref: `KB-${Math.floor(10000 + Math.random() * 90000)}`,
      title: newTitle.trim(),
      category: newCategory,
      author: "Alex Rivera",
      authorInitials: "AR",
      lastUpdated: "Just now",
      views: "0",
      status: "Published",
      content: newContent.trim() || "Knowledge base documentation article.",
    };

    setArticles([created, ...articles]);
    setNewTitle("");
    setNewContent("");
    setShowCreateModal(false);
    triggerToast(`Created article '${created.title}'!`);
  };

  const filteredArticles = articles.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.author.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "All Categories" || art.category === categoryFilter;

    const matchesOutdated = !showOutdatedOnly || art.isOutdated;

    return matchesSearch && matchesCategory && matchesOutdated;
  });

  return (
    <div className="space-y-stack-lg max-w-[1440px] mx-auto w-full animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">
            Knowledge Base
          </h1>
          <p className="font-body-md text-body-md text-outline mt-1">
            Centralize information to empower customers and support agents.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary-container text-white px-6 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined">add_circle</span>
          <span>Create Article</span>
        </button>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-label-md font-label-md text-outline tracking-wider uppercase font-semibold">
              Total Articles
            </span>
            <span className="material-symbols-outlined text-primary">description</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-on-surface">{articles.length}</span>
            <span className="text-green-600 text-sm font-medium flex items-center">+12%</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-label-md font-label-md text-outline tracking-wider uppercase font-semibold">
              Drafts
            </span>
            <span className="material-symbols-outlined text-amber-500">edit_note</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-on-surface">
              {articles.filter((a) => a.status === "Draft").length}
            </span>
            <span className="text-outline text-sm font-medium">Across categories</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-label-md font-label-md text-outline tracking-wider uppercase font-semibold">
              Under Review
            </span>
            <span className="material-symbols-outlined text-primary">rate_review</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-on-surface">15</span>
            <span className="bg-error-container text-on-error-container px-2 py-0.5 rounded text-[10px] font-bold">
              URGENT
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-xs relative overflow-hidden hover:shadow-md transition-shadow">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-label-md font-label-md text-outline tracking-wider uppercase font-semibold">
                Helpfulness Score
              </span>
              <span className="material-symbols-outlined text-green-600">star</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-on-surface">94%</span>
              <span className="text-outline text-sm font-medium">Customer satisfaction</span>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-green-50 rounded-full -mr-12 -mb-12 opacity-50" />
        </div>
      </div>

      {/* Outdated Articles Warning Section */}
      <div className="bg-error-container/20 border border-error/20 rounded-xl p-gutter flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center text-error flex-shrink-0">
            <span className="material-symbols-outlined text-[24px]">warning</span>
          </div>
          <div>
            <h3 className="font-headline-md text-body-lg font-bold text-on-error-container">
              Outdated Content Review
            </h3>
            <p className="text-body-md text-on-error-container/80 mt-0.5">
              There are articles that haven't been updated in over 6 months. Review them to ensure support accuracy.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setShowOutdatedOnly(!showOutdatedOnly);
            triggerToast(showOutdatedOnly ? "Showing all articles." : "Filtered to outdated articles needing review.");
          }}
          className={`px-4 py-2 border border-error rounded-lg font-semibold transition-colors cursor-pointer flex-shrink-0 ${
            showOutdatedOnly ? "bg-error text-white" : "text-error hover:bg-error/10"
          }`}
        >
          {showOutdatedOnly ? "Show All Articles" : "View All Needs Review"}
        </button>
      </div>

      {/* Articles Table Section */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-gutter border-b border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-bright">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2 text-outline text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="pl-9 pr-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-lg text-body-md font-medium hover:bg-surface-container-high transition-colors cursor-pointer outline-none"
            >
              <option value="All Categories">All Categories</option>
              <option value="Troubleshooting">Troubleshooting</option>
              <option value="Policy">Policy</option>
              <option value="Systems">Systems</option>
            </select>
          </div>
          <div className="text-outline text-body-md font-medium">
            Showing <span className="font-bold text-on-surface">1-{filteredArticles.length}</span> of {articles.length} articles
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-6 py-4 text-label-md font-label-md text-outline uppercase tracking-wider font-semibold">
                  Title
                </th>
                <th className="px-6 py-4 text-label-md font-label-md text-outline uppercase tracking-wider font-semibold">
                  Category
                </th>
                <th className="px-6 py-4 text-label-md font-label-md text-outline uppercase tracking-wider font-semibold">
                  Author
                </th>
                <th className="px-6 py-4 text-label-md font-label-md text-outline uppercase tracking-wider font-semibold">
                  Last Updated
                </th>
                <th className="px-6 py-4 text-label-md font-label-md text-outline uppercase tracking-wider text-center font-semibold">
                  Views
                </th>
                <th className="px-6 py-4 text-label-md font-label-md text-outline uppercase tracking-wider font-semibold">
                  Status
                </th>
                <th className="px-6 py-4 text-label-md font-label-md text-outline uppercase tracking-wider text-right font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-outline">
                    No articles found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredArticles.map((article) => (
                  <tr
                    key={article.id}
                    onClick={() => setPreviewArticle(article)}
                    className="hover:bg-surface-container-low transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-5">
                      <p className="text-body-md font-bold text-on-surface group-hover:text-primary transition-colors">
                        {article.title}
                      </p>
                      <p className="text-xs text-outline font-code">Ref: {article.ref}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          article.category === "Troubleshooting"
                            ? "bg-blue-100 text-blue-700"
                            : article.category === "Policy"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {article.category}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary-container text-[10px] text-white flex items-center justify-center font-bold">
                          {article.authorInitials}
                        </div>
                        <span className="text-body-md font-medium text-on-surface">
                          {article.author}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-body-md">
                      {article.isOutdated ? (
                        <span className="text-error font-medium">{article.lastUpdated}</span>
                      ) : (
                        <span className="text-outline">{article.lastUpdated}</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-body-md text-center font-medium">
                      {article.views}
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold border ${
                          article.status === "Published"
                            ? "bg-green-100 text-green-700 border-green-200"
                            : article.status === "Draft"
                            ? "bg-amber-100 text-amber-700 border-amber-200"
                            : "bg-slate-100 text-slate-500 border-slate-200"
                        }`}
                      >
                        {article.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewArticle(article);
                          }}
                          className="p-1.5 text-outline hover:text-primary transition-colors cursor-pointer"
                          title="Preview"
                        >
                          <span className="material-symbols-outlined text-[20px]">visibility</span>
                        </button>
                        {article.status === "Archived" ? (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRestore(article.id);
                              }}
                              className="p-1.5 text-outline hover:text-primary transition-colors cursor-pointer"
                              title="Restore"
                            >
                              <span className="material-symbols-outlined text-[20px]">unarchive</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(article.id);
                              }}
                              className="p-1.5 text-outline hover:text-error transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArchive(article.id);
                            }}
                            className="p-1.5 text-outline hover:text-error transition-colors cursor-pointer"
                            title="Archive"
                          >
                            <span className="material-symbols-outlined text-[20px]">archive</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between bg-surface-container-low/30 border-t border-outline-variant">
          <button className="px-4 py-2 text-body-md font-semibold text-outline hover:text-on-surface transition-colors flex items-center gap-1 cursor-not-allowed opacity-50">
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            Previous
          </button>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded bg-primary text-white text-xs font-bold">1</button>
            <button className="w-8 h-8 rounded hover:bg-surface-container-high text-xs font-bold">2</button>
            <button className="w-8 h-8 rounded hover:bg-surface-container-high text-xs font-bold">3</button>
            <span className="text-outline">...</span>
            <button className="w-8 h-8 rounded hover:bg-surface-container-high text-xs font-bold">129</button>
          </div>
          <button className="px-4 py-2 text-body-md font-semibold text-primary hover:opacity-80 transition-colors flex items-center gap-1 cursor-pointer">
            Next
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Create Article Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3 mb-4">
              <h3 className="text-headline-md font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">add_circle</span>
                Author Knowledge Base Article
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-outline hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-outline uppercase mb-1">
                  Article Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Configuring Dual-Factor Authentication"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-body-md focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-outline uppercase mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-body-md focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                >
                  <option value="Troubleshooting">Troubleshooting</option>
                  <option value="Policy">Policy</option>
                  <option value="Systems">Systems</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-outline uppercase mb-1">
                  Article Content
                </label>
                <textarea
                  rows={5}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Write clear instructions, steps, or policy parameters..."
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-body-md focus:ring-2 focus:ring-primary outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-body-md font-semibold text-secondary hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-body-md font-semibold bg-primary-container text-white rounded-lg hover:opacity-90 transition-all cursor-pointer shadow-sm"
                >
                  Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Article Preview Modal */}
      {previewArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3 mb-4">
              <div>
                <span className="text-xs font-code text-outline">{previewArticle.ref}</span>
                <h3 className="text-headline-md font-bold text-on-surface">
                  {previewArticle.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewArticle(null)}
                className="text-outline hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4 text-body-md">
              <div className="flex items-center gap-3 text-xs text-outline border-b border-outline-variant pb-3">
                <span>Category: <strong>{previewArticle.category}</strong></span>
                <span>•</span>
                <span>Author: <strong>{previewArticle.author}</strong></span>
                <span>•</span>
                <span>Views: <strong>{previewArticle.views}</strong></span>
              </div>

              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant text-on-surface leading-relaxed">
                {previewArticle.content || "No detailed content body available."}
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  onClick={() => setPreviewArticle(null)}
                  className="px-5 py-2 text-body-md font-semibold bg-primary text-white rounded-lg hover:opacity-90 cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-200">
          <span className="material-symbols-outlined text-green-400">check_circle</span>
          <p className="text-body-md font-medium">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}
