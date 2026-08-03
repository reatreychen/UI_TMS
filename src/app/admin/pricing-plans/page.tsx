"use client";

import { useEffect, useMemo, useState } from "react";

type PlanStatus = "Active" | "Draft" | "Inactive";
type BillingCycle = "Monthly" | "Annual" | "Custom";

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: string;
  annualPrice: string;
  agentLimit: string;
  storageLimit: string;
  subscriptions: number;
  status: PlanStatus;
  billingCycle: BillingCycle;
  highlighted?: boolean;
  icon: string;
}

interface FeatureRow {
  name: string;
  starter: string;
  professional: string;
  enterprise: string;
}

const initialPlans: PricingPlan[] = [
  {
    id: "PRIC_ST_01",
    name: "Starter",
    description: "Up to 5 agents",
    monthlyPrice: "$49.00",
    annualPrice: "$490.00",
    agentLimit: "5 agents",
    storageLimit: "100 GB",
    subscriptions: 1284,
    status: "Active",
    billingCycle: "Monthly",
    icon: "rocket_launch",
  },
  {
    id: "PRIC_PR_02",
    name: "Professional",
    description: "Up to 50 agents",
    monthlyPrice: "$199.00",
    annualPrice: "$1,990.00",
    agentLimit: "50 agents",
    storageLimit: "500 GB",
    subscriptions: 4892,
    status: "Active",
    billingCycle: "Monthly",
    highlighted: true,
    icon: "workspace_premium",
  },
  {
    id: "PRIC_EN_03",
    name: "Enterprise",
    description: "Unlimited agents",
    monthlyPrice: "Custom Quote",
    annualPrice: "Custom Quote",
    agentLimit: "Unlimited",
    storageLimit: "Unlimited",
    subscriptions: 246,
    status: "Active",
    billingCycle: "Custom",
    icon: "corporate_fare",
  },
  {
    id: "PRIC_LG_00",
    name: "Legacy Basic",
    description: "No longer sold",
    monthlyPrice: "$29.00",
    annualPrice: "$290.00",
    agentLimit: "3 agents",
    storageLimit: "25 GB",
    subscriptions: 312,
    status: "Inactive",
    billingCycle: "Annual",
    icon: "history",
  },
];

const featureRows: FeatureRow[] = [
  { name: "Standard Ticketing", starter: "Included", professional: "Included", enterprise: "Included" },
  { name: "AI Auto-Triage", starter: "Unavailable", professional: "Included", enterprise: "Included" },
  { name: "Omnichannel Support", starter: "Unavailable", professional: "Included", enterprise: "Included" },
  { name: "API Access & Webhooks", starter: "Unavailable", professional: "Limited", enterprise: "Included" },
  { name: "SSO & SAML Auth", starter: "Unavailable", professional: "Unavailable", enterprise: "Included" },
];

