"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TopNav } from "@/src/components/portal/TopNav";
import { PortalFooter } from "@/src/components/portal/PortalFooter";
import { fetchAllResources, ResourceRecord } from "@/src/services/portalService";

type Resource = {
  id?: string;
  type: string;
  typeIcon: string;
  typeColor: string;
  title: string;
  subtitle?: string;
  description: string;
  cta: string;
  ctaIcon: string;
  imgSrc: string;
  imgAlt: string;
  category: string;
  fileUrl?: string;
};

const resources: Resource[] = [
  {
    type: "Case Study",
    typeIcon: "corporate_fare",
    typeColor: "text-blue-700",
    title: "Global Logistics Giant Reduces SLA Breaches by 45%",
    description:
      "Learn how a Fortune 500 logistics firm overhauled their global ticketing architecture to achieve unprecedented reliability.",
    cta: "Read Case Study",
    ctaIcon: "arrow_forward",
    imgSrc: "/images/solutions_hero_banner.jpg",
    imgAlt: "Global logistics operations center",
    category: "Case Studies",
  },
  {
    type: "Webinar",
    typeIcon: "videocam",
    typeColor: "text-indigo-700",
    title: "AI-Driven Triage: The Future of Support Efficiency",
    description:
      "Watch our expert panel discuss the tactical application of AI in automated ticket routing and faster customer resolution.",
    cta: "Watch On-Demand",
    ctaIcon: "play_circle",
    imgSrc: "/images/video_tutorial_bg.jpg",
    imgAlt: "Webinar video presentation preview",
    category: "Webinars",
  },
  {
    type: "Guide",
    typeIcon: "auto_stories",
    typeColor: "text-slate-700",
    title: "Best Practices for Multi-Regional Support Teams",
    description:
      "Scaling your support across time zones requires more than just shifts. Explore our framework for synchronous excellence.",
    cta: "View Guide",
    ctaIcon: "arrow_forward",
    imgSrc: "/images/guide_desk_bg.jpg",
    imgAlt: "Modern support desk workspace",
    category: "Whitepapers",
  },
  {
    type: "E-book",
    typeIcon: "menu_book",
    typeColor: "text-blue-700",
    title: "The Complete Guide to ITIL 4 in Modern Enterprises",
    description:
      "An end-to-end breakdown of implementing service value systems without sacrificing agile delivery speed.",
    cta: "Download E-book",
    ctaIcon: "download",
    imgSrc: "/images/ebook_library_bg.jpg",
    imgAlt: "Enterprise service management e-book",
    category: "E-books",
  },
  {
    type: "Whitepaper",
    typeIcon: "description",
    typeColor: "text-emerald-700",
    title: "Security & Compliance in Cloud TMS",
    description:
      "A technical audit checklist and regulatory overview for deploying enterprise transportation management systems.",
    cta: "Read Whitepaper",
    ctaIcon: "arrow_forward",
    imgSrc: "/images/security_whitepaper_bg.jpg",
    imgAlt: "Cloud security and compliance overview",
    category: "Whitepapers",
  },
  {
    type: "Webinar",
    typeIcon: "videocam",
    typeColor: "text-indigo-700",
    title: "Building a Culture of Continuous Improvement in Support",
    description:
      "Join our VP of Customer Success for an interactive deep-dive into fostering a data-driven support mindset.",
    cta: "Watch On-Demand",
    ctaIcon: "play_circle",
    imgSrc: "/images/support_hero_banner.jpg",
    imgAlt: "Customer success leadership session",
    category: "Webinars",
  },
];

const FILTERS = ["All", "Case Studies", "Webinars", "Whitepapers", "E-books"] as const;
type Filter = (typeof FILTERS)[number];

