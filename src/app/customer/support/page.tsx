"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { TopNav } from "@/src/components/portal/TopNav";

interface SupportTicketSummary {
  id: string;
  subject: string;
  status: "In Progress" | "Resolved" | "Closed";
}

export default function CustomerSupportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const tickets: SupportTicketSummary[] = [
    {
      id: "#TKT-4921",
      subject: "API Integration Latency Issues",
      status: "In Progress",
    },
    {
      id: "#TKT-3810",
      subject: "Billing dispute - March Invoice",
      status: "Resolved",
    },
    { id: "#TKT-3750", subject: "2FA reset request", status: "Closed" },
  ];

  // Cmd+K shortcut listener
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

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      triggerToast(`Searching support articles for "${searchQuery.trim()}"...`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background font-body-md">
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
              Search our knowledge base for instant answers or get in touch with
              our expert support team.
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
                onClick={() =>
                  triggerToast("Connecting you to a live support specialist...")
                }
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-stack-md">
                {[
                  { name: "Billing", icon: "payments" },
                  { name: "Technical", icon: "settings_suggest" },
                  { name: "Security", icon: "verified_user" },
                  { name: "Onboarding", icon: "rocket_launch" },
                ].map((cat) => (
                  <div
                    key={cat.name}
                    onClick={() => {
                      setSelectedTopic(cat.name);
                      triggerToast(`Filtered help articles for '${cat.name}'`);
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
                    <span className="font-label-md font-bold text-on-surface">
                      {cat.name}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Recent Activity Table */}
            <section className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-xs">
              <div className="px-stack-md py-stack-sm border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                  My Recent Support Tickets
                </h2>
                <span className="text-xs text-on-surface-variant font-medium">
                  Last 30 Days
                </span>
              </div>
              <div className="overflow-x-auto">
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
                        Status
                      </th>
                      <th className="px-stack-md py-3 font-label-md text-on-surface-variant uppercase text-right font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {tickets.map((tkt) => (
                      <tr
                        key={tkt.id}
                        className="hover:bg-surface-container transition-colors group"
                      >
                        <td className="px-stack-md py-4 font-code text-on-surface font-bold">
                          {tkt.id}
                        </td>
                        <td className="px-stack-md py-4 text-on-surface font-semibold">
                          {tkt.subject}
                        </td>
                        <td className="px-stack-md py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                              tkt.status === "In Progress"
                                ? "bg-surface-container-high text-on-secondary-container"
                                : tkt.status === "Resolved"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                tkt.status === "In Progress"
                                  ? "bg-primary"
                                  : tkt.status === "Resolved"
                                    ? "bg-green-500"
                                    : "bg-gray-500"
                              }`}
                            />
                            {tkt.status}
                          </span>
                        </td>
                        <td className="px-stack-md py-4 text-right">
                          <Link
                            href="/customer/dashboard"
                            className="text-primary font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                Last updated: 2 minutes ago
              </p>
            </div>

            {/* Popular Articles */}
            <div className="bg-surface-container-lowest p-stack-md rounded-xl border border-outline-variant shadow-xs">
              <h3 className="font-label-md text-on-surface-variant uppercase mb-stack-md font-semibold tracking-wider text-xs">
                Popular Articles
              </h3>
              <ul className="space-y-stack-md">
                {[
                  {
                    title: "Setting up Multi-Factor Auth",
                    views: "2.4k views • 5 min read",
                  },
                  {
                    title: "Understanding API Rate Limits",
                    views: "1.8k views • 8 min read",
                  },
                  {
                    title: "Exporting Enterprise Reports",
                    views: "1.1k views • 4 min read",
                  },
                ].map((art) => (
                  <li
                    key={art.title}
                    onClick={() =>
                      triggerToast(`Opening article: '${art.title}'`)
                    }
                    className="flex gap-stack-sm group cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-primary-container group-hover:scale-110 transition-transform">
                      article
                    </span>
                    <div>
                      <h4 className="font-body-md font-semibold text-on-surface group-hover:text-primary transition-colors">
                        {art.title}
                      </h4>
                      <p className="text-xs text-on-surface-variant">
                        {art.views}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="bg-primary text-on-primary p-stack-md rounded-xl border border-primary-container shadow-lg space-y-stack-sm">
              <h3 className="font-headline-md text-headline-md font-bold">
                Need immediate help?
              </h3>
              <p className="text-sm opacity-90 leading-relaxed">
                Our premium enterprise support line is available 24/7 for
                critical issues.
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
  );
}
