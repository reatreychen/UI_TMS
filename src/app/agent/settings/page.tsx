"use client";

import { useState } from "react";
import Image from "next/image";

export default function AgentSupportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const handleScheduleSession = () => {
    setIsScheduling(true);
    setTimeout(() => {
      setIsScheduling(false);
      triggerToast("1-on-1 coaching session request sent to Sarah Chen!");
    }, 700);
  };

  return (
    <div className="space-y-stack-lg max-w-[1440px] mx-auto w-full animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-xl bg-primary-container text-white p-8 md:p-10 shadow-lg">
        <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 pointer-events-none hidden sm:block">
          <span className="material-symbols-outlined text-[320px] absolute -right-20 -top-20">
            support_agent
          </span>
        </div>
        <div className="relative z-10 space-y-2 max-w-2xl">
          <h1 className="font-display text-display font-bold">Support &amp; Resources</h1>
          <p className="font-body-lg text-body-lg opacity-90 leading-relaxed">
            Access internal tools, live system health monitoring, and developer documentation to help you resolve complex customer issues faster.
          </p>
        </div>
      </div>

      {/* Bento Grid: Core Resources */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        {/* System Status Card */}
        <div className="md:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 text-green-700 p-2.5 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">health_and_safety</span>
              </div>
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                System Status
              </h3>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-200">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-tight">
                All Systems Operational
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant flex flex-col items-center text-center">
              <p className="text-xs font-bold text-on-surface-variant uppercase mb-2">
                Internal API
              </p>
              <span className="text-green-600 font-bold text-lg mb-1">99.99%</span>
              <div className="w-full h-1 bg-green-500 rounded-full" />
              <p className="text-[11px] text-on-surface-variant mt-2 font-medium">
                Latency: 24ms
              </p>
            </div>

            <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant flex flex-col items-center text-center">
              <p className="text-xs font-bold text-on-surface-variant uppercase mb-2">
                PostgreSQL DB
              </p>
              <span className="text-green-600 font-bold text-lg mb-1">Operational</span>
              <div className="w-full h-1 bg-green-500 rounded-full" />
              <p className="text-[11px] text-on-surface-variant mt-2 font-medium">
                Connections: Normal
              </p>
            </div>

            <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant flex flex-col items-center text-center">
              <p className="text-xs font-bold text-on-surface-variant uppercase mb-2">
                Web Services
              </p>
              <span className="text-green-600 font-bold text-lg mb-1">Stable</span>
              <div className="w-full h-1 bg-green-500 rounded-full" />
              <p className="text-[11px] text-on-surface-variant mt-2 font-medium">
                Uptime: 42 days
              </p>
            </div>
          </div>
        </div>

        {/* Slack Quick Link */}
        <div
          onClick={() => triggerToast("Opening Slack channel #support-team...")}
          className="md:col-span-4 bg-[#4A154B] text-white rounded-xl p-6 shadow-xs flex flex-col justify-between hover:scale-[1.01] transition-transform cursor-pointer relative overflow-hidden group"
        >
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-white text-3xl">chat</span>
            </div>
            <h3 className="font-headline-md text-headline-md font-bold">Internal Slack</h3>
            <p className="text-sm opacity-80 mt-2 leading-relaxed">
              Jump straight into #support-team to collaborate with senior leads in real time.
            </p>
          </div>
          <div className="relative z-10 mt-6 flex items-center justify-between">
            <span className="font-bold flex items-center gap-2 group-hover:underline">
              Open Slack <span className="material-symbols-outlined text-sm">north_east</span>
            </span>
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-[#4A154B] bg-blue-400 flex items-center justify-center text-[10px] font-bold">
                AR
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-[#4A154B] bg-purple-400 flex items-center justify-center text-[10px] font-bold">
                SC
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-[#4A154B] bg-primary flex items-center justify-center text-[10px] font-bold">
                +12
              </div>
            </div>
          </div>
        </div>

        {/* Developer Docs */}
        <div
          onClick={() => triggerToast("Opening Developer API Documentation v2.4")}
          className="md:col-span-6 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-xs flex gap-6 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-xl flex shrink-0 items-center justify-center">
            <span className="material-symbols-outlined text-4xl">terminal</span>
          </div>
          <div className="flex-1">
            <h3 className="font-headline-md text-headline-md font-bold mb-2 flex items-center justify-between text-on-surface group-hover:text-primary transition-colors">
              <span>Developer Docs</span>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </h3>
            <p className="text-on-surface-variant text-body-md mb-4 leading-relaxed">
              Explore our comprehensive API references, webhook technical guides, and architecture diagrams.
            </p>
            <div className="flex gap-2">
              <span className="px-2.5 py-1 bg-surface-container-low border border-outline-variant rounded text-[10px] font-bold text-on-surface-variant">
                V2.4 API
              </span>
              <span className="px-2.5 py-1 bg-surface-container-low border border-outline-variant rounded text-[10px] font-bold text-on-surface-variant">
                SDKS
              </span>
            </div>
          </div>
        </div>

        {/* IT Help Desk */}
        <div
          onClick={() => triggerToast("Opening IT Infrastructure help desk ticket portal...")}
          className="md:col-span-6 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-xs flex gap-6 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-xl flex shrink-0 items-center justify-center">
            <span className="material-symbols-outlined text-4xl">support_agent</span>
          </div>
          <div className="flex-1">
            <h3 className="font-headline-md text-headline-md font-bold mb-2 flex items-center justify-between text-on-surface group-hover:text-amber-700 transition-colors">
              <span>IT Help Desk</span>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </h3>
            <p className="text-on-surface-variant text-body-md mb-4 leading-relaxed">
              Facing workstation, VPN, or credential issues? Open a priority ticket with the Internal IT team.
            </p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-xs text-on-surface-variant font-medium">
                <span className="material-symbols-outlined text-sm">schedule</span> Wait time: ~15m
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Split Section: Updates and Workflows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-stack-lg">
        {/* Recent System Updates */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-md text-headline-md font-bold flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-primary">new_releases</span>
              Recent System Updates
            </h3>
            <button
              onClick={() => triggerToast("Loading full release changelog...")}
              className="text-primary text-xs font-bold uppercase hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            <div
              onClick={() => triggerToast("Viewing v2.4.0 Hotfix details")}
              className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-xs hover:border-primary transition-colors cursor-pointer"
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-body-lg text-on-surface">v2.4.0 Hotfix - Queue Sorting</h4>
                <span className="px-2 py-0.5 bg-primary-container text-white text-[10px] rounded font-bold">
                  RELEASED
                </span>
              </div>
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                Resolved an issue where tickets with urgent priority were not correctly floating to the top of the shared queue.
              </p>
              <p className="text-[11px] text-on-surface-variant mt-2 font-medium">
                Oct 24, 2026 • Reported by Engineering
              </p>
            </div>

            <div
              onClick={() => triggerToast("Viewing Security Patch details")}
              className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-xs hover:border-primary transition-colors cursor-pointer opacity-90"
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-body-lg text-on-surface">Bulk Update Security Patch</h4>
                <span className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant text-[10px] rounded font-bold">
                  DEPLOYED
                </span>
              </div>
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                Mandatory update to the bulk editing engine to prevent unintended customer data exposure on legacy exports.
              </p>
              <p className="text-[11px] text-on-surface-variant mt-2 font-medium">
                Oct 21, 2026 • Security Advisory
              </p>
            </div>
          </div>
        </section>

        {/* Common Internal Workflows */}
        <section className="space-y-4">
          <h3 className="font-headline-md text-headline-md font-bold flex items-center gap-2 text-on-surface">
            <span className="material-symbols-outlined text-primary">rebase_edit</span>
            Internal Workflows
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { title: "Password Resets", desc: "Customer Portal", icon: "lock_reset" },
              { title: "Hardware Request", desc: "Inventory Portal", icon: "devices" },
              { title: "Escalation Matrix", desc: "Org Directory", icon: "account_tree" },
              { title: "Audit Log Export", desc: "Compliance Tool", icon: "fact_check" },
            ].map((wf) => (
              <div
                key={wf.title}
                onClick={() => triggerToast(`Launching workflow: ${wf.title}`)}
                className="p-4 bg-surface-container-lowest border border-outline-variant rounded-xl flex items-center gap-4 hover:bg-surface-container shadow-xs transition-all cursor-pointer"
              >
                <div className="w-10 h-10 bg-surface-container rounded-lg flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined">{wf.icon}</span>
                </div>
                <div>
                  <p className="font-bold text-sm text-on-surface">{wf.title}</p>
                  <p className="text-xs text-on-surface-variant">{wf.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Agent Workstation Preferences */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/60 pb-3">
          <div>
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">tune</span>
              Workstation &amp; Notification Preferences
            </h3>
            <p className="text-body-md text-on-surface-variant">Customize your local agent portal workspace settings.</p>
          </div>
          <button
            onClick={() => triggerToast("Workstation preferences saved!")}
            className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">save</span>
            Save Preferences
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg border border-outline-variant">
            <div>
              <p className="font-bold text-sm text-on-surface">Desktop Push Notifications</p>
              <p className="text-xs text-on-surface-variant">Receive instant alert when a high-priority ticket is assigned.</p>
            </div>
            <input type="checkbox" defaultChecked className="size-5 accent-primary cursor-pointer" />
          </div>

          <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg border border-outline-variant">
            <div>
              <p className="font-bold text-sm text-on-surface">Audio Alert Chime</p>
              <p className="text-xs text-on-surface-variant">Play notification sound when customer replies in active chat.</p>
            </div>
            <input type="checkbox" defaultChecked className="size-5 accent-primary cursor-pointer" />
          </div>

          <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg border border-outline-variant">
            <div>
              <p className="font-bold text-sm text-on-surface">Live Chat Polling Interval</p>
              <p className="text-xs text-on-surface-variant">Frequency of background ticket comment sync.</p>
            </div>
            <select className="px-3 py-1.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-bold text-on-surface outline-none">
              <option value="3000">3 Seconds (Fast)</option>
              <option value="5000">5 Seconds (Balanced)</option>
              <option value="10000">10 Seconds (Power Saver)</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg border border-outline-variant">
            <div>
              <p className="font-bold text-sm text-on-surface">Default Queue View</p>
              <p className="text-xs text-on-surface-variant">Initial view layout when opening queue list.</p>
            </div>
            <select className="px-3 py-1.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-bold text-on-surface outline-none">
              <option value="detailed">Expanded Rows</option>
              <option value="compact">Compact Grid</option>
            </select>
          </div>
        </div>
      </section>

      {/* Help Contact Footer */}
      <div className="p-6 md:p-8 bg-surface-container rounded-xl border border-outline-variant flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-6">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCQVejMEa2NZcSjhAEXXMD-xyc31mnBd23wCJworPUTYFga4VnvnJYRMi_09xs9tYvuEp6xTE-7xlt2UHmITKxZ_YbZJPuFAJuYwJvZ2Yg9OAExAEep3xjdp22QZKELxBK9WZYGjq1VdU2wqrAa6WjYeQHZVH7moLHRadtrrFybkkefgOqXK5dhKaFa0m2Eur10N5B5V-Yzc0zfJ_zvDB8WnCDFYTr9rT-pMR_RbWZrSsQ8h1fyzRxDY2L6jr9S6ROYDsOX3jEzBZS"
            alt="Sarah Chen Success Manager"
            className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover ring-4 ring-white shadow-md flex-shrink-0"
          />
          <div>
            <h4 className="font-headline-md text-headline-md font-bold text-on-surface">
              Still need help?
            </h4>
            <p className="text-on-surface-variant text-body-md max-w-md mt-1 leading-relaxed">
              Our internal success manager, Sarah Chen, is available for 1-on-1 coaching or troubleshooting sessions.
            </p>
          </div>
        </div>
        <div className="flex gap-4 w-full md:w-auto flex-shrink-0">
          <button
            onClick={() => triggerToast("Drafting email to Sarah Chen (s.chen@kinetic.tms)...")}
            className="flex-1 md:flex-none px-6 py-3 bg-white border border-outline-variant rounded-lg font-bold hover:bg-surface transition-colors shadow-xs cursor-pointer text-on-surface"
          >
            Email Sarah
          </button>
          <button
            onClick={handleScheduleSession}
            disabled={isScheduling}
            className="flex-1 md:flex-none px-6 py-3 bg-primary text-white rounded-lg font-bold hover:opacity-90 transition-opacity shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isScheduling && <span className="material-symbols-outlined text-sm animate-spin">sync</span>}
            <span>{isScheduling ? "Scheduling..." : "Schedule Session"}</span>
          </button>
        </div>
      </div>

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