const statusStyles: Record<PlanStatus, { badge: string; dot: string }> = {
  Active: { badge: "bg-blue-50 text-blue-700", dot: "bg-blue-600" },
  Draft: { badge: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  Inactive: { badge: "bg-surface-container-highest text-on-surface-variant", dot: "bg-outline" },
};

const blankForm = {
  id: "",
  name: "",
  description: "",
  monthlyPrice: "",
  annualPrice: "",
  agentLimit: "",
  storageLimit: "",
  subscriptions: "0",
  status: "Draft" as PlanStatus,
  billingCycle: "Monthly" as BillingCycle,
  highlighted: false,
};

function featureValue(value: string) {
  if (value === "Included") {
    return <span className="material-symbols-outlined text-green-500">check_circle</span>;
  }

  if (value === "Limited") {
    return (
      <span className="rounded bg-surface-container-high px-2 py-0.5 text-[11px] font-bold text-on-surface-variant">
        LTD
      </span>
    );
  }

  return <span className="material-symbols-outlined text-outline-variant">cancel</span>;
}

function stripCurrency(value: string) {
  return value.replace(/[^0-9.]/g, "");
}

function formatCurrency(value: string) {
  const amount = Number.parseFloat(stripCurrency(value));

  if (Number.isNaN(amount)) {
    return "$0.00";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function ManagePricingPlansPage() {
  const [plans, setPlans] = useState<PricingPlan[]>(initialPlans);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | PlanStatus>("All");
  const [cycleFilter, setCycleFilter] = useState<"All" | BillingCycle>("All");
  const [baseCurrency, setBaseCurrency] = useState("USD - US Dollar ($)");
  const [autoExchangeRates, setAutoExchangeRates] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [form, setForm] = useState(blankForm);

  useEffect(() => {
    const handleAdminSearch = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      setSearchQuery(customEvent.detail || "");
    };

    window.addEventListener("admin-search", handleAdminSearch);
    return () => window.removeEventListener("admin-search", handleAdminSearch);
  }, []);

  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        plan.name.toLowerCase().includes(query) ||
        plan.id.toLowerCase().includes(query) ||
        plan.description.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "All" || plan.status === statusFilter;
      const matchesCycle = cycleFilter === "All" || plan.billingCycle === cycleFilter;

      return matchesSearch && matchesStatus && matchesCycle;
    });
  }, [plans, searchQuery, statusFilter, cycleFilter]);

  const activeSubscriptions = plans.reduce((sum, plan) => sum + plan.subscriptions, 0);
  const activePlanCount = plans.filter((plan) => plan.status === "Active").length;

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const openCreateModal = () => {
    setEditingPlan(null);
    setForm({ ...blankForm, id: `PRIC_NEW_${String(plans.length + 1).padStart(2, "0")}` });
    setShowModal(true);
  };

  const openEditModal = (plan: PricingPlan) => {
    setEditingPlan(plan);
    setForm({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      monthlyPrice: stripCurrency(plan.monthlyPrice),
      annualPrice: stripCurrency(plan.annualPrice),
      agentLimit: stripCurrency(plan.agentLimit),
      storageLimit: stripCurrency(plan.storageLimit),
      subscriptions: String(plan.subscriptions),
      status: plan.status,
      billingCycle: plan.billingCycle,
      highlighted: Boolean(plan.highlighted),
    });
    setShowModal(true);
  };

  const savePlan = () => {
    if (!form.name.trim() || !form.id.trim()) {
      triggerToast("Plan name and ID are required.");
      return;
    }

    const planPayload: PricingPlan = {
      id: form.id.trim(),
      name: form.name.trim(),
      description: form.description.trim() || "New pricing tier",
      monthlyPrice: form.billingCycle === "Custom" ? "Custom Quote" : formatCurrency(form.monthlyPrice),
      annualPrice: form.billingCycle === "Custom" ? "Custom Quote" : formatCurrency(form.annualPrice),
      agentLimit: form.agentLimit.trim() ? `${form.agentLimit.trim()} agents` : "Unlimited",
      storageLimit: form.storageLimit.trim() ? `${form.storageLimit.trim()} GB` : "Unlimited",
      subscriptions: Number.parseInt(form.subscriptions, 10) || 0,
      status: form.status,
      billingCycle: form.billingCycle,
      highlighted: form.highlighted,
      icon: editingPlan?.icon || "sell",
    };

    if (editingPlan) {
      setPlans((current) => current.map((plan) => (plan.id === editingPlan.id ? planPayload : plan)));
      triggerToast(`${planPayload.name} plan updated.`);
    } else {
      setPlans((current) => [planPayload, ...current]);
      triggerToast(`${planPayload.name} plan created.`);
    }

    setShowModal(false);
  };

  const toggleStatus = (planId: string) => {
    setPlans((current) =>
      current.map((plan) =>
        plan.id === planId
          ? { ...plan, status: plan.status === "Active" ? "Inactive" : "Active" }
          : plan
      )
    );
    triggerToast("Plan availability updated.");
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-stack-lg animate-in fade-in duration-300">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">
            Manage Pricing Plans
          </h2>
          <p className="mt-1 max-w-3xl text-body-md text-on-surface-variant">
            Configure marketing-site tiers, feature availability, billing cycles, tax behavior, and revenue controls for TMS subscriptions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => triggerToast("Pricing audit log opened.")}
            className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-body-md font-semibold text-on-surface shadow-xs transition-colors hover:bg-surface-container-low"
          >
            <span className="material-symbols-outlined text-[20px]">history</span>
            Audit Log
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-body-md font-semibold text-on-primary shadow-sm transition-all hover:opacity-90 active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Create New Plan
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-gutter md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-outline-variant bg-white p-stack-md shadow-xs">
          <div className="mb-3 flex items-center justify-between">
            <span className="material-symbols-outlined rounded-lg bg-primary/10 p-2 text-primary">sell</span>
            <span className="rounded bg-primary/5 px-2 py-1 text-label-md font-bold text-primary">Global</span>
          </div>
          <p className="text-label-md font-semibold uppercase tracking-wider text-secondary">Total Plans</p>
          <p className="font-display text-display font-bold text-on-surface">{plans.length}</p>
        </div>

        <div className="rounded-xl border border-outline-variant bg-white p-stack-md shadow-xs">
          <div className="mb-3 flex items-center justify-between">
            <span className="material-symbols-outlined rounded-lg bg-green-50 p-2 text-green-600">check_circle</span>
            <span className="rounded bg-green-50 px-2 py-1 text-label-md font-bold text-green-700">Selling</span>
          </div>
          <p className="text-label-md font-semibold uppercase tracking-wider text-secondary">Active Plans</p>
          <p className="font-display text-display font-bold text-on-surface">{activePlanCount}</p>
        </div>

        <div className="rounded-xl border border-outline-variant bg-white p-stack-md shadow-xs">
          <div className="mb-3 flex items-center justify-between">
            <span className="material-symbols-outlined rounded-lg bg-secondary-container/50 p-2 text-secondary">groups</span>
            <span className="rounded bg-secondary-container/50 px-2 py-1 text-label-md font-bold text-secondary">Live</span>
          </div>
          <p className="text-label-md font-semibold uppercase tracking-wider text-secondary">Subscriptions</p>
          <p className="font-display text-display font-bold text-on-surface">{activeSubscriptions.toLocaleString()}</p>
        </div>

        <div className="rounded-xl border border-outline-variant bg-white p-stack-md shadow-xs">
          <div className="mb-3 flex items-center justify-between">
            <span className="material-symbols-outlined rounded-lg bg-amber-50 p-2 text-amber-600">query_stats</span>
            <span className="rounded bg-green-50 px-2 py-1 text-label-md font-bold text-green-700">+12%</span>
          </div>
          <p className="text-label-md font-semibold uppercase tracking-wider text-secondary">Projected MRR</p>
          <p className="font-display text-display font-bold text-on-surface">$1.2M</p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-gutter lg:grid-cols-3">
        {plans.slice(0, 3).map((plan) => (
          <button
            key={plan.id}
            onClick={() => openEditModal(plan)}
            className={`group relative rounded-xl border bg-surface-container-lowest p-6 text-left shadow-xs transition-all hover:-translate-y-1 hover:shadow-md ${
              plan.highlighted ? "border-2 border-primary shadow-md" : "border-outline-variant"
            }`}
          >
            {plan.highlighted && (
              <span className="absolute right-4 top-4 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                Most Popular
              </span>
            )}
            <div className="mb-4 flex items-start justify-between gap-4">
              <span className={`material-symbols-outlined rounded-lg p-2 ${plan.highlighted ? "bg-primary text-white" : "bg-secondary-container/40 text-secondary"}`}>
                {plan.icon}
              </span>
              <span className="rounded bg-surface-container-low px-2 py-1 text-label-md font-bold text-on-surface-variant">
                {plan.id}
              </span>
            </div>
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface">{plan.name}</h3>
            <p className="text-body-md text-on-surface-variant">{plan.description}</p>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-on-surface">
                {plan.monthlyPrice.startsWith("$") ? plan.monthlyPrice.replace(".00", "") : plan.monthlyPrice}
              </span>
              <span className="text-sm text-on-surface-variant">
                {plan.billingCycle === "Custom" ? "/ annual only" : "/ month"}
              </span>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-outline-variant pt-4 text-sm">
              <span className="text-on-surface-variant">Active subscriptions</span>
              <span className="font-bold text-primary">{plan.subscriptions.toLocaleString()}</span>
            </div>
          </button>
        ))}
      </section>

      <section className="overflow-hidden rounded-xl border border-outline-variant bg-white shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant bg-surface p-4">
          <div>
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Billing Configuration</h3>
            <p className="text-body-md text-on-surface-variant">
              {filteredPlans.length} of {plans.length} plans shown
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">search</span>
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search pricing..."
                className="w-52 rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-9 pr-3 text-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "All" | PlanStatus)}
              className="rounded-lg border border-outline-variant bg-white px-3 py-2 text-body-md outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Inactive">Inactive</option>
            </select>
            <select
              value={cycleFilter}
              onChange={(event) => setCycleFilter(event.target.value as "All" | BillingCycle)}
              className="rounded-lg border border-outline-variant bg-white px-3 py-2 text-body-md outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="All">All Cycles</option>
              <option value="Monthly">Monthly</option>
              <option value="Annual">Annual</option>
              <option value="Custom">Custom</option>
            </select>
            <button
              onClick={() => triggerToast("Pricing export generated.")}
              className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high"
              title="Download pricing configuration"
            >
              <span className="material-symbols-outlined">download</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="bg-surface-container-low text-label-md uppercase tracking-wider text-on-surface-variant">
              <tr>
                <th className="px-6 py-4 font-semibold">Plan Name</th>
                <th className="px-6 py-4 font-semibold">Monthly Price</th>
                <th className="px-6 py-4 font-semibold">Annual Price</th>
                <th className="px-6 py-4 font-semibold">Billing</th>
                <th className="px-6 py-4 text-center font-semibold">Status</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-secondary">
                    No pricing plans match the current filters.
                  </td>
                </tr>
              ) : (
                filteredPlans.map((plan) => {
                  const statusStyle = statusStyles[plan.status];
                  return (
                    <tr key={plan.id} className="group transition-colors hover:bg-surface-container-low">
                      <td className="px-6 py-4">
                        <div className={plan.status === "Inactive" ? "opacity-60" : ""}>
                          <p className="font-bold text-on-surface">{plan.name}</p>
                          <p className="text-xs text-on-surface-variant">{plan.description} - {plan.id}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm">{plan.monthlyPrice}</td>
                      <td className="px-6 py-4 font-mono text-sm">
                        <span className={plan.annualPrice.startsWith("$") ? "rounded bg-green-50 px-2 py-0.5 text-green-700" : ""}>
                          {plan.annualPrice}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-body-md text-secondary">{plan.billingCycle}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyle.badge}`}>
                          <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                          {plan.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                          <button
                            onClick={() => openEditModal(plan)}
                            className="rounded-lg p-2 text-primary transition-colors hover:bg-primary/10"
                            title="Edit plan"
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button
                            onClick={() => toggleStatus(plan.id)}
                            className="rounded-lg p-2 text-secondary transition-colors hover:bg-secondary-container/60"
                            title={plan.status === "Active" ? "Deactivate plan" : "Activate plan"}
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              {plan.status === "Active" ? "pause_circle" : "play_circle"}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-stack-lg xl:grid-cols-3">
        <div className="rounded-xl border border-outline-variant bg-white shadow-xs xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant p-5">
            <div>
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Feature Matrix</h3>
              <p className="text-sm text-on-surface-variant">Map product capabilities to public pricing tiers.</p>
            </div>
            <button
              onClick={() => triggerToast("Feature matrix mapping saved.")}
              className="rounded-lg px-3 py-2 text-body-md font-bold text-primary transition-colors hover:bg-primary/10"
            >
              Update Mapping
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-low text-label-md uppercase text-on-surface-variant">
                <tr>
                  <th className="px-6 py-3">Feature Name</th>
                  <th className="px-4 py-3 text-center">Starter</th>
                  <th className="px-4 py-3 text-center">Professional</th>
                  <th className="px-4 py-3 text-center">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {featureRows.map((feature) => (
                  <tr key={feature.name} className="hover:bg-surface-container-low/60">
                    <td className="px-6 py-4 font-medium text-on-surface">{feature.name}</td>
                    <td className="px-4 py-4 text-center">{featureValue(feature.starter)}</td>
                    <td className="px-4 py-4 text-center">{featureValue(feature.professional)}</td>
                    <td className="px-4 py-4 text-center">{featureValue(feature.enterprise)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-gutter">
          <div className="rounded-xl border border-outline-variant bg-white p-6 shadow-xs">
            <h3 className="mb-4 flex items-center gap-2 font-bold text-on-surface">
              <span className="material-symbols-outlined text-primary">payments</span>
              Currency Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-on-surface-variant">Base Currency</label>
                <select
                  value={baseCurrency}
                  onChange={(event) => {
                    setBaseCurrency(event.target.value);
                    triggerToast("Currency settings saved.");
                  }}
                  className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option>USD - US Dollar ($)</option>
                  <option>EUR - Euro (EUR)</option>
                  <option>GBP - British Pound (GBP)</option>
                </select>
              </div>
              <button
                onClick={() => {
                  setAutoExchangeRates((current) => !current);
                  triggerToast("Exchange-rate automation updated.");
                }}
                className="flex w-full items-center justify-between rounded-lg py-2 text-left"
              >
                <span className="text-sm text-on-surface">Auto-update exchange rates</span>
                <span className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoExchangeRates ? "bg-primary" : "bg-outline-variant"}`}>
                  <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${autoExchangeRates ? "translate-x-6" : "translate-x-1"}`} />
                </span>
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-outline-variant bg-white p-6 shadow-xs">
            <h3 className="mb-4 flex items-center gap-2 font-bold text-on-surface">
              <span className="material-symbols-outlined text-primary">receipt_long</span>
              Tax Configuration
            </h3>
            <div className="space-y-4">
              <div className="rounded-lg border border-outline-variant/70 bg-surface p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-semibold">Standard VAT</span>
                  <span className="rounded bg-green-50 px-1.5 py-0.5 text-xs font-bold text-green-700">ACTIVE</span>
                </div>
                <p className="text-xs text-on-surface-variant">Default 20.00% applied to EU and UK customers.</p>
              </div>
              <button
                onClick={() => triggerToast("Tax rules manager opened.")}
                className="w-full rounded-lg border border-outline-variant bg-surface py-2 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low"
              >
                Manage Tax Rules
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-primary p-6 text-white shadow-lg">
            <div className="relative z-10">
              <h4 className="mb-2 font-bold">Revenue Insights</h4>
              <p className="mb-4 text-xs text-blue-100">Pricing changes typically take 24h to propagate across public pricing surfaces.</p>
              <div className="flex items-center gap-2 text-2xl font-bold">
                $1.2M
                <span className="flex items-center gap-1 rounded bg-blue-500/50 px-2 py-1 text-xs">
                  <span className="material-symbols-outlined text-[12px]">trending_up</span>
                  12%
                </span>
              </div>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-blue-200">Projected Monthly Revenue</p>
            </div>
            <span className="material-symbols-outlined absolute -bottom-5 -right-4 text-[120px] opacity-10">query_stats</span>
          </div>
        </div>
      </section>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 p-4 backdrop-blur-sm">
          <div className="modal-pop flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant bg-surface px-6 py-4">
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                {editingPlan ? "Edit Pricing Plan" : "Create New Plan"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high"
                title="Close modal"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="custom-scrollbar flex-1 space-y-8 overflow-y-auto p-6">
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-white">
                    1
                  </span>
                  <h4 className="font-bold text-on-surface">Basic Information</h4>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase text-on-surface-variant">
                      Plan Name
                    </label>
                    <input
                      value={form.name}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                      placeholder="e.g., Pro Plus"
                      className="w-full rounded-lg border border-outline-variant bg-surface p-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase text-on-surface-variant">
                      Internal ID
                    </label>
                    <input
                      readOnly
                      value={form.id}
                      className="w-full cursor-not-allowed rounded-lg border border-outline-variant bg-surface-container-low p-2.5 text-sm text-on-surface-variant outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-xs font-bold uppercase text-on-surface-variant">
                      Description
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(event) => setForm({ ...form, description: event.target.value })}
                      placeholder="Describe the target audience and key value proposition..."
                      rows={3}
                      className="w-full resize-none rounded-lg border border-outline-variant bg-surface p-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-white">
                    2
                  </span>
                  <h4 className="font-bold text-on-surface">Billing & Pricing</h4>
                </div>
                <div className="space-y-4">
                  <div className="flex flex-col gap-3 rounded-lg bg-surface-container-low p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-on-surface">Billing Cycle</p>
                      <p className="text-xs text-on-surface-variant">Toggle between monthly and annual billing</p>
                    </div>
                    <div className="flex w-fit rounded-lg border border-outline-variant bg-white p-1">
                      {(["Monthly", "Annual"] as BillingCycle[]).map((cycle) => (
                        <button
                          key={cycle}
                          onClick={() => setForm({ ...form, billingCycle: cycle })}
                          className={`rounded-md px-3 py-1 text-xs font-bold transition-colors ${
                            form.billingCycle === cycle
                              ? "bg-primary text-white"
                              : "text-on-surface-variant hover:bg-surface-container-high"
                          }`}
                        >
                          {cycle}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase text-on-surface-variant">
                        Monthly Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">
                          $
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.monthlyPrice}
                          onChange={(event) => setForm({ ...form, monthlyPrice: event.target.value })}
                          placeholder="0.00"
                          className="w-full rounded-lg border border-outline-variant bg-surface py-2.5 pl-7 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase text-on-surface-variant">
                        Annual Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">
                          $
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.annualPrice}
                          onChange={(event) => setForm({ ...form, annualPrice: event.target.value })}
                          placeholder="0.00"
                          className="w-full rounded-lg border border-outline-variant bg-surface py-2.5 pl-7 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setForm({ ...form, highlighted: !form.highlighted })}
                    className="flex w-full items-center justify-between py-2 text-left"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-sm text-on-surface">Highlight as &apos;Most Popular&apos;</span>
                      <span className="rounded bg-primary-fixed px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary">
                        Badge
                      </span>
                    </span>
                    <span className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.highlighted ? "bg-primary" : "bg-outline-variant"}`}>
                      <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${form.highlighted ? "translate-x-6" : "translate-x-1"}`} />
                    </span>
                  </button>
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-white">
                    3
                  </span>
                  <h4 className="font-bold text-on-surface">Limits & Constraints</h4>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase text-on-surface-variant">
                      Max Agents
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.agentLimit}
                      onChange={(event) => setForm({ ...form, agentLimit: event.target.value })}
                      placeholder="e.g., 100"
                      className="w-full rounded-lg border border-outline-variant bg-surface p-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase text-on-surface-variant">
                      Storage Limit (GB)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.storageLimit}
                      onChange={(event) => setForm({ ...form, storageLimit: event.target.value })}
                      placeholder="e.g., 500"
                      className="w-full rounded-lg border border-outline-variant bg-surface p-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-white">
                    4
                  </span>
                  <h4 className="font-bold text-on-surface">Visibility</h4>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-on-surface-variant">
                    Plan Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(event) => setForm({ ...form, status: event.target.value as PlanStatus })}
                    className="w-full rounded-lg border border-outline-variant bg-surface p-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Inactive">Active (Hidden)</option>
                    <option value="Active">Published</option>
                  </select>
                </div>
              </section>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-outline-variant bg-surface px-6 py-4">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg px-5 py-2 font-semibold text-on-surface transition-colors hover:bg-surface-container-high"
              >
                Cancel
              </button>
              <button
                onClick={savePlan}
                className="rounded-lg bg-primary px-5 py-2 font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
              >
                {editingPlan ? "Save Changes" : "Create Plan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-inverse-surface px-4 py-3 text-inverse-on-surface shadow-2xl animate-in slide-in-from-bottom duration-200">
          <span className="material-symbols-outlined text-green-400">check_circle</span>
          <p className="text-body-md font-medium">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}
