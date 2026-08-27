"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { TopNav } from "@/src/components/portal/TopNav";
import { PortalFooter } from "@/src/components/portal/PortalFooter";
import { CreateTicketTrigger } from "@/src/components/portal/CreateTicketModal";
import {
  fetchAllKnowledgeBaseArticles,
  fetchPublicCategories,
  KnowledgeBaseArticleRecord,
} from "@/src/services/portalService";

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [articles, setArticles] = useState<KnowledgeBaseArticleRecord[]>([]);
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

  const toggleBookmark = (id: string, title: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setToastMessage(`Removed "${title}" from bookmarked articles.`);
      } else {
        next.add(id);
        setToastMessage(`Saved "${title}" to your bookmarked articles!`);
      }
      setTimeout(() => setToastMessage(null), 3000);
      return next;
    });
  };

  useEffect(() => {
    fetchPublicCategories()
      .then((cats) => {
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
    setIsLoading(true);
    fetchAllKnowledgeBaseArticles(false, searchQuery)
      .then((data) => setArticles(data))
      .catch((err) => console.error("Failed to load KB articles:", err))
      .finally(() => setIsLoading(false));
  }, [searchQuery]);

  // Keyboard shortcut: Press '/' to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const [showStatusModal, setShowStatusModal] = useState(false);

  const helpTopics = [
    {
      icon: "payments",
      title: "Billing",
      desc: "Invoices, plans, and usage",
      category: "billing",
    },
    {
      icon: "settings",
      title: "Technical",
      desc: "Setup and troubleshooting",
      category: "technical",
    },
    {
      icon: "admin_panel_settings",
      title: "Account Security",
      desc: "2FA, SSO, and permissions",
      category: "account",
    },
    {
      icon: "api",
      title: "API Documentation",
      desc: "Integrations and webhooks",
      category: "feature",
    },
  ];

  const filteredArticles = articles.filter((art) => {
    if (selectedCategory === "All") return true;
    return (art.category || "Troubleshooting").toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface antialiased">
      <TopNav activePage="knowledge-base" />

      <main>
        {/* ── HERO SECTION ── */}
        <section
          className="relative overflow-hidden py-24 md:py-32"
          style={{
            background: "radial-gradient(circle at top right, #e7eeff 0%, #f9f9ff 100%)",
          }}
        >
          <div className="relative z-10 mx-auto max-w-[1440px] px-container-margin text-center">
            <h1 className="font-display text-display text-on-surface mb-6 tracking-tight">
              How can we help you today?
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-10">
              Search our comprehensive enterprise knowledge base or browse support topics to optimize your Kinetic TMS workflow.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative group">
              <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                search
              </span>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for documentation, guides, and more..."
                className="w-full pl-14 pr-32 py-5 rounded-xl border border-outline-variant bg-white shadow-lg focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-body-lg outline-none"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:block">
                <span className="px-2.5 py-1 bg-surface-container rounded text-label-md text-on-surface-variant border border-outline-variant">
                  Press / to search
                </span>
              </div>
            </div>
          </div>

          {/* Background Atmosphere */}
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-50 pointer-events-none">
            <div className="w-full h-full bg-gradient-to-l from-primary-fixed to-transparent" />
          </div>
        </section>

        {/* ── PRIMARY ACTIONS CARDS ── */}
        <section className="max-w-[1440px] mx-auto px-container-margin -mt-12 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Browse Knowledge Base */}
            <div
              onClick={() => {
                document.getElementById("articles-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-white/80 backdrop-blur-md border border-slate-200/80 p-8 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 bg-primary-container/10 text-primary rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  menu_book
                </span>
              </div>
              <h3 className="font-headline-md text-headline-md mb-2">Browse Knowledge Base</h3>
              <p className="text-on-surface-variant font-body-md mb-4">
                Deep dive into technical documentation, API references, and configuration guides.
              </p>
              <span className="text-primary font-label-md flex items-center gap-1 group-hover:gap-2 transition-all">
                Explore Docs <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </span>
            </div>

            {/* Card 2: Check System Status */}
            <div
              onClick={() => setShowStatusModal(true)}
              className="bg-white/80 backdrop-blur-md border border-slate-200/80 border-t-4 border-t-primary p-8 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 bg-primary-container/10 text-primary rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  analytics
                </span>
              </div>
              <h3 className="font-headline-md text-headline-md mb-2">Check System Status</h3>
              <p className="text-on-surface-variant font-body-md mb-4">
                Monitor real-time system performance and uptime statistics for all global regions.
              </p>
              <div className="flex items-center gap-2 text-[#16a34a] font-label-md">
                <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse" />
                All Systems Operational
              </div>
            </div>

            {/* Card 3: Contact Support */}
            <Link
              href="/customer/support"
              className="bg-white/80 backdrop-blur-md border border-slate-200/80 p-8 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all group cursor-pointer block"
            >
              <div className="w-12 h-12 bg-primary-container/10 text-primary rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  support_agent
                </span>
              </div>
              <h3 className="font-headline-md text-headline-md mb-2">Contact Sales/Support</h3>
              <p className="text-on-surface-variant font-body-md mb-4">
                Need personalized assistance? Our enterprise support team is available 24/7.
              </p>
              <span className="text-primary font-label-md flex items-center gap-1 group-hover:gap-2 transition-all">
                Get in Touch <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </span>
            </Link>
          </div>
        </section>

        {/* ── KNOWLEDGE BASE ARTICLES SECTION ── */}
        <section id="articles-section" className="py-20 max-w-[1440px] mx-auto px-container-margin">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-label-md uppercase tracking-wider mb-2">
                <span className="material-symbols-outlined text-[18px]">menu_book</span>
                <span>Documentation & Guides</span>
              </div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">
                {searchQuery ? `Search Results for "${searchQuery}"` : "Published Support Articles"}
              </h2>
              <p className="text-on-surface-variant font-body-md">
                Browse official documentation written and maintained by Kinetic support engineers.
              </p>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-label-md font-semibold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-primary text-white shadow-sm"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high border border-outline-variant"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="py-16 text-center bg-surface-container-lowest border border-outline-variant rounded-2xl">
              <div className="flex items-center justify-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined animate-spin text-[24px]">refresh</span>
                <span className="font-medium text-body-lg">Loading articles...</span>
              </div>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="py-16 text-center bg-surface-container-lowest border border-outline-variant rounded-2xl px-6">
              <span className="material-symbols-outlined text-[48px] text-outline mb-3">search_off</span>
              <h3 className="font-headline-md text-on-surface mb-1">No articles found</h3>
              <p className="text-on-surface-variant text-body-md max-w-md mx-auto">
                We couldn&apos;t find any published articles matching your criteria. Try adjusting your search query or category filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((art) => {
                const authorName = art.createdBy?.fullName || art.createdBy?.name || "Support Engineer";
                const dateStr = art.createdAt
                  ? new Date(art.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Recently";

                const badgeStyle =
                  art.category === "Troubleshooting"
                    ? "bg-blue-100 text-blue-800 border-blue-200"
                    : art.category === "Policy"
                    ? "bg-purple-100 text-purple-800 border-purple-200"
                    : art.category === "Systems"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                    : "bg-slate-100 text-slate-800 border-slate-200";

                const readTime = `${Math.max(2, Math.ceil((art.content?.length || 250) / 300))} min read`;
                const isBookmarked = bookmarks.has(art.id);

                return (
                  <div
                    key={art.id}
                    onClick={() => setSelectedArticle(art)}
                    className="bg-white border border-outline-variant rounded-xl p-6 shadow-xs hover:shadow-md hover:border-primary/50 transition-all cursor-pointer flex flex-col justify-between group relative"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeStyle}`}>
                            {art.category || "Troubleshooting"}
                          </span>
                          <span className="text-[11px] font-semibold text-outline bg-surface-container px-2 py-0.5 rounded flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">schedule</span>
                            {readTime}
                          </span>
                        </div>
                        <button
                          onClick={(e) => toggleBookmark(art.id, art.title, e)}
                          className={`p-1 rounded-md transition-colors cursor-pointer ${
                            isBookmarked ? "text-amber-500 bg-amber-50" : "text-outline hover:text-primary hover:bg-surface-container"
                          }`}
                          title={isBookmarked ? "Remove Bookmark" : "Save Article"}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {isBookmarked ? "bookmark_added" : "bookmark"}
                          </span>
                        </button>
                      </div>
                      <h3 className="font-headline-md text-[18px] text-on-surface font-bold group-hover:text-primary transition-colors mb-2 line-clamp-2">
                        {art.title}
                      </h3>
                      <p className="text-on-surface-variant text-body-md line-clamp-3 mb-4 leading-relaxed">
                        {art.content}
                      </p>
                    </div>
                    <div className="pt-4 border-t border-outline-variant flex items-center justify-between text-xs text-on-surface-variant">
                      <span>By {authorName}</span>
                      <span className="font-medium text-outline">{dateStr}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── HELP CATEGORIES BENTO GRID ── */}
        <section className="py-24 max-w-[1440px] mx-auto px-container-margin">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Help Categories</h2>
              <p className="text-on-surface-variant">Find exactly what you need with our organized support tracks.</p>
            </div>
            <CreateTicketTrigger className="text-primary font-label-md hover:underline cursor-pointer">
              View All Topics
            </CreateTicketTrigger>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {helpTopics.map(({ icon, title, desc }) => (
              <CreateTicketTrigger
                key={title}
                className="bg-white border border-outline-variant p-6 rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer group text-left block"
              >
                <span className="material-symbols-outlined text-primary text-3xl mb-4 group-hover:rotate-12 transition-transform block">
                  {icon}
                </span>
                <h4 className="font-headline-md text-[18px] mb-1">{title}</h4>
                <p className="text-on-surface-variant text-label-md">{desc}</p>
              </CreateTicketTrigger>
            ))}
          </div>
        </section>

        {/* ── WHY KINETIC? SECTION ── */}
        <section className="bg-inverse-surface text-inverse-on-surface py-24">
          <div className="max-w-[1440px] mx-auto px-container-margin grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-display text-display mb-6">Why Kinetic?</h2>
              <p className="font-body-lg text-body-lg text-secondary-fixed-dim mb-12">
                Designed for mission-critical operations, Kinetic Enterprise TMS provides the backbone for the world's most resilient support teams.
              </p>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-white">verified_user</span>
                  </div>
                  <div>
                    <h4 className="font-headline-md text-headline-md mb-1">Enterprise-Grade Security</h4>
                    <p className="text-secondary-fixed-dim">
                      SOC2 Type II certified with native SAML/SSO integrations and role-based access control (RBAC).
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-white">public</span>
                  </div>
                  <div>
                    <h4 className="font-headline-md text-headline-md mb-1">24/7 Global Support</h4>
                    <p className="text-secondary-fixed-dim">
                      Dedicated TAMs and follow-the-sun support cycles ensuring you're never more than 5 minutes away from an expert.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl relative">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQjjoOf2Hxb451IXsBJQZ0U-AoPit0M0Bh8p0ZGAQGMZPsSCNzVV9Lz27fXVAZ4EUwRrMJB9vUgs6HMhHEYxrWRJh1mRYMAkg71hjYqTQPgkDJi094id0Qt0P_1aZF9_sut16ISDdPS3Z7Tgol6O-wczuLKbP9BrJRsvhLhImeT03RFhJ5y5jRVABbUJteScy4Y9I69-QmXmzIANdInZznNCRCPopW5S4poe3uWTQYoO6-DIBNpI9yNWlePGS9rqs0s3Civh3o8wPt"
                  alt="Kinetic TMS dashboard visualization"
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-primary/20 mix-blend-overlay" />
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl hidden md:block border border-outline-variant">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">K</div>
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-300 flex items-center justify-center text-xs font-bold text-slate-700">T</div>
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-400 flex items-center justify-center text-xs font-bold text-slate-700">M</div>
                  </div>
                  <div>
                    <p className="text-on-surface font-label-md">Trusted by</p>
                    <p className="text-primary font-bold">500+ Enterprises</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA SECTION ── */}
        <section className="py-24 max-w-[1440px] mx-auto px-container-margin text-center">
          <div className="bg-primary-container rounded-[2rem] py-16 px-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="font-display text-display mb-4">Ready to get started?</h2>
              <p className="font-body-lg text-body-lg text-primary-fixed opacity-90 mb-10 max-w-xl mx-auto">
                Join the future of ticketing management today. Scalable, secure, and built for your enterprise.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <CreateTicketTrigger className="bg-white text-primary font-headline-md px-10 py-4 rounded-xl hover:bg-opacity-95 transition-all shadow-lg cursor-pointer">
                  Submit a Ticket
                </CreateTicketTrigger>
                <Link
                  href="/customer/support"
                  className="border-2 border-primary-fixed text-primary-fixed font-headline-md px-10 py-4 rounded-xl hover:bg-white/10 transition-all"
                >
                  Contact Support
                </Link>
              </div>
            </div>

            {/* Subtle background grid pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid-bg" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-bg)" />
              </svg>
            </div>
          </div>
        </section>

        {/* ── ARTICLE READER MODAL ── */}
        {selectedArticle && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200"
            onClick={() => setSelectedArticle(null)}
          >
            <div
              className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-outline-variant p-6 md:p-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-outline-variant mb-6">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-container/20 text-primary">
                    {selectedArticle.category || "Troubleshooting"}
                  </span>
                  <span className="font-code text-xs text-outline">
                    Ref: #{selectedArticle.slug ? selectedArticle.slug.slice(selectedArticle.slug.lastIndexOf("-") + 1).toUpperCase() : selectedArticle.id.slice(0, 8)}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <h2 className="font-display text-2xl md:text-3xl font-bold text-on-surface mb-3">
                {selectedArticle.title}
              </h2>

              <div className="flex items-center gap-4 text-xs text-on-surface-variant mb-6 pb-4 border-b border-outline-variant">
                <span>
                  Author: <strong>{selectedArticle.createdBy?.fullName || selectedArticle.createdBy?.name || "Support Engineer"}</strong>
                </span>
                <span>•</span>
                <span>
                  Updated:{" "}
                  <strong>
                    {selectedArticle.createdAt
                      ? new Date(selectedArticle.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Recently"}
                  </strong>
                </span>
              </div>

              <div className="prose prose-slate max-w-none font-body-lg text-on-surface leading-relaxed whitespace-pre-wrap mb-8">
                {selectedArticle.content}
              </div>

              {/* Helpful Feedback Bar */}
              <div className="mt-8 pt-6 border-t border-outline-variant bg-surface-container-lowest p-4 rounded-xl flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-body-md font-semibold text-on-surface">
                    Was this article helpful?
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setHelpfulFeedback((prev) => ({
                          ...prev,
                          [selectedArticle.id]: "yes",
                        }))
                      }
                      className={`px-4 py-1.5 rounded-lg border text-label-md font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        helpfulFeedback[selectedArticle.id] === "yes"
                          ? "bg-green-600 text-white border-green-600"
                          : "border-outline-variant text-on-surface hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">thumb_up</span>
                      <span>Yes</span>
                    </button>
                    <button
                      onClick={() =>
                        setHelpfulFeedback((prev) => ({
                          ...prev,
                          [selectedArticle.id]: "no",
                        }))
                      }
                      className={`px-4 py-1.5 rounded-lg border text-label-md font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        helpfulFeedback[selectedArticle.id] === "no"
                          ? "bg-red-600 text-white border-red-600"
                          : "border-outline-variant text-on-surface hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">thumb_down</span>
                      <span>No</span>
                    </button>
                  </div>
                </div>

                {helpfulFeedback[selectedArticle.id] === "no" && (
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center justify-between gap-3 text-xs text-amber-900 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-600 text-sm">info</span>
                      <span>Sorry this guide didn&apos;t answer your question. Need further assistance?</span>
                    </div>
                    <CreateTicketTrigger className="px-3 py-1 bg-amber-600 text-white font-bold rounded hover:bg-amber-700 transition-colors whitespace-nowrap cursor-pointer">
                      Submit Support Ticket
                    </CreateTicketTrigger>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── SYSTEM STATUS MODAL ── */}
        {showStatusModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200"
            onClick={() => setShowStatusModal(false)}
          >
            <div
              className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-outline-variant p-6 md:p-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-outline-variant mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <h3 className="font-bold text-headline-sm text-on-surface">Kinetic Global System Status</h3>
                </div>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-3.5 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-green-600">dns</span>
                    <div>
                      <p className="font-bold text-body-md text-green-900">API Gateway & REST Routes</p>
                      <p className="text-xs text-green-700">Port 8000 • Response time ~12ms</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-200 text-green-900">Operational</span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-green-600">database</span>
                    <div>
                      <p className="font-bold text-body-md text-green-900">PostgreSQL Engine (Local)</p>
                      <p className="text-xs text-green-700">Port 5431 • db_tms active</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-200 text-green-900">Operational</span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-green-600">sync_alt</span>
                    <div>
                      <p className="font-bold text-body-md text-green-900">Realtime Socket.io Gateway</p>
                      <p className="text-xs text-green-700">Live ticket updates & notifications</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-200 text-green-900">Operational</span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-green-600">verified_user</span>
                    <div>
                      <p className="font-bold text-body-md text-green-900">Auth & Google OAuth</p>
                      <p className="text-xs text-green-700">JWT Token verification active</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-200 text-green-900">Operational</span>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-5 py-2 rounded-lg bg-primary font-bold text-white shadow-xs hover:opacity-90 transition-all cursor-pointer"
                >
                  Close Status
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