function mapBackendResourceToCard(rec: ResourceRecord): Resource {
  const t = rec.type || "Whitepaper";
  let typeIcon = "auto_stories";
  let typeColor = "text-slate-700";
  let category = "Whitepapers";
  let cta = "View Guide";
  let ctaIcon = "arrow_forward";
  let imgSrc = "/images/guide_desk_bg.jpg";

  if (t === "Case Study") {
    typeIcon = "corporate_fare";
    typeColor = "text-blue-700";
    category = "Case Studies";
    cta = "Read Case Study";
    ctaIcon = "arrow_forward";
    imgSrc = "/images/solutions_hero_banner.jpg";
  } else if (t === "Video") {
    typeIcon = "videocam";
    typeColor = "text-rose-700";
    category = "Webinars";
    cta = "Watch On-Demand";
    ctaIcon = "play_circle";
    imgSrc = "/images/video_tutorial_bg.jpg";
  } else if (t === "Webinar") {
    typeIcon = "videocam";
    typeColor = "text-indigo-700";
    category = "Webinars";
    cta = "Watch On-Demand";
    ctaIcon = "play_circle";
    imgSrc = "/images/support_hero_banner.jpg";
  } else if (t === "E-book") {
    typeIcon = "menu_book";
    typeColor = "text-blue-700";
    category = "E-books";
    cta = "Download E-book";
    ctaIcon = "download";
    imgSrc = "/images/ebook_library_bg.jpg";
  } else if (t === "Whitepaper") {
    typeIcon = "description";
    typeColor = "text-emerald-700";
    category = "Whitepapers";
    cta = "Read Whitepaper";
    ctaIcon = "arrow_forward";
    imgSrc = "/images/security_whitepaper_bg.jpg";
  } else if (t === "Guide") {
    typeIcon = "auto_stories";
    typeColor = "text-slate-700";
    category = "Whitepapers";
    cta = "View Guide";
    ctaIcon = "arrow_forward";
    imgSrc = "/images/guide_desk_bg.jpg";
  }

  const recordWithLegacyImg = rec as ResourceRecord & { imgSrc?: string };
  const candidateImg = rec.thumbnailUrl || recordWithLegacyImg.imgSrc;
  const finalImg =
    candidateImg && !candidateImg.includes("lh3.googleusercontent.com")
      ? candidateImg
      : imgSrc;

  return {
    id: rec.id,
    type: t,
    typeIcon,
    typeColor,
    title: rec.title,
    subtitle: rec.subtitle,
    description:
      rec.description ||
      rec.subtitle ||
      "Comprehensive guide and industry insights for enterprise support teams.",
    cta,
    ctaIcon,
    imgSrc: finalImg,
    imgAlt: rec.title,
    category,
    fileUrl: rec.fileUrl,
  };
}

