"use client";

import { useState } from "react";
import Link from "next/link";
import { TopNav } from "@/src/components/portal/TopNav";
import { PortalFooter } from "@/src/components/portal/PortalFooter";
import { CreateTicketTrigger } from "@/src/components/portal/CreateTicketModal";

type TrackFilter = "All" | "IT Operations" | "Customer Service" | "HR Service Delivery";

export default function SolutionsPage() {
  const [activeFilter, setActiveFilter] = useState<TrackFilter>("All");
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [showIntegrationsModal, setShowIntegrationsModal] = useState(false);

  const integrations = [
    { name: "Slack", type: "Communication", desc: "Instant ticket triage & channel notifications", icon: "chat", status: "Active" },
    { name: "Jira Software", type: "Developer Tool", desc: "Two-way issue syncing with dev teams", icon: "bug_report", status: "Active" },
    { name: "Salesforce CRM", type: "Customer Data", desc: "Account SLA context & VIP customer routing", icon: "contacts", status: "Active" },
    { name: "GitHub", type: "DevOps", desc: "Link PRs and commit hashes directly to tickets", icon: "code", status: "Active" },
    { name: "Microsoft Teams", type: "Collaboration", desc: "Real-time channel alerts and escalation bots", icon: "groups", status: "Active" },
    { name: "REST API & Webhooks", type: "Custom Sync", desc: "High-throughput API gateway with 99.9% uptime", icon: "api", status: "Active" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col justify-between">
      <TopNav />

      <main className="flex-1">
        {/* ── HERO SECTION ── */}
        <section className="bg-white border-b border-slate-200 py-14 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold tracking-wide uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                Scale Without Friction
              </span>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
                Enterprise solutions for every support team.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                Empower your workforce with clean, structured ticketing workflows built for speed. Kinetic connects silos, streamlines handoffs, and helps teams resolve issues faster at any volume.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPlatformModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-sm transition-colors cursor-pointer inline-flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">explore</span>
                  <span>Explore Platform</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowIntegrationsModal(true)}
                  className="bg-white hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-xl font-semibold text-sm border border-slate-200 transition-colors cursor-pointer inline-flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px] text-slate-500">hub</span>
                  <span>View Integrations</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/solutions_hero_banner.jpg"
                  alt="Kinetic Enterprise Support Operations"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/15 to-transparent flex items-end p-5">
                  <div className="bg-white/95 backdrop-blur-sm border border-slate-200/80 rounded-xl px-4 py-3 shadow-sm flex items-center gap-3 w-full">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">verified</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900">Unified Service Desk</p>
                      <p className="text-[11px] text-slate-600 truncate">IT, Customer Support &amp; HR workflows in one portal</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── INDUSTRY SOLUTIONS BENTO GRID ── */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                  Built for Modern Teams
                </h2>
                <p className="text-slate-600 text-base">
                  Modular workflows tailored to how each department serves customers and employees.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {(["All", "IT Operations", "Customer Service", "HR Service Delivery"] as const).map((track) => (
                  <button
                    key={track}
                    type="button"
                    onClick={() => setActiveFilter(track)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                      activeFilter === track
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {track}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* IT Operations */}
              {(activeFilter === "All" || activeFilter === "IT Operations") && (
                <div className="col-span-12 lg:col-span-7 group rounded-2xl bg-white border border-slate-200 p-7 sm:p-8 transition-all duration-200 hover:border-blue-300 hover:shadow-md flex flex-col">
                  <div className="flex justify-between items-start mb-8">
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                      <span className="material-symbols-outlined text-2xl">settings_suggest</span>
                    </div>
                    <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                      Featured Solution
                    </span>
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                    IT Operations
                  </h3>
                  <p className="text-slate-600 text-sm sm:text-base mb-6 max-w-lg leading-relaxed">
                    Modernize IT service management with clear SLA oversight and automated asset tracking. Keep your infrastructure resilient while reducing mean-time-to-repair.
                  </p>
                  <ul className="space-y-2.5 mb-8 text-sm text-slate-700">
                    <li className="flex items-center gap-2.5 font-medium">
                      <span className="material-symbols-outlined text-blue-600 text-[18px]">check_circle</span>
                      Dynamic SLA Compliance Tracking
                    </li>
                    <li className="flex items-center gap-2.5 font-medium">
                      <span className="material-symbols-outlined text-blue-600 text-[18px]">check_circle</span>
                      Automated CMDB Asset Syncing
                    </li>
                  </ul>
                  <div className="mt-auto">
                    <button
                      type="button"
                      onClick={() => setShowPlatformModal(true)}
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold text-sm gap-1.5 group-hover:translate-x-1 transition-transform cursor-pointer"
                    >
                      <span>Explore IT Workflows</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Customer Service */}
              {(activeFilter === "All" || activeFilter === "Customer Service") && (
                <div
                  className={`${
                    activeFilter === "Customer Service" ? "col-span-12" : "col-span-12 lg:col-span-5"
                  } group rounded-2xl bg-white border border-slate-200 p-7 sm:p-8 transition-all duration-200 hover:border-blue-300 hover:shadow-md flex flex-col`}
                >
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 w-fit mb-6">
                    <span className="material-symbols-outlined text-2xl">diversity_3</span>
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                    Customer Service
                  </h3>
                  <p className="text-slate-600 text-sm sm:text-base mb-6 leading-relaxed">
                    Unify every conversation across email, portal, and live chat. Prioritize urgent escalations automatically so customers never wait unnecessarily.
                  </p>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6 mt-auto">
                    <div className="flex items-center justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                          <span className="material-symbols-outlined text-[18px]">mood</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-900">Customer Satisfaction</span>
                      </div>
                      <span className="text-sm font-bold text-emerald-700 tabular-nums">98%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full w-[98%] rounded-full" />
                    </div>
                  </div>
                  <Link
                    href="/customer/support"
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold text-sm gap-1.5 group-hover:translate-x-1 transition-transform"
                  >
                    <span>View Omnichannel Support</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </Link>
                </div>
              )}

              {/* HR Service Delivery */}
              {(activeFilter === "All" || activeFilter === "HR Service Delivery") && (
                <div className="col-span-12 group rounded-2xl bg-white border border-slate-200 p-7 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-8 transition-all duration-200 hover:border-blue-300 hover:shadow-md">
                  <div className="flex-1">
                    <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 w-fit mb-5">
                      <span className="material-symbols-outlined text-2xl">badge</span>
                    </div>
                    <h3 className="font-display text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                      HR Service Delivery
                    </h3>
                    <p className="text-slate-600 text-sm sm:text-base mb-6 max-w-lg leading-relaxed">
                      Simplify employee onboarding, payroll requests, and internal policy questions. Provide a clear single portal where team members always know where to ask.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
                        Employee Onboarding
                      </span>
                      <span className="px-3.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
                        Payroll Automation
                      </span>
                      <span className="px-3.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
                        Policy Portal
                      </span>
                    </div>
                  </div>

                  <div className="w-full lg:w-[44%] h-60 md:h-64 rounded-xl overflow-hidden border border-slate-200 relative shrink-0 bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/hr_service_bg.jpg"
                      alt="HR Service Delivery & Employee Onboarding Portal"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-2 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Active Onboarding Portal</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── KEY CAPABILITIES ── */}
        <section className="py-16 bg-white border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
                Core Platform Capabilities
              </h2>
              <p className="text-slate-600 text-base">
                Reliable automation, security, and integrations built in from day one.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-start">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-blue-600 mb-5">
                  <span className="material-symbols-outlined text-2xl">auto_awesome</span>
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 mb-2">AI-Driven Routing</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Intelligent categorization and agent matching based on historical resolution data and skill set mapping.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-start">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-blue-600 mb-5">
                  <span className="material-symbols-outlined text-2xl">public</span>
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 mb-2">Global Compliance</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Built-in GDPR, SOC2, and HIPAA compliance layers to ensure data sovereignty across all global operations.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-start">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-blue-600 mb-5">
                  <span className="material-symbols-outlined text-2xl">api</span>
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 mb-2">Deep Integrations</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Native connectors for Salesforce, Slack, Jira, and more — or build custom workflows with our REST API.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CALL TO ACTION ── */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-12 text-center border border-slate-800 shadow-sm">
              <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4">
                Ready to scale your support?
              </h2>
              <p className="text-slate-300 text-base sm:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
                Join over 2,500 global organizations using Kinetic to deliver fast, transparent customer support.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <CreateTicketTrigger className="bg-blue-600 hover:bg-blue-500 text-white px-7 py-3 rounded-xl font-semibold text-sm shadow-sm transition-colors cursor-pointer">
                  Get Started
                </CreateTicketTrigger>
                <button
                  type="button"
                  onClick={() => setShowIntegrationsModal(true)}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-7 py-3 rounded-xl font-semibold text-sm border border-slate-700 transition-colors cursor-pointer"
                >
                  View Integrations
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── EXPLORE PLATFORM MODAL ── */}
      {showPlatformModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
          onClick={() => setShowPlatformModal(false)}
        >
          <div
            className="modal-pop bg-white border border-slate-200 rounded-2xl shadow-xl max-w-2xl w-full p-6 sm:p-8 relative max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowPlatformModal(false)}
              className="absolute top-5 right-5 text-slate-500 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="flex items-center gap-3 mb-6 pr-8">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                <span className="material-symbols-outlined text-2xl">bolt</span>
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-slate-900">
                  Kinetic Enterprise Platform Tour
                </h3>
                <p className="text-slate-500 text-sm">Next-Generation Service Management Engine</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 flex items-start gap-3.5">
                <span className="material-symbols-outlined text-blue-600 text-xl mt-0.5">auto_awesome</span>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">AI Auto-Triage &amp; Categorization</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Automatically analyzes ticket intent, severity, and customer tier to route requests to the right specialist queue.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 flex items-start gap-3.5">
                <span className="material-symbols-outlined text-blue-600 text-xl mt-0.5">timer</span>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Precision SLA Oversight Engine</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Real-time countdown monitors and threshold alerts prevent SLA breaches before they happen.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 flex items-start gap-3.5">
                <span className="material-symbols-outlined text-blue-600 text-xl mt-0.5">forum</span>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Omnichannel Ticket Hub</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Seamlessly unifies email, web portal, live chat, and Telegram interactions into a single agent workspace.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-200 flex items-center justify-between gap-4">
              <span className="text-xs text-slate-500 font-medium">Ready to test the platform?</span>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowPlatformModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <CreateTicketTrigger className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-xs transition-colors">
                  Create Demo Ticket
                </CreateTicketTrigger>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW INTEGRATIONS MODAL ── */}
      {showIntegrationsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
          onClick={() => setShowIntegrationsModal(false)}
        >
          <div
            className="modal-pop bg-white border border-slate-200 rounded-2xl shadow-xl max-w-3xl w-full p-6 sm:p-8 relative max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowIntegrationsModal(false)}
              className="absolute top-5 right-5 text-slate-500 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close integrations modal"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="flex items-center gap-3 mb-6 pr-8">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                <span className="material-symbols-outlined text-2xl">hub</span>
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-slate-900">Kinetic Integration Hub</h3>
                <p className="text-slate-500 text-sm">Pre-built native connectors for your tech stack</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {integrations.map((item) => (
                <div
                  key={item.name}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3 hover:border-blue-300 transition-colors"
                >
                  <div className="p-2 bg-white border border-slate-200 rounded-lg text-blue-600 shrink-0">
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold text-slate-900 text-sm">{item.name}</h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-slate-200 flex items-center justify-between gap-4">
              <span className="text-xs text-slate-500 font-medium">
                Need a custom integration? Use our REST API.
              </span>
              <button
                type="button"
                onClick={() => setShowIntegrationsModal(false)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-xs transition-colors cursor-pointer"
              >
                Close Hub
              </button>
            </div>
          </div>
        </div>
      )}

      <PortalFooter />
    </div>
  );
}
