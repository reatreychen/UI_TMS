"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { TopNav } from "@/src/components/portal/TopNav";
import { PortalFooter } from "@/src/components/portal/PortalFooter";
import { CreateTicketTrigger } from "@/src/components/portal/CreateTicketModal";

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

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
            <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 p-8 rounded-xl shadow-md hover:shadow-lg transition-all group cursor-pointer">
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
            <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 border-t-4 border-t-primary p-8 rounded-xl shadow-md hover:shadow-lg transition-all group cursor-pointer">
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
              className="bg-white/80 backdrop-blur-md border border-slate-200/80 p-8 rounded-xl shadow-md hover:shadow-lg transition-all group cursor-pointer block"
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
      </main>

      <PortalFooter />
    </div>
  );
}
