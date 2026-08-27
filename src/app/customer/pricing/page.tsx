"use client";

import { useState } from "react";
import Link from "next/link";
import { TopNav } from "@/src/components/portal/TopNav";
import { PortalFooter } from "@/src/components/portal/PortalFooter";

// ── FAQ Item ────────────────────────────────────────────────────────────────
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white border border-outline-variant rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center p-6 text-left hover:bg-surface transition-colors"
      >
        <span className="font-headline-md text-headline-md text-on-surface">
          {question}
        </span>
        <span
          className={`material-symbols-outlined text-on-surface-variant transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          expand_more
        </span>
      </button>
      {open && (
        <div className="px-6 pb-6 font-body-md text-body-md text-on-surface-variant">
          {answer}
        </div>
      )}
    </div>
  );
}

// ── Check / Minus icons ──────────────────────────────────────────────────────
function Check() {
  return (
    <span className="material-symbols-outlined text-primary">check</span>
  );
}
function Minus() {
  return (
    <span className="material-symbols-outlined text-outline-variant">remove</span>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [currency, setCurrency] = useState<"USD" | "KHR">("USD");

  const starterPrice = isAnnual ? 29 : 36;
  const proPrice = isAnnual ? 79 : 99;

  const formatPrice = (usdAmount: number) => {
    if (currency === "KHR") {
      return `${(usdAmount * 4100).toLocaleString()} ៛`;
    }
    return `$${usdAmount}`;
  };

  const faqs = [
    {
      question: "Can I change plans later?",
      answer:
        "Yes! You can upgrade or downgrade your plan at any time from your administration panel. Changes will be reflected in your next billing cycle.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Security is our top priority. We use industry-standard AES-256 encryption, comply with GDPR and SOC2 standards, and provide single-tenant database options for Enterprise customers.",
    },
    {
      question: "Do you offer onboarding support?",
      answer:
        "All Professional and Enterprise plans include guided onboarding. Enterprise customers also get a dedicated Technical Account Manager to assist with complex migrations.",
    },
    {
      question: "What happens after my trial?",
      answer:
        "After your 14-day trial, you can choose to enter your payment details to continue using Kinetic Enterprise. If you don't, your account will be paused, but your data will be safely stored for 30 days.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md antialiased">
      <TopNav activePage="dashboard" />

      <main className="pt-24 pb-stack-lg">
        {/* ── HERO ── */}
        <section className="max-w-4xl mx-auto text-center px-container-margin py-stack-lg">
          <h1 className="font-display text-display text-on-surface mb-stack-md">
            Simple, transparent pricing for teams of all sizes
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-stack-lg">
            Empower your support team with industry-leading ticketing tools.
            Choose the plan that fits your growth trajectory.
          </p>

          {/* Billing Toggle & Currency Switcher */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-stack-lg">
            <div className="flex items-center gap-4">
              <span className="font-label-md text-label-md text-on-surface">Monthly</span>
              <button
                type="button"
                onClick={() => setIsAnnual(!isAnnual)}
                className={`relative w-14 h-8 rounded-full p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                  isAnnual ? "bg-primary" : "bg-surface-container-high"
                }`}
                aria-label="Toggle billing period"
              >
                <div
                  className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${
                    isAnnual ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
              <span className="font-label-md text-label-md text-on-surface">Annual</span>
              <span className="bg-secondary-container text-on-secondary-container text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                20% OFF
              </span>
            </div>

            {/* Currency Selector */}
            <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg border border-outline-variant">
              <button
                onClick={() => setCurrency("USD")}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  currency === "USD" ? "bg-white text-primary shadow-xs" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                USD ($)
              </button>
              <button
                onClick={() => setCurrency("KHR")}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  currency === "KHR" ? "bg-white text-primary shadow-xs" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                KHR (៛ Riel)
              </button>
            </div>
          </div>
        </section>

        {/* ── PRICING CARDS ── */}
        <section className="max-w-7xl mx-auto px-container-margin grid grid-cols-1 md:grid-cols-3 gap-stack-lg mb-stack-lg">
          {/* Starter */}
          <div className="group bg-surface-container-lowest border border-outline-variant p-8 rounded-xl flex flex-col h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-primary">
            <div className="mb-6">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Starter</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                For small teams getting started with support.
              </p>
            </div>
            <div className="mb-8">
              <div className="flex items-baseline gap-1">
                <span className="font-display text-display text-on-surface">{formatPrice(starterPrice)}</span>
                <span className="text-on-surface-variant text-sm">/agent/mo</span>
              </div>
              <p className="text-on-surface-variant text-sm mt-1">
                {isAnnual ? "Billed annually" : "Billed monthly"}
              </p>
            </div>
            <ul className="space-y-4 mb-8 flex-grow">
              {["Basic ticketing system", "Email & Web support", "Kinetic Mobile App", "Standard reporting"].map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                  <span className="font-body-md text-body-md">{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/customer/create-ticket"
              className="w-full py-3 border border-primary text-primary font-label-md text-label-md rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-all text-center block"
            >
              Start Trial
            </Link>
          </div>

          {/* Professional */}
          <div className="group bg-white border-2 border-primary p-8 rounded-xl flex flex-col h-full relative shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
              Most Popular
            </div>
            <div className="mb-6">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Professional</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                For growing teams scaling their operations.
              </p>
            </div>
            <div className="mb-8">
              <div className="flex items-baseline gap-1">
                <span className="font-display text-display text-on-surface">{formatPrice(proPrice)}</span>
                <span className="text-on-surface-variant text-sm">/agent/mo</span>
              </div>
              <p className="text-on-surface-variant text-sm mt-1">
                {isAnnual ? "Billed annually" : "Billed monthly"}
              </p>
            </div>
            <ul className="space-y-4 mb-8 flex-grow">
              {[
                "Everything in Starter",
                "AI-powered ticket routing",
                "Canned responses & macros",
                "Advanced analytics dashboard",
                "Custom business hours",
              ].map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                  <span className="font-body-md text-body-md">{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/customer/create-ticket"
              className="w-full py-3 bg-primary text-white font-label-md text-label-md rounded-lg shadow-md hover:opacity-90 transition-all text-center block"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Enterprise */}
          <div className="group bg-surface-container-lowest border border-outline-variant p-8 rounded-xl flex flex-col h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-primary">
            <div className="mb-6">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Enterprise</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                For global organizations with complex needs.
              </p>
            </div>
            <div className="mb-8">
              <div className="flex items-baseline gap-1">
                <span className="font-display text-display text-on-surface">Custom</span>
              </div>
              <p className="text-on-surface-variant text-sm mt-1">Tailored for your scale</p>
            </div>
            <ul className="space-y-4 mb-8 flex-grow">
              {[
                "Everything in Professional",
                "Custom SLAs & Tier 1 Support",
                "Dedicated TAM & Onboarding",
                "SSO, SAML & Advanced Audit",
                "Unlimited sandbox environments",
              ].map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                  <span className="font-body-md text-body-md">{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/customer/support"
              className="w-full py-3 border border-on-surface text-on-surface font-label-md text-label-md rounded-lg hover:bg-on-surface hover:text-white transition-all text-center block"
            >
              Contact Sales
            </Link>
          </div>
        </section>

        {/* ── FEATURE COMPARISON TABLE ── */}
        <section className="max-w-7xl mx-auto px-container-margin py-stack-lg overflow-x-auto">
          <h2 className="font-headline-lg text-headline-lg text-center mb-stack-lg">
            Compare all features
          </h2>
          <table className="w-full text-left border-collapse bg-white rounded-xl overflow-hidden border border-outline-variant shadow-sm">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="p-6 font-label-md text-label-md text-on-surface-variant w-1/4">Features</th>
                <th className="p-6 font-label-md text-label-md text-on-surface text-center">Starter</th>
                <th className="p-6 font-label-md text-label-md text-primary text-center">Professional</th>
                <th className="p-6 font-label-md text-label-md text-on-surface text-center">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Agents Included", starter: "Unlimited", pro: "Unlimited", ent: "Unlimited" },
                { label: "Omnichannel Support", starter: <Check />, pro: <Check />, ent: <Check /> },
                { label: "AI Auto-Triage", starter: <Minus />, pro: <Check />, ent: <Check /> },
                { label: "Custom Domain", starter: <Minus />, pro: <Check />, ent: <Check /> },
                { label: "API Access", starter: "Limited", pro: "Standard", ent: "Full / High Rate Limits" },
                { label: "Audit Logs", starter: <Minus />, pro: <Minus />, ent: <Check /> },
              ].map((row, i) => (
                <tr key={i} className="border-b border-outline-variant hover:bg-surface transition-colors">
                  <td className="p-4 font-body-md text-on-surface-variant">{row.label}</td>
                  <td className="p-4 text-center font-body-md">{row.starter}</td>
                  <td className="p-4 text-center font-body-md">{row.pro}</td>
                  <td className="p-4 text-center font-body-md">{row.ent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ── FAQ ── */}
        <section className="max-w-4xl mx-auto px-container-margin py-stack-lg">
          <h2 className="font-headline-lg text-headline-lg text-center mb-stack-lg">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="max-w-7xl mx-auto px-container-margin mt-stack-lg">
          <div className="bg-primary p-12 rounded-2xl text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_white,_transparent)]" />
            <div className="relative z-10">
              <h2 className="font-headline-lg text-headline-lg mb-4">Still have questions?</h2>
              <p className="font-body-lg text-body-lg mb-8 opacity-90 max-w-xl mx-auto">
                Our sales team is ready to help you find the perfect solution for your
                organization&apos;s support workflow.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/customer/support"
                  className="px-8 py-3 bg-white text-primary font-label-md text-label-md rounded-lg shadow-lg hover:bg-surface-container-low transition-all"
                >
                  Talk to Sales
                </Link>
                <Link
                  href="/customer/knowledge-base"
                  className="px-8 py-3 border border-white text-white font-label-md text-label-md rounded-lg hover:bg-white/10 transition-all"
                >
                  View API Docs
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PortalFooter />
    </div>
  );
}
