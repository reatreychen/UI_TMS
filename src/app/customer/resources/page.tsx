"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TopNav } from "@/src/components/portal/TopNav";
import { PortalFooter } from "@/src/components/portal/PortalFooter";
import { fetchAllResources, ResourceRecord } from "@/src/services/portalService";

// ── Resource Card ─────────────────────────────────────────────────────────────
type Resource = {
  id?: string;
  type: string;
  typeIcon: string;
  typeColor: string;
  title: string;
  description: string;
  cta: string;
  ctaIcon: string;
  imgSrc: string;
  imgAlt: string;
  category: string;
};

const resources: Resource[] = [
  {
    type: "Case Study",
    typeIcon: "corporate_fare",
    typeColor: "text-primary",
    title: "Global Logistics Giant Reduces SLA Breaches by 45%",
    description:
      "Learn how a Fortune 500 logistics firm overhauled their global ticketing architecture to achieve unprecedented reliability.",
    cta: "Read Case Study",
    ctaIcon: "arrow_forward",
    imgSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCwXl3birODmYwQTy-7FS8eywojGpOzOSKp5fsGLU-3eLF3W7oJ49lrjF_wMxShZbueq8-0ZSAO9aRqxGEULbCzKnEYXf-4yphQDfWub9wDRD2iRpmaigRov1lWmSmI0ll0TGP6pzenST05bp7jzIA_Th68j5giu9eBZs7-y53PCZGJDb6ia5NhcDEpgfsWaWvtfC7ipz96wL-JA5kwHCCc0frg90sXqtZMQIahcGA_6DeXOAxlsAbe1bwCZF2ki10RyGFXmB9xtjTm",
    imgAlt: "Aerial logistics hub",
    category: "Case Studies",
  },
  {
    type: "Webinar",
    typeIcon: "videocam",
    typeColor: "text-tertiary",
    title: "AI-Driven Triage: The Future of Support Efficiency",
    description:
      "Watch our expert panel discuss the tactical application of LLMs in automated ticket routing and initial customer resolution.",
    cta: "Watch On-Demand",
    ctaIcon: "play_circle",
    imgSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDHOyMjXdyrRLYM-pLY6vHoYgr25N4op389ZIr59bVQhF1A2U-gr4h4fC4Xq89c0ThLR0dulNYBxwIb0cwqqIBmU84WUBPW2SBhJ-VQFQrUGuUwdnNh0ZtnXL4-p-6foEQ7XNV9s4yU5TJcD3I-1Ujg-ZXKu6M-DjFxtIWBSj6D9nEmc5iwPgiPiSgJjIFKD3AYNHIhA7ezCHST95Y_imLVZHHQWxwa5KmZCr2raOAXyCWqRjGHrK11rLHVwJpt5TvoOyELM0tbNXsM",
    imgAlt: "AI neural network graphic",
    category: "Webinars",
  },
  {
    type: "Guide",
    typeIcon: "auto_stories",
    typeColor: "text-on-secondary-fixed-variant",
    title: "Best Practices for Multi-Regional Support Teams",
    description:
      "Scaling your support across time zones requires more than just shifts. Explore our framework for synchronous excellence.",
    cta: "View Guide",
    ctaIcon: "arrow_forward",
    imgSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAwUK6h-n768hgfEdMCJin1ysjYc6kwhZYm4Q-_uQAl1rw_U4cKDsp29TYw-OeQWBPnw1TiMdUJEEb9zFyphXpbif_sAIvRX9aNSWcqSVwZBACwO90HW2xXPtXIsVuN74ibKGo1TKOwnjkoHRsWFFcuj3-6PzCNn2N3kHTLseZ6V9HqG8ee1Zp9GIhz9V954UtCS5pWvApesOJTP1VGBXoEW71vTyXjxpWB3lPa6_2bM-qqquDrvCQqjjq1GEvvvo_Prq86FB6bfwpn",
    imgAlt: "Modern desk workspace",
    category: "Whitepapers",
  },
  {
    type: "E-book",
    typeIcon: "menu_book",
    typeColor: "text-primary",
    title: "The Complete Guide to ITIL 4 in Modern Enterprises",
    description:
      "An end-to-end breakdown of implementing service value systems without sacrificing agile delivery speed.",
    cta: "Download E-book",
    ctaIcon: "download",
    imgSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAwUK6h-n768hgfEdMCJin1ysjYc6kwhZYm4Q-_uQAl1rw_U4cKDsp29TYw-OeQWBPnw1TiMdUJEEb9zFyphXpbif_sAIvRX9aNSWcqSVwZBACwO90HW2xXPtXIsVuN74ibKGo1TKOwnjkoHRsWFFcuj3-6PzCNn2N3kHTLseZ6V9HqG8ee1Zp9GIhz9V954UtCS5pWvApesOJTP1VGBXoEW71vTyXjxpWB3lPa6_2bM-qqquDrvCQqjjq1GEvvvo_Prq86FB6bfwpn",
    imgAlt: "Stack of books and tablet",
    category: "E-books",
  },
  {
    type: "Whitepaper",
    typeIcon: "description",
    typeColor: "text-on-secondary-fixed-variant",
    title: "Security & Compliance in Cloud TMS",
    description:
      "A technical audit checklist and regulatory overview for deploying enterprise transportation management systems.",
    cta: "Read Whitepaper",
    ctaIcon: "arrow_forward",
    imgSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCwXl3birODmYwQTy-7FS8eywojGpOzOSKp5fsGLU-3eLF3W7oJ49lrjF_wMxShZbueq8-0ZSAO9aRqxGEULbCzKnEYXf-4yphQDfWub9wDRD2iRpmaigRov1lWmSmI0ll0TGP6pzenST05bp7jzIA_Th68j5giu9eBZs7-y53PCZGJDb6ia5NhcDEpgfsWaWvtfC7ipz96wL-JA5kwHCCc0frg90sXqtZMQIahcGA_6DeXOAxlsAbe1bwCZF2ki10RyGFXmB9xtjTm",
    imgAlt: "Digital security shield",
    category: "Whitepapers",
  },
  {
    type: "Webinar",
    typeIcon: "videocam",
    typeColor: "text-tertiary",
    title: "Building a Culture of Continuous Improvement in Support",
    description:
      "Join our VP of Customer Success for an interactive deep-dive into fostering a data-driven support mindset.",
    cta: "Watch On-Demand",
    ctaIcon: "play_circle",
    imgSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDHOyMjXdyrRLYM-pLY6vHoYgr25N4op389ZIr59bVQhF1A2U-gr4h4fC4Xq89c0ThLR0dulNYBxwIb0cwqqIBmU84WUBPW2SBhJ-VQFQrUGuUwdnNh0ZtnXL4-p-6foEQ7XNV9s4yU5TJcD3I-1Ujg-ZXKu6M-DjFxtIWBSj6D9nEmc5iwPgiPiSgJjIFKD3AYNHIhA7ezCHST95Y_imLVZHHQWxwa5KmZCr2raOAXyCWqRjGHrK11rLHVwJpt5TvoOyELM0tbNXsM",
    imgAlt: "AI network mesh",
    category: "Webinars",
  },
];

