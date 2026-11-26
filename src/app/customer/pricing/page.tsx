"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TopNav } from "@/src/components/portal/TopNav";
import { PortalFooter } from "@/src/components/portal/PortalFooter";
import { pricingPlanService, PricingPlan } from "@/src/services/pricingPlanService";

interface MatrixRow {
  name: string;
  starter: string;
  professional: string;
  enterprise: string;
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-200 hover:border-slate-300">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center p-5 sm:p-6 text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
      >
        <span className="font-display text-base sm:text-lg font-semibold text-slate-900">
          {question}
        </span>
        <span
          className={`material-symbols-outlined text-slate-500 transition-transform duration-200 ${
            open ? "rotate-180 text-blue-600" : ""
          }`}
        >
          expand_more
        </span>
      </button>
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-in-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-sm text-slate-600 leading-relaxed">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
}

function Check() {
  return <span className="material-symbols-outlined text-blue-600 text-[20px]">check</span>;
}

function Minus() {
  return <span className="material-symbols-outlined text-slate-300 text-[20px]">remove</span>;
}

function displayPlanPrice(plan: PricingPlan, isAnnual: boolean, currency: "USD" | "KHR") {
  const rawPriceStr = isAnnual ? (plan.annualPrice || plan.monthlyPrice) : plan.monthlyPrice;
  if (!rawPriceStr || rawPriceStr.toLowerCase().includes("custom") || rawPriceStr.toLowerCase().includes("quote")) {
    return "Custom Quote";
  }

  const numericMatch = rawPriceStr.replace(/,/g, "").match(/[\d.]+/);
  if (!numericMatch) return rawPriceStr;

  const num = parseFloat(numericMatch[0]);
  if (isNaN(num)) return rawPriceStr;

  if (currency === "KHR") {
    return `${(num * 4100).toLocaleString()} ៛`;
  }

  return `$${num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export default function PricingPage() {
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(true);
  const [currency, setCurrency] = useState<"USD" | "KHR">("USD");
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPaymentPlan, setSelectedPaymentPlan] = useState<{ plan: PricingPlan; priceText: string } | null>(null);
  const [paymentTab, setPaymentTab] = useState<"card" | "khqr" | "paypal">("card");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [txnId, setTxnId] = useState("TXN-2026-841920");
  const [cardForm, setCardForm] = useState({
    name: "Ava Chen",
    cardNumber: "4242 4242 4242 4242",
    expiry: "12/28",
    cvc: "888",
    zip: "12000",
  });
  const [matrixData, setMatrixData] = useState<MatrixRow[]>([
    { name: "Standard Ticketing", starter: "Included", professional: "Included", enterprise: "Included" },
    { name: "AI Auto-Triage", starter: "Unavailable", professional: "Included", enterprise: "Included" },
    { name: "Omnichannel Support", starter: "Unavailable", professional: "Included", enterprise: "Included" },
    { name: "API Access & Webhooks", starter: "Unavailable", professional: "Limited", enterprise: "Included" },
    { name: "SSO & SAML Auth", starter: "Unavailable", professional: "Unavailable", enterprise: "Included" },
  ]);

  useEffect(() => {
    pricingPlanService
      .getAll()
      .then((data) => {
        const activePlans = (data || []).filter((p) => p.status === "Active");
        setPlans(activePlans);
      })
      .catch((err) => {
        console.warn("Failed to load pricing plans from API", err);
      })
      .finally(() => setLoading(false));

    const loadMatrix = () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("pricing_feature_matrix");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setMatrixData(parsed);
            }
          } catch {
            // ignore malformed saved matrix
          }
        }
      }
    };

    loadMatrix();
    window.addEventListener("pricing-matrix-updated", loadMatrix);
    return () => window.removeEventListener("pricing-matrix-updated", loadMatrix);
  }, []);

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
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col justify-between">
      <TopNav />

      <main className="flex-1">
        {/* ── HERO ── */}
        <section className="bg-white border-b border-slate-200 py-14 md:py-18">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wide mb-4">
              Plans &amp; Billing
            </span>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-4">
              Simple, transparent pricing for teams of all sizes
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
              Equip your support team with clear ticketing workflows. Choose the plan that matches your team size and SLA goals.
            </p>

            {/* Billing Toggle & Currency Switcher */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl">
                <span className={`text-sm font-medium ${!isAnnual ? "text-slate-900 font-semibold" : "text-slate-500"}`}>
                  Monthly
                </span>
                <button
                  type="button"
                  onClick={() => setIsAnnual(!isAnnual)}
                  className={`relative w-12 h-7 rounded-full p-1 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer ${
                    isAnnual ? "bg-blue-600" : "bg-slate-300"
                  }`}
                  aria-label="Toggle billing period"
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-xs transform transition-transform duration-200 ${
                      isAnnual ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
                <span className={`text-sm font-medium ${isAnnual ? "text-slate-900 font-semibold" : "text-slate-500"}`}>
                  Annual
                </span>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                  20% OFF
                </span>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setCurrency("USD")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    currency === "USD" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  USD ($)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency("KHR")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    currency === "KHR" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  KHR (៛ Riel)
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">
          {/* ── PRICING CARDS ── */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-full py-12 text-center text-slate-500 text-sm bg-white rounded-2xl border border-slate-200">
                Loading pricing plans...
              </div>
            ) : plans.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 text-sm bg-white rounded-2xl border border-slate-200">
                No active pricing plans available.
              </div>
            ) : (
              plans.map((plan) => {
                const priceText = displayPlanPrice(plan, isAnnual, currency);
                const isCustom = priceText === "Custom Quote";

                return (
                  <div
                    key={plan.id}
                    className={`bg-white p-7 rounded-2xl flex flex-col h-full relative transition-all duration-200 hover:shadow-md ${
                      plan.highlighted
                        ? "border-2 border-blue-600 shadow-sm"
                        : "border border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    {plan.highlighted && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase whitespace-nowrap">
                        Most Popular
                      </div>
                    )}
                    <div className="mb-5">
                      <div className="flex items-center gap-2 mb-2">
                        {plan.icon && (
                          <span className="material-symbols-outlined text-blue-600 text-[22px]">
                            {plan.icon}
                          </span>
                        )}
                        <h2 className="font-display text-xl font-bold text-slate-900">{plan.name}</h2>
                      </div>
                      <p className="text-sm text-slate-600 min-h-[40px] leading-relaxed">
                        {plan.description || "Tailored support plan for teams"}
                      </p>
                    </div>

                    <div className="mb-6 pb-6 border-b border-slate-100">
                      <div className="flex items-baseline gap-1">
                        <span className="font-display text-3xl sm:text-4xl text-slate-900 font-bold tabular-nums">
                          {priceText}
                        </span>
                        {!isCustom && (
                          <span className="text-slate-500 text-sm">{isAnnual ? "/yr" : "/mo"}</span>
                        )}
                      </div>
                      <p className="text-slate-500 text-xs mt-1.5 font-medium">
                        {isCustom ? "Tailored for your scale" : isAnnual ? "Billed annually" : "Billed monthly"}
                      </p>
                    </div>

                    <ul className="space-y-3 mb-8 flex-grow text-sm text-slate-700">
                      {plan.agentLimit && (
                        <li className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-blue-600 text-[18px]">group</span>
                          <span className="font-semibold">{plan.agentLimit}</span>
                        </li>
                      )}
                      {plan.storageLimit && (
                        <li className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-blue-600 text-[18px]">hard_drive</span>
                          <span>{plan.storageLimit} storage</span>
                        </li>
                      )}
                      <li className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-blue-600 text-[18px]">check_circle</span>
                        <span>Full ticketing suite access</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-blue-600 text-[18px]">check_circle</span>
                        <span>24/7 Priority support</span>
                      </li>
                    </ul>

                    <button
                      type="button"
                      onClick={() => {
                        if (isCustom) {
                          router.push("/customer/support");
                        } else {
                          setSelectedPaymentPlan({ plan, priceText });
                          setPaymentSuccess(false);
                          setIsProcessingPayment(false);
                        }
                      }}
                      className={`w-full py-2.5 px-4 text-sm font-semibold rounded-xl transition-colors text-center cursor-pointer ${
                        plan.highlighted
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                          : isCustom
                          ? "border border-slate-300 text-slate-800 hover:bg-slate-900 hover:text-white"
                          : "border border-blue-200 bg-blue-50/50 text-blue-700 hover:bg-blue-600 hover:text-white"
                      }`}
                    >
                      {isCustom ? "Contact Sales" : plan.highlighted ? "Start Free Trial" : "Start Trial"}
                    </button>
                  </div>
                );
              })
            )}
          </section>

          {/* ── FEATURE COMPARISON TABLE ── */}
          {!loading && plans.length > 0 && (
            <section className="overflow-x-auto">
              <div className="text-center mb-8">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                  Compare All Plan Features
                </h2>
                <p className="text-slate-600 text-sm mt-2">
                  Side-by-side breakdown of capabilities across plans.
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Features
                      </th>
                      <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">
                        Starter
                      </th>
                      <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">
                        Professional
                      </th>
                      <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">
                        Enterprise
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-sm">
                    {matrixData.map((row, index) => (
                      <tr key={index} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4 font-semibold text-slate-900">{row.name}</td>
                        <td className="p-4 text-center">
                          {row.starter === "Included" ? (
                            <Check />
                          ) : row.starter === "Unavailable" ? (
                            <Minus />
                          ) : (
                            <span className="text-slate-600 font-medium">{row.starter}</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {row.professional === "Included" ? (
                            <Check />
                          ) : row.professional === "Unavailable" ? (
                            <Minus />
                          ) : (
                            <span className="text-slate-600 font-medium">{row.professional}</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {row.enterprise === "Included" ? (
                            <Check />
                          ) : row.enterprise === "Unavailable" ? (
                            <Minus />
                          ) : (
                            <span className="text-slate-600 font-medium">{row.enterprise}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ── FAQ ── */}
          <section className="max-w-3xl mx-auto">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <FaqItem key={index} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </section>

          {/* ── FINAL CTA ── */}
          <section>
            <div className="bg-slate-900 border border-slate-800 p-8 sm:p-12 rounded-2xl text-center text-white">
              <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3">Still have questions?</h2>
              <p className="text-slate-300 text-base mb-7 max-w-xl mx-auto leading-relaxed">
                Our support specialists can help you choose the right tier for your team&apos;s workflow.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Link
                  href="/customer/support"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-colors"
                >
                  Talk to Support
                </Link>
                <Link
                  href="/customer/knowledge-base"
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-sm rounded-xl transition-colors"
                >
                  Browse Help Center
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* ── PAYMENT CHECKOUT POPUP MODAL ── */}
      {selectedPaymentPlan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
          onClick={() => {
            if (!isProcessingPayment) setSelectedPaymentPlan(null);
          }}
        >
          <div
            className="modal-pop bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-slate-200 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-[20px]">lock</span>
                  <h3 className="font-display text-lg font-bold text-slate-900">
                    {paymentSuccess ? "Payment Confirmation" : "Checkout & Subscribe"}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">256-Bit Encrypted SSL Secure Payment</p>
              </div>
              {!isProcessingPayment && (
                <button
                  type="button"
                  onClick={() => setSelectedPaymentPlan(null)}
                  className="p-1.5 hover:bg-slate-200/70 rounded-lg text-slate-500 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              )}
            </div>

            {paymentSuccess ? (
              <div className="p-7 text-center space-y-5">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-4xl">check_circle</span>
                </div>
                <div>
                  <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide border border-emerald-200">
                    Payment Successful
                  </span>
                  <h2 className="font-display text-2xl font-bold text-slate-900 mt-3">
                    Subscription Activated!
                  </h2>
                  <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
                    Thank you for subscribing to Kinetic. Your workspace has been upgraded to the{" "}
                    <strong className="text-slate-900">{selectedPaymentPlan.plan.name} Plan</strong>.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left space-y-2.5 text-sm max-w-md mx-auto">
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Transaction ID:</span>
                    <span className="font-mono font-semibold text-slate-900">{txnId}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Plan Subscribed:</span>
                    <span className="font-semibold text-blue-600">
                      {selectedPaymentPlan.plan.name} ({isAnnual ? "Annual" : "Monthly"})
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Amount Paid:</span>
                    <span className="font-semibold text-slate-900">{selectedPaymentPlan.priceText}</span>
                  </div>
                  <div className="flex justify-between pt-0.5">
                    <span className="text-slate-500">Next Billing Date:</span>
                    <span className="font-medium text-slate-900">
                      {isAnnual ? "Sep 03, 2027" : "Oct 03, 2026"}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentPlan(null)}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors cursor-pointer text-sm"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-5">
                {/* Plan Summary Bar */}
                <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                      Selected Plan
                    </span>
                    <h4 className="font-bold text-base text-slate-900">
                      {selectedPaymentPlan.plan.name} Plan
                    </h4>
                    <p className="text-xs text-slate-600">
                      {isAnnual ? "Billed annually (Includes 20% discount)" : "Billed monthly"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-display text-2xl font-bold text-slate-900 tabular-nums">
                      {selectedPaymentPlan.priceText}
                    </span>
                    <span className="text-xs text-slate-500 block">{isAnnual ? "/yr" : "/mo"}</span>
                  </div>
                </div>

                {/* Payment Method Tabs */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPaymentTab("card")}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-colors text-xs font-semibold cursor-pointer ${
                        paymentTab === "card"
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[22px]">credit_card</span>
                      <span>Credit / Debit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentTab("khqr")}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-colors text-xs font-semibold cursor-pointer ${
                        paymentTab === "khqr"
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[22px]">qr_code_scanner</span>
                      <span>KHQR / ABA</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentTab("paypal")}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-colors text-xs font-semibold cursor-pointer ${
                        paymentTab === "paypal"
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[22px]">account_balance_wallet</span>
                      <span>PayPal / Stripe</span>
                    </button>
                  </div>
                </div>

                {paymentTab === "card" && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardForm.name}
                        onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                        placeholder="Full name on card"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Card Number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={cardForm.cardNumber}
                          onChange={(e) => setCardForm({ ...cardForm, cardNumber: e.target.value })}
                          placeholder="4242 4242 4242 4242"
                          className="w-full pl-3.5 pr-10 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
                        />
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                          credit_card
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={cardForm.expiry}
                          onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                          placeholder="MM/YY"
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          CVC / CVV
                        </label>
                        <input
                          type="text"
                          value={cardForm.cvc}
                          onChange={(e) => setCardForm({ ...cardForm, cvc: e.target.value })}
                          placeholder="123"
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentTab === "khqr" && (
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-center space-y-2.5">
                    <div className="w-32 h-32 bg-white border-2 border-red-600 rounded-xl mx-auto p-2 flex flex-col items-center justify-center shadow-xs">
                      <span className="material-symbols-outlined text-5xl text-red-600">qr_code_2</span>
                      <span className="text-[10px] font-bold text-red-600 tracking-widest uppercase mt-1">
                        KHQR PAY
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-900">
                      Scan KHQR with ABA Mobile, Bakong, or Wing App
                    </p>
                    <p className="text-xs text-slate-500">Supports USD and KHR instant settlement.</p>
                  </div>
                )}

                {paymentTab === "paypal" && (
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-center space-y-2.5">
                    <span className="material-symbols-outlined text-4xl text-blue-600">
                      account_balance_wallet
                    </span>
                    <p className="text-xs font-semibold text-slate-900">
                      PayPal &amp; Express Stripe One-Click Checkout
                    </p>
                    <p className="text-xs text-slate-500">
                      You will be securely redirected to complete authorization.
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-4">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-emerald-600">
                      verified_user
                    </span>
                    <span>14-Day Money Back Guarantee</span>
                  </div>
                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      disabled={isProcessingPayment}
                      onClick={() => setSelectedPaymentPlan(null)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors cursor-pointer text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isProcessingPayment}
                      onClick={() => {
                        setIsProcessingPayment(true);
                        setTimeout(() => {
                          setTxnId(`TXN-2026-${Math.floor(100000 + Math.random() * 900000)}`);
                          setIsProcessingPayment(false);
                          setPaymentSuccess(true);
                        }, 1400);
                      }}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs transition-colors cursor-pointer text-sm flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isProcessingPayment ? (
                        <>
                          <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[18px]">lock</span>
                          <span>Pay {selectedPaymentPlan.priceText} Now</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <PortalFooter />
    </div>
  );
}
