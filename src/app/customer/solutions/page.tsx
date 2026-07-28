"use client";

import Link from "next/link";
import { TopNav } from "@/src/components/portal/TopNav";
import { PortalFooter } from "@/src/components/portal/PortalFooter";
import { CreateTicketTrigger } from "@/src/components/portal/CreateTicketModal";

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-background text-on-background font-body-md antialiased overflow-x-hidden">
      <TopNav activePage="dashboard" />

      <main className="relative">
        {/* ── HERO SECTION ── */}
        <section className="relative pt-24 pb-32 px-container-margin overflow-hidden">
          <div className="max-w-[1440px] mx-auto flex flex-col items-center text-center">
            <span className="inline-block px-4 py-1.5 mb-6 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md tracking-wider uppercase">
              Scale without Friction
            </span>
            <h1 className="font-display text-display text-on-surface mb-6 max-w-4xl">
              Enterprise solutions for every team.
            </h1>
            <p className="font-body-lg text-body-lg text-secondary max-w-2xl mb-10">
              Empower your global workforce with specialized ticketing workflows designed for scale. Kinetic connects silos and automates resolution at any volume.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <CreateTicketTrigger className="bg-primary text-on-primary px-8 py-4 rounded-lg font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer">
                Explore Platform
              </CreateTicketTrigger>
              <Link
                href="/customer/knowledge-base"
                className="bg-surface-container-highest text-primary px-8 py-4 rounded-lg font-bold border border-outline-variant hover:bg-surface-container-high transition-all"
              >
                View Integrations
              </Link>
            </div>
          </div>
        </section>

        {/* ── INDUSTRY SOLUTIONS BENTO GRID ── */}
        <section className="py-24 px-container-margin bg-white border-y border-outline-variant">
          <div className="max-w-[1440px] mx-auto">
            <div className="mb-16">
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Built for Industry Leaders</h2>
              <p className="text-secondary font-body-lg">Modular architecture tailored for complex organizational needs.</p>
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* IT Operations */}
              <div className="col-span-12 lg:col-span-7 group relative overflow-hidden rounded-xl bg-surface-container-low border border-outline-variant p-8 transition-all hover:shadow-md">
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-start mb-12">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary">
                      <span className="material-symbols-outlined text-3xl">settings_suggest</span>
                    </div>
                    <span className="text-xs font-bold tracking-widest uppercase text-outline">Featured Solution</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md mb-4">IT Operations</h3>
                  <p className="text-secondary font-body-md mb-8 max-w-md leading-relaxed">
                    Modernize IT service management with robust SLA oversight and automated asset tracking. Keep your infrastructure resilient while reducing mean-time-to-repair.
                  </p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                      Dynamic SLA Compliance Tracking
                    </li>
                    <li className="flex items-center gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                      Automated CMDB Syncing
                    </li>
                  </ul>
                  <div className="mt-auto">
                    <CreateTicketTrigger className="inline-flex items-center text-primary font-bold gap-2 group-hover:translate-x-1 transition-transform cursor-pointer">
                      Learn More <span className="material-symbols-outlined">arrow_forward</span>
                    </CreateTicketTrigger>
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 w-1/3 h-1/2 opacity-20 pointer-events-none group-hover:scale-110 transition-transform duration-500 hidden sm:block">
                  <img
                    className="object-cover w-full h-full rounded-tl-3xl border-l border-t border-outline-variant"
                    alt="IT operations dashboard"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZE5oHoKyx4SLCMDW4XMyuHGSwSkshaYIXc_ip4tT5KW6q-ARVOxN5tJGxfjYWs6BWoh5qxgqlNTBaCh-BOluIMJjzzX40Bb-ylT4iytGh1KMVNgobwTnsERrZHDzKgtjywLTH8N9-WwNv8VTWcLIyARQLa03nPyoTwzBIky9UgdHfr1LfSmqN77vhcLVAKTLEFEkQ7cg-u887AUoABN7nykzsjdJKTjtvj1iiXh14IGNZBLZjaVe2k-1bEHuT9jwFbYZnyUKKR0JM"
                  />
                </div>
              </div>

              {/* Customer Service */}
              <div className="col-span-12 lg:col-span-5 group rounded-xl bg-surface-container-high border border-outline-variant p-8 transition-all hover:shadow-md">
                <div className="p-3 rounded-lg bg-tertiary/10 text-tertiary w-fit mb-6">
                  <span className="material-symbols-outlined text-3xl">diversity_3</span>
                </div>
                <h3 className="font-headline-md text-headline-md mb-4">Customer Service</h3>
                <p className="text-secondary font-body-md mb-8">
                  Unify every conversation across email, chat, and social. Leverage sentiment analysis to prioritize high-value escalations automatically.
                </p>
                <div className="bg-white/50 rounded-lg p-4 border border-outline-variant mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-sm">mood</span>
                    </div>
                    <span className="font-label-md text-on-surface">Sentiment Score: 98%</span>
                  </div>
                  <div className="w-full bg-outline-variant h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full w-[98%]" />
                  </div>
                </div>
                <Link href="/customer/support" className="inline-flex items-center text-on-surface font-bold gap-2 group-hover:translate-x-1 transition-transform">
                  View Omnichannel Features <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
              </div>

              {/* HR Service Delivery */}
              <div className="col-span-12 group rounded-xl bg-inverse-surface text-inverse-on-surface p-10 flex flex-col md:flex-row items-center gap-10 transition-all hover:shadow-xl">
                <div className="flex-1">
                  <div className="p-3 rounded-lg bg-primary-fixed-dim/20 text-primary-fixed-dim w-fit mb-6">
                    <span className="material-symbols-outlined text-3xl">badge</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md mb-4">HR Service Delivery</h3>
                  <p className="opacity-80 font-body-lg mb-8 max-w-lg">
                    Simplify employee onboarding, payroll queries, and internal policy management. Provide a single point of truth for your most valuable asset: your people.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <div className="px-4 py-2 rounded bg-white/10 border border-white/20 font-label-md">Employee Onboarding</div>
                    <div className="px-4 py-2 rounded bg-white/10 border border-white/20 font-label-md">Payroll Automation</div>
                    <div className="px-4 py-2 rounded bg-white/10 border border-white/20 font-label-md">Policy Portal</div>
                  </div>
                </div>
                <div className="w-full md:w-1/3 aspect-video rounded-lg overflow-hidden border border-white/10 shadow-2xl">
                  <img
                    className="object-cover w-full h-full"
                    alt="HR manager onboarding workspace"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1PQytzFY27sUlKetUsDV24fWjzNRPt8C3Y1XPjhEn0d3Ajy3YhFMeRWWTbuD3CcJep-W4BIwZOr-uL0OCsANoeyKrKgfcyPhwqtXzfNbpo4lTtntGhny95ts45exoRFNawrvenf5yI5Asrtd7lazKlK3As2HHbh8zhgug9JD0-nC8mM91AmHA6EUCptAm5Kp8i4JzqoeqKV4QEHlC5iif0D6R59ibEBHYUUzTrI4VG6rLf4u_92hYojdd-phvZGH5SSLlwTLhVwUy"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── KEY CAPABILITIES ── */}
        <section className="py-24 px-container-margin bg-surface-container-low border-b border-outline-variant">
          <div className="max-w-[1440px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* AI Routing */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-white border border-outline-variant shadow-sm flex items-center justify-center text-primary mb-6">
                  <span className="material-symbols-outlined text-4xl">auto_awesome</span>
                </div>
                <h4 className="font-headline-md text-headline-md mb-3">AI-Driven Routing</h4>
                <p className="text-secondary font-body-md leading-relaxed">
                  Intelligent categorization and agent matching based on historical resolution data and skill set mapping.
                </p>
              </div>

              {/* Multi-Regional Compliance */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-white border border-outline-variant shadow-sm flex items-center justify-center text-primary mb-6">
                  <span className="material-symbols-outlined text-4xl">public</span>
                </div>
                <h4 className="font-headline-md text-headline-md mb-3">Global Compliance</h4>
                <p className="text-secondary font-body-md leading-relaxed">
                  Built-in GDPR, SOC2, and HIPAA compliance layers to ensure data sovereignty across all global operations.
                </p>
              </div>

              {/* Deep API Integrations */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-white border border-outline-variant shadow-sm flex items-center justify-center text-primary mb-6">
                  <span className="material-symbols-outlined text-4xl">api</span>
                </div>
                <h4 className="font-headline-md text-headline-md mb-3">Deep Integrations</h4>
                <p className="text-secondary font-body-md leading-relaxed">
                  Native connectors for Salesforce, Slack, Jira, and more. Or build custom workflows with our robust API.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CALL TO ACTION ── */}
        <section className="py-32 px-container-margin relative overflow-hidden bg-primary">
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="font-display text-display text-on-primary mb-6">Ready to scale your support?</h2>
            <p className="text-on-primary/80 font-body-lg mb-10">
              Join over 2,500 global enterprises using Kinetic to manage high-velocity support workflows. Start your journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <CreateTicketTrigger className="bg-white text-primary px-10 py-4 rounded-lg font-bold shadow-xl hover:bg-surface-container-lowest transition-all cursor-pointer">
                Get Started
              </CreateTicketTrigger>
              <Link
                href="/customer/knowledge-base"
                className="bg-transparent text-white px-10 py-4 rounded-lg font-bold border-2 border-white/40 hover:border-white transition-all"
              >
                View Case Studies
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PortalFooter />
    </div>
  );
}