const FILTERS = ["All", "Case Studies", "Webinars", "Whitepapers", "E-books"] as const;
type Filter = (typeof FILTERS)[number];

function mapBackendResourceToCard(rec: ResourceRecord): Resource {
  const t = rec.type || "Whitepaper";
  let typeIcon = "auto_stories";
  let typeColor = "text-on-secondary-fixed-variant";
  let category = "Whitepapers";
  let cta = "View Guide";
  let ctaIcon = "arrow_forward";
  let imgSrc =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAwUK6h-n768hgfEdMCJin1ysjYc6kwhZYm4Q-_uQAl1rw_U4cKDsp29TYw-OeQWBPnw1TiMdUJEEb9zFyphXpbif_sAIvRX9aNSWcqSVwZBACwO90HW2xXPtXIsVuN74ibKGo1TKOwnjkoHRsWFFcuj3-6PzCNn2N3kHTLseZ6V9HqG8ee1Zp9GIhz9V954UtCS5pWvApesOJTP1VGBXoEW71vTyXjxpWB3lPa6_2bM-qqquDrvCQqjjq1GEvvvo_Prq86FB6bfwpn";

  if (t === "Case Study") {
    typeIcon = "corporate_fare";
    typeColor = "text-primary";
    category = "Case Studies";
    cta = "Read Case Study";
    ctaIcon = "arrow_forward";
    imgSrc =
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCwXl3birODmYwQTy-7FS8eywojGpOzOSKp5fsGLU-3eLF3W7oJ49lrjF_wMxShZbueq8-0ZSAO9aRqxGEULbCzKnEYXf-4yphQDfWub9wDRD2iRpmaigRov1lWmSmI0ll0TGP6pzenST05bp7jzIA_Th68j5giu9eBZs7-y53PCZGJDb6ia5NhcDEpgfsWaWvtfC7ipz96wL-JA5kwHCCc0frg90sXqtZMQIahcGA_6DeXOAxlsAbe1bwCZF2ki10RyGFXmB9xtjTm";
  } else if (t === "Webinar" || t === "Video") {
    typeIcon = "videocam";
    typeColor = "text-tertiary";
    category = "Webinars";
    cta = "Watch On-Demand";
    ctaIcon = "play_circle";
    imgSrc =
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDHOyMjXdyrRLYM-pLY6vHoYgr25N4op389ZIr59bVQhF1A2U-gr4h4fC4Xq89c0ThLR0dulNYBxwIb0cwqqIBmU84WUBPW2SBhJ-VQFQrUGuUwdnNh0ZtnXL4-p-6foEQ7XNV9s4yU5TJcD3I-1Ujg-ZXKu6M-DjFxtIWBSj6D9nEmc5iwPgiPiSgJjIFKD3AYNHIhA7ezCHST95Y_imLVZHHQWxwa5KmZCr2raOAXyCWqRjGHrK11rLHVwJpt5TvoOyELM0tbNXsM";
  } else if (t === "E-book") {
    typeIcon = "menu_book";
    typeColor = "text-primary";
    category = "E-books";
    cta = "Download E-book";
    ctaIcon = "download";
    imgSrc =
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAwUK6h-n768hgfEdMCJin1ysjYc6kwhZYm4Q-_uQAl1rw_U4cKDsp29TYw-OeQWBPnw1TiMdUJEEb9zFyphXpbif_sAIvRX9aNSWcqSVwZBACwO90HW2xXPtXIsVuN74ibKGo1TKOwnjkoHRsWFFcuj3-6PzCNn2N3kHTLseZ6V9HqG8ee1Zp9GIhz9V954UtCS5pWvApesOJTP1VGBXoEW71vTyXjxpWB3lPa6_2bM-qqquDrvCQqjjq1GEvvvo_Prq86FB6bfwpn";
  }

  return {
    id: rec.id,
    type: t,
    typeIcon,
    typeColor,
    title: rec.title,
    description:
      rec.description ||
      rec.subtitle ||
      "Comprehensive guide and industry insights for enterprise logistics teams.",
    cta,
    ctaIcon,
    imgSrc,
    imgAlt: rec.title,
    category,
  };
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ResourcesPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [resourcesList, setResourcesList] = useState<Resource[]>(resources);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  useEffect(() => {
    setIsLoading(true);
    fetchAllResources({ status: "Published" })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setResourcesList(data.map(mapBackendResourceToCard));
        }
      })
      .catch((err) => {
        console.error("Failed to fetch customer resources:", err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filtered =
    activeFilter === "All"
      ? resourcesList
      : resourcesList.filter((r) => r.category === activeFilter);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background text-on-background font-body-md antialiased">
      <TopNav activePage="dashboard" />

      <main className="pt-24 pb-stack-lg px-container-margin max-w-[1440px] mx-auto">
        {/* ── HERO ── */}
        <section className="mb-16 text-center md:text-left">
          <div className="grid md:grid-cols-2 items-center gap-stack-lg">
            <div className="space-y-stack-md">
              <span className="text-primary font-label-md text-label-md tracking-widest uppercase">
                Knowledge Hub
              </span>
              <h1 className="font-display text-display text-on-surface">
                Resources &amp; Insights
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                Empowering your team with industry-leading research, guides, and
                expertise to master enterprise-scale support operations.
              </p>
            </div>
            {/* Decorative illustration */}
            <div className="hidden md:flex h-[260px] items-center justify-center rounded-xl bg-surface-container border border-outline-variant relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/40 to-secondary-container/40" />
              <div className="relative z-10 text-center space-y-2">
                <span className="material-symbols-outlined text-[64px] text-primary opacity-80">
                  library_books
                </span>
                <p className="font-headline-md text-headline-md text-primary">
                  Knowledge Hub
                </p>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  2,400+ resources &amp; growing
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURED CONTENT ── */}
        {resourcesList.length > 0 && (
          <section className="mb-20">
            <div className="relative group bg-surface-container-low rounded-xl border border-outline-variant overflow-hidden flex flex-col md:flex-row items-stretch shadow-sm transition-all hover:shadow-md">
              <div className="md:w-1/2 relative overflow-hidden h-64 md:h-auto">
                <div className="absolute inset-0 bg-primary opacity-10 mix-blend-overlay z-10" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  src={resourcesList[0].imgSrc}
                  alt={resourcesList[0].imgAlt}
                />
              </div>
              <div className="md:w-1/2 p-stack-lg flex flex-col justify-center gap-stack-md">
                <div className="flex items-center gap-stack-sm">
                  <span className="bg-secondary-container text-on-secondary-container font-label-md text-label-md px-2 py-1 rounded">
                    {resourcesList[0].type}
                  </span>
                  <span className="text-on-surface-variant font-label-md text-label-md">
                    Featured Release
                  </span>
                </div>
                {resourcesList[0].id ? (
                  <Link href={`/customer/resources/${resourcesList[0].id}`}>
                    <h2 className="font-headline-lg text-headline-lg text-on-surface hover:text-primary transition-colors cursor-pointer">
                      {resourcesList[0].title}
                    </h2>
                  </Link>
                ) : (
                  <h2 className="font-headline-lg text-headline-lg text-on-surface">
                    {resourcesList[0].title}
                  </h2>
                )}
                <p className="font-body-md text-body-md text-on-surface-variant">
                  {resourcesList[0].description}
                </p>
                <div className="pt-stack-md flex flex-wrap items-center gap-3">
                  {resourcesList[0].id ? (
                    <Link
                      href={`/customer/resources/${resourcesList[0].id}`}
                      className="bg-primary text-on-primary px-stack-lg py-stack-sm rounded-lg font-label-md text-label-md flex items-center gap-2 hover:brightness-110 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        open_in_new
                      </span>
                      View Resource Details
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => showToast(`Opening "${resourcesList[0].title}"...`)}
                      className="bg-primary text-on-primary px-stack-lg py-stack-sm rounded-lg font-label-md text-label-md flex items-center gap-2 hover:brightness-110 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {resourcesList[0].ctaIcon || "download"}
                      </span>
                      {resourcesList[0].cta || "Download Now"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── RESOURCE GRID ── */}
        <section className="mb-24">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-stack-lg gap-stack-md">
            <h3 className="font-headline-md text-headline-md text-on-surface">
              All Resources
            </h3>
            <div className="flex flex-wrap justify-center gap-stack-sm">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActiveFilter(f)}
                  className={`px-4 py-2 rounded-full font-label-md text-label-md transition-colors ${
                    activeFilter === f
                      ? "bg-primary-container text-on-primary-container"
                      : "bg-surface-container-high text-on-surface hover:bg-surface-variant"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          {isLoading ? (
            <div className="py-20 text-center text-on-surface-variant font-body-md">
              <span className="material-symbols-outlined text-4xl animate-spin block mb-2 mx-auto">
                sync
              </span>
              Loading resources...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-on-surface-variant font-body-md bg-surface-container-low rounded-xl border border-outline-variant">
              <span className="material-symbols-outlined text-4xl text-outline block mb-2 mx-auto">
                folder_open
              </span>
              No resources found for this category.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-stack-lg">
            {filtered.map((res, i) => (
              <div
                key={i}
                className="group bg-surface rounded-xl border border-outline-variant overflow-hidden shadow-sm flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-lg"
              >
                <div className="h-48 overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={res.imgSrc}
                    alt={res.imgAlt}
                  />
                  <div className="absolute top-4 left-4 bg-surface/90 backdrop-blur-md text-label-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                    <span
                      className={`material-symbols-outlined text-[14px] ${res.typeColor}`}
                    >
                      {res.typeIcon}
                    </span>
                    <span className={res.typeColor}>{res.type}</span>
                  </div>
                </div>
                <div className="p-stack-md flex-grow flex flex-col justify-between">
                  <div>
                    {res.id ? (
                      <Link href={`/customer/resources/${res.id}`}>
                        <h4 className="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors cursor-pointer">
                          {res.title}
                        </h4>
                      </Link>
                    ) : (
                      <h4 className="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors">
                        {res.title}
                      </h4>
                    )}
                    <p className="mt-stack-sm text-on-surface-variant font-body-md text-body-md line-clamp-3">
                      {res.description}
                    </p>
                  </div>
                  {res.id ? (
                    <Link
                      href={`/customer/resources/${res.id}`}
                      className="mt-stack-md text-primary font-label-md text-label-md flex items-center gap-1 group/link cursor-pointer"
                    >
                      {res.cta}
                      <span className="material-symbols-outlined text-[16px] transition-transform group-hover/link:translate-x-1">
                        {res.ctaIcon}
                      </span>
                    </Link>
                  ) : (
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        showToast(`Opening "${res.title}"...`);
                      }}
                      className="mt-stack-md text-primary font-label-md text-label-md flex items-center gap-1 group/link cursor-pointer"
                    >
                      {res.cta}
                      <span className="material-symbols-outlined text-[16px] transition-transform group-hover/link:translate-x-1">
                        {res.ctaIcon}
                      </span>
                    </a>
                  )}
                </div>
              </div>
            ))}
            </div>
          )}
        </section>

        {/* ── NEWSLETTER ── */}
        <section className="mb-24 px-stack-lg py-stack-lg bg-surface-container rounded-2xl flex flex-col md:flex-row items-center justify-between gap-stack-lg">
          <div className="max-w-md">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-2">
              Stay informed
            </h3>
            <p className="text-on-surface-variant font-body-md text-body-md">
              Get the latest insights, reports, and event invitations delivered to your
              inbox once a month. No spam, ever.
            </p>
          </div>
          <form
            onSubmit={handleSubscribe}
            className="w-full max-w-sm flex gap-2"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="flex-grow rounded-lg border border-outline-variant focus:ring-primary focus:border-primary px-4 py-2 font-body-md text-body-md bg-surface"
            />
            <button
              type="submit"
              className={`px-stack-md py-stack-sm rounded-lg font-label-md text-label-md transition-all ${
                subscribed
                  ? "bg-green-600 text-white"
                  : "bg-primary text-on-primary hover:brightness-110"
              }`}
            >
              {subscribed ? "Success!" : "Subscribe"}
            </button>
          </form>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="text-center bg-inverse-surface text-inverse-on-surface py-stack-lg px-stack-lg rounded-3xl relative overflow-hidden mb-8">
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_white,_transparent)]" />
          <div className="relative z-10">
            <h2 className="font-display text-display mb-stack-md">
              Ready to elevate your support?
            </h2>
            <p className="font-body-lg text-body-lg mb-stack-lg max-w-2xl mx-auto opacity-90">
              Join thousands of industry leaders using Kinetic to transform their
              ticket management systems.
            </p>
            <div className="flex flex-wrap justify-center gap-stack-md">
              <Link
                href="/customer/create-ticket"
                className="bg-primary-container text-on-primary-container px-8 py-3 rounded-xl font-label-md text-label-md hover:scale-105 transition-transform"
              >
                Get a Demo
              </Link>
              <Link
                href="/customer/knowledge-base"
                className="bg-transparent border border-inverse-on-surface/30 text-inverse-on-surface px-8 py-3 rounded-xl font-label-md text-label-md hover:bg-inverse-on-surface/10 transition-colors"
              >
                View Case Studies
              </Link>
            </div>
          </div>
        </section>
      </main>

      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in border border-outline-variant/20">
          <span className="material-symbols-outlined text-primary">info</span>
          <span className="font-label-md text-label-md">{toastMsg}</span>
        </div>
      )}

      <PortalFooter />
    </div>
  );
}