export default function ResourcesPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [resourcesList, setResourcesList] = useState<Resource[]>(resources);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState("");
  const [selectedModalResource, setSelectedModalResource] = useState<Resource | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  useEffect(() => {
    fetchAllResources()
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
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col justify-between">
      <TopNav />

      <main className="flex-1">
        {/* ── HERO ── */}
        <section className="bg-white border-b border-slate-200 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-12 items-center gap-8">
            <div className="md:col-span-7 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wide">
                Resource Library
              </span>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
                Resources &amp; Insights
              </h1>
              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Explore guides, case studies, and on-demand walkthroughs built to help your team master day-to-day support operations.
              </p>
            </div>

            <div className="md:col-span-5 hidden md:block">
              <div className="h-[240px] rounded-2xl border border-slate-200 relative overflow-hidden shadow-sm bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/ebook_library_bg.jpg"
                  alt="Enterprise Knowledge Hub Library"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/75 via-slate-900/20 to-transparent flex flex-col justify-end p-5 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-blue-300 text-[20px]">library_books</span>
                    <p className="font-display font-bold text-base text-white">Knowledge Hub</p>
                  </div>
                  <p className="text-xs text-slate-200 font-medium">
                    Guides, playbooks &amp; technical whitepapers for support teams
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
          {/* ── FEATURED CONTENT ── */}
          {resourcesList.length > 0 && (
            <section>
              <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col md:flex-row items-stretch shadow-xs transition-all hover:shadow-md">
                <div className="md:w-5/12 relative overflow-hidden h-60 md:h-auto bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={resourcesList[0].imgSrc}
                    alt={resourcesList[0].imgAlt}
                  />
                </div>
                <div className="md:w-7/12 p-7 sm:p-10 flex flex-col justify-center gap-4">
                  <div className="flex items-center gap-2.5">
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2.5 py-1 rounded-md">
                      {resourcesList[0].type}
                    </span>
                    <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">
                      Featured Release
                    </span>
                  </div>
                  {resourcesList[0].id ? (
                    <Link href={`/customer/resources/${resourcesList[0].id}`}>
                      <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer">
                        {resourcesList[0].title}
                      </h2>
                    </Link>
                  ) : (
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                      {resourcesList[0].title}
                    </h2>
                  )}
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    {resourcesList[0].description}
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    {resourcesList[0].id ? (
                      <Link
                        href={`/customer/resources/${resourcesList[0].id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm inline-flex items-center gap-2 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                        View Resource Details
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedModalResource(resourcesList[0])}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm inline-flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {resourcesList[0].ctaIcon || "download"}
                        </span>
                        {resourcesList[0].cta || "View Resource"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── RESOURCE GRID ── */}
          <section>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-slate-900">All Resources</h2>
                <p className="text-sm text-slate-600 mt-1">Filter guides and sessions by format.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setActiveFilter(f)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                      activeFilter === f
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="py-16 text-center text-slate-500 text-sm bg-white rounded-2xl border border-slate-200">
                <span className="material-symbols-outlined text-3xl animate-spin block mb-2 mx-auto text-blue-600">
                  sync
                </span>
                Loading resources...
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-sm bg-white rounded-2xl border border-slate-200">
                <span className="material-symbols-outlined text-4xl text-slate-400 block mb-2 mx-auto">
                  folder_open
                </span>
                No resources found for this category.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((res, i) => (
                  <div
                    key={res.id || `${res.title}-${i}`}
                    onClick={() => setSelectedModalResource(res)}
                    className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col transition-all duration-200 hover:border-blue-300 hover:shadow-md cursor-pointer"
                  >
                    <div className="h-44 overflow-hidden relative bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src={res.imgSrc}
                        alt={res.imgAlt}
                      />
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm border border-slate-200/80 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-xs font-semibold">
                        <span className={`material-symbols-outlined text-[15px] ${res.typeColor}`}>
                          {res.typeIcon}
                        </span>
                        <span className={res.typeColor}>{res.type}</span>
                      </div>
                    </div>
                    <div className="p-6 flex-grow flex flex-col justify-between gap-4">
                      <div>
                        <h3 className="font-display text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                          {res.title}
                        </h3>
                        <p className="mt-2 text-slate-600 text-sm line-clamp-3 leading-relaxed">
                          {res.description}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedModalResource(res);
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm font-semibold inline-flex items-center gap-1.5 group/link cursor-pointer w-fit"
                      >
                        <span>{res.cta}</span>
                        <span className="material-symbols-outlined text-[18px] transition-transform group-hover/link:translate-x-1">
                          {res.ctaIcon}
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── NEWSLETTER ── */}
          <section className="px-6 sm:px-8 py-8 bg-white border border-slate-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-md">
              <h3 className="font-display text-xl font-bold text-slate-900 mb-1.5">Stay informed</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Get the latest insights, guides, and product updates delivered once a month. No spam, ever.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="w-full max-w-sm flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="flex-grow rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 px-4 py-2.5 text-sm bg-white text-slate-900 outline-none"
              />
              <button
                type="submit"
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors cursor-pointer shrink-0 ${
                  subscribed
                    ? "bg-emerald-600 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {subscribed ? "Subscribed!" : "Subscribe"}
              </button>
            </form>
          </section>

          {/* ── FINAL CTA ── */}
          <section className="text-center bg-slate-900 text-white py-12 px-6 sm:px-10 rounded-2xl border border-slate-800">
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3">
              Ready to streamline your support?
            </h2>
            <p className="text-slate-300 text-base mb-7 max-w-2xl mx-auto leading-relaxed">
              Explore our step-by-step documentation or submit a request directly to our team.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/customer/create-ticket"
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
              >
                Submit a Request
              </Link>
              <Link
                href="/customer/knowledge-base"
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
              >
                Browse Help Center
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* Resource Detail & Download Modal */}
      {selectedModalResource && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
          onClick={() => setSelectedModalResource(null)}
        >
          <div
            className="modal-pop bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedModalResource.imgSrc}
                alt={selectedModalResource.imgAlt}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setSelectedModalResource(null)}
                className="absolute top-3.5 right-3.5 bg-slate-900/75 hover:bg-slate-900 text-white rounded-full p-1.5 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
              <div className="absolute bottom-3.5 left-3.5 bg-white/95 text-slate-900 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs">
                <span className={`material-symbols-outlined text-[16px] ${selectedModalResource.typeColor}`}>
                  {selectedModalResource.typeIcon}
                </span>
                <span className={selectedModalResource.typeColor}>{selectedModalResource.type}</span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <h3 className="font-display text-xl font-bold text-slate-900 leading-snug">
                {selectedModalResource.title}
              </h3>

              <p className="text-slate-600 leading-relaxed text-sm">
                {selectedModalResource.description}
              </p>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">description</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900">Resource Asset File</p>
                    <p className="text-xs text-slate-500 font-mono truncate">
                      {selectedModalResource.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}.pdf
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
                  Verified File
                </span>
              </div>

              <div className="pt-3 flex flex-wrap justify-between items-center gap-3 border-t border-slate-200">
                <div>
                  {selectedModalResource.id && (
                    <Link
                      href={`/customer/resources/${selectedModalResource.id}`}
                      className="text-sm font-semibold text-blue-600 hover:underline"
                    >
                      Open full page
                    </Link>
                  )}
                </div>
                <div className="flex gap-2.5 ml-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedModalResource(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors cursor-pointer text-sm"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedModalResource.fileUrl) {
                        window.open(selectedModalResource.fileUrl, "_blank");
                      }
                      showToast(`Opening "${selectedModalResource.title}"...`);
                      setSelectedModalResource(null);
                    }}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors cursor-pointer text-sm inline-flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {selectedModalResource.ctaIcon}
                    </span>
                    <span>{selectedModalResource.cta}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2.5 border border-slate-800 text-sm font-medium">
          <span className="material-symbols-outlined text-blue-400 text-[20px]">info</span>
          <span>{toastMsg}</span>
        </div>
      )}

      <PortalFooter />
    </div>
  );
}
