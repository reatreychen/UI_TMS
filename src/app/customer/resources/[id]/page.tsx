"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronRight, ArrowLeft, Download, Share2, Eye, Calendar, CheckCircle2 } from "lucide-react";
import { TopNav } from "@/src/components/portal/TopNav";
import { PortalFooter } from "@/src/components/portal/PortalFooter";
import { fetchResourceById, fetchAllResources, ResourceRecord } from "@/src/services/portalService";

export default function ResourceDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [resource, setResource] = useState<ResourceRecord | null>(null);
  const [relatedResources, setRelatedResources] = useState<ResourceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "preview" | "notes">("overview");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  useEffect(() => {
    if (!id) return;

    Promise.all([
      fetchResourceById(id).catch(() => null),
      fetchAllResources({ status: "Published" }).catch(() => []),
    ])
      .then(([resData, allData]) => {
        if (resData) {
          setResource(resData);
          const related = (Array.isArray(allData) ? allData : [])
            .filter((r) => String(r.id) !== String(id))
            .slice(0, 3);
          setRelatedResources(related);
        }
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col">
        <TopNav />
        <main className="flex-grow py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex items-center justify-center">
          <div className="py-16 text-center text-slate-500 text-sm">
            <span className="material-symbols-outlined text-4xl animate-spin block mb-2 mx-auto text-blue-600">
              sync
            </span>
            Loading resource details...
          </div>
        </main>
        <PortalFooter />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col">
        <TopNav />
        <main className="flex-grow py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 max-w-xl mx-auto my-8 p-8 shadow-xs">
            <span className="material-symbols-outlined text-5xl text-slate-400 block mb-3 mx-auto">
              folder_off
            </span>
            <h1 className="font-display text-2xl font-bold text-slate-900 mb-2">
              Resource Not Found
            </h1>
            <p className="text-slate-600 text-sm mb-6">
              The requested resource could not be found or has been archived.
            </p>
            <Link
              href="/customer/resources"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm inline-flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="size-4" />
              Back to Resources
            </Link>
          </div>
        </main>
        <PortalFooter />
      </div>
    );
  }

  const type = resource.type || "Whitepaper";
  const isVideo = type === "Webinar" || type === "Video";

  const DEFAULT_TYPE_IMAGES: Record<string, string> = {
    "Case Study": "/images/solutions_hero_banner.jpg",
    "Video": "/images/video_tutorial_bg.jpg",
    "Webinar": "/images/support_hero_banner.jpg",
    "E-book": "/images/ebook_library_bg.jpg",
    "Whitepaper": "/images/security_whitepaper_bg.jpg",
    "Guide": "/images/guide_desk_bg.jpg",
  };

  const heroImage =
    resource.thumbnailUrl && !resource.thumbnailUrl.includes("lh3.googleusercontent.com")
      ? resource.thumbnailUrl
      : DEFAULT_TYPE_IMAGES[type] || "/images/guide_desk_bg.jpg";

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased">
      <TopNav />

      <main className="mx-auto flex w-full max-w-7xl flex-grow flex-col px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-500 flex-wrap"
        >
          <Link
            href="/customer/resources"
            className="transition-colors hover:text-blue-600 flex items-center gap-1.5"
          >
            <ArrowLeft className="size-4" />
            Resources &amp; Insights
          </Link>
          <ChevronRight aria-hidden className="size-4 text-slate-400" />
          <span>{type}</span>
          <ChevronRight aria-hidden className="size-4 text-slate-400" />
          <span className="text-slate-900 truncate max-w-xs sm:max-w-md font-semibold">
            {resource.title}
          </span>
        </nav>

        {/* Hero Section */}
        <section className="mb-10 bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-semibold">
                  <span className="material-symbols-outlined text-[16px]">
                    {isVideo ? "videocam" : type === "Case Study" ? "corporate_fare" : "auto_stories"}
                  </span>
                  {type}
                </span>
                <span className="inline-flex items-center gap-1.5 text-slate-600 text-xs bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
                  <Calendar className="size-3.5" />
                  {resource.dateAdded || "Recently published"}
                </span>
                <span className="inline-flex items-center gap-1.5 text-slate-600 text-xs bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
                  <Eye className="size-3.5" />
                  {resource.views || "1.2k"} views
                </span>
              </div>

              <h1 className="font-display text-2xl sm:text-4xl text-slate-900 font-bold leading-tight">
                {resource.title}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-3xl leading-relaxed">
                {resource.subtitle ||
                  "Practical frameworks and actionable guidance for modern support and operations teams."}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (resource.fileUrl) {
                      window.open(resource.fileUrl, "_blank");
                    }
                    showToast(`Downloading "${resource.title}"...`);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="size-4" />
                  <span>{isVideo ? "Watch Recording" : "Download Document"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => showToast("Link copied to clipboard!")}
                  className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Share2 className="size-4 text-slate-500" />
                  <span>Share Resource</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-xs aspect-[4/3] bg-slate-100 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroImage}
                  alt={resource.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/65 via-transparent to-transparent flex items-end p-4">
                  <span className="text-white text-xs font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    Official Kinetic Resource
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex border-b border-slate-200 gap-6 text-sm">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`pb-3 font-semibold transition-colors cursor-pointer ${
                  activeTab === "overview"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Executive Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`pb-3 font-semibold transition-colors cursor-pointer ${
                  activeTab === "preview"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {isVideo ? "Video Player Preview" : "Document Preview"}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("notes")}
                className={`pb-3 font-semibold transition-colors cursor-pointer ${
                  activeTab === "notes"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Key Takeaways
              </button>
            </div>

            {activeTab === "overview" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                  About This {type}
                </h2>
                <div className="text-sm sm:text-base text-slate-600 leading-relaxed space-y-4">
                  <p>
                    {resource.description ||
                      "Modern support organizations face increasing complexity across multi-tier workflows. This resource explores practical architectures, compliance benchmarks, and automation practices designed to reduce ticket triage friction and improve SLA consistency."}
                  </p>
                  <p>
                    Whether your team is scaling customer operations across regions or standardizing ticket workflows, this material provides clear frameworks and practical deployment metrics.
                  </p>
                </div>

                <div className="bg-blue-50/70 rounded-xl border border-blue-200 p-5 sm:p-6 space-y-3">
                  <h3 className="font-display text-base font-bold text-blue-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600 text-[20px]">lightbulb</span>
                    Who Should Read This?
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-800 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-600 flex-shrink-0" />
                      <span>Support &amp; Customer Success Leads</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-600 flex-shrink-0" />
                      <span>IT &amp; Operations Architects</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-600 flex-shrink-0" />
                      <span>Support Operations Managers</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-600 flex-shrink-0" />
                      <span>SLA Compliance Officers</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "preview" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs text-center">
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-10 flex flex-col items-center justify-center space-y-4">
                  <span className="material-symbols-outlined text-5xl text-blue-600">
                    {isVideo ? "play_circle" : "picture_as_pdf"}
                  </span>
                  <h3 className="font-display text-xl font-bold text-slate-900">
                    {isVideo ? "On-Demand Video Player Ready" : "Interactive PDF Preview Available"}
                  </h3>
                  <p className="text-slate-600 max-w-md text-sm">
                    {isVideo
                      ? "Stream the high-definition recording with closed captions and downloadable slide deck."
                      : "Preview the complete document online or download to read offline at your convenience."}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (resource.fileUrl) window.open(resource.fileUrl, "_blank");
                      showToast(`Opening interactive preview for "${resource.title}"...`);
                    }}
                    className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                    Launch Preview
                  </button>
                </div>
              </div>
            )}

            {activeTab === "notes" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                  Core Takeaways &amp; Findings
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-blue-600 font-bold text-base">01</span>
                    <h3 className="font-bold text-slate-900 text-sm">Automated Initial Triage</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Intelligent ticket classification reduces manual routing delays by up to 64% across support desks.
                    </p>
                  </div>
                  <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-blue-600 font-bold text-base">02</span>
                    <h3 className="font-bold text-slate-900 text-sm">Multi-Tier Escalations</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Establishing clear SLA timers with automated fallback rules prevents critical response delays.
                    </p>
                  </div>
                  <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-blue-600 font-bold text-base">03</span>
                    <h3 className="font-bold text-slate-900 text-sm">Unified Knowledge Integration</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Embedding contextual articles speeds first-contact resolution and lowers ticket volume.
                    </p>
                  </div>
                  <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-blue-600 font-bold text-base">04</span>
                    <h3 className="font-bold text-slate-900 text-sm">Continuous Compliance Audits</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Automated audit trails simplify security reviews and maintain SOC2 and ITIL 4 alignment.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
              <h3 className="font-display text-base font-bold text-slate-900 border-b border-slate-200 pb-3">
                Resource Specifications
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Format</span>
                  <span className="text-slate-900 font-semibold">
                    {isVideo ? "MP4 Recording" : "PDF Document"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">File Size</span>
                  <span className="text-slate-900 font-semibold">{isVideo ? "210 MB" : "4.8 MB"}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Downloads</span>
                  <span className="text-slate-900 font-semibold">{resource.downloads || "1.2k"}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Published Date</span>
                  <span className="text-slate-900 font-semibold">{resource.dateAdded || "Recently"}</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-slate-500">Language</span>
                  <span className="text-slate-900 font-semibold">English (US)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (resource.fileUrl) window.open(resource.fileUrl, "_blank");
                  showToast(`Downloading "${resource.title}"...`);
                }}
                className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="size-4" />
                <span>Instant Download</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
              <h3 className="font-display text-base font-bold text-slate-900 border-b border-slate-200 pb-3">
                Related Resources
              </h3>

              {relatedResources.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  No related resources available at the moment.
                </p>
              ) : (
                <div className="space-y-3">
                  {relatedResources.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/customer/resources/${rel.id}`}
                      className="group block p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-slate-50 transition-colors"
                    >
                      <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
                        {rel.type || "Whitepaper"}
                      </span>
                      <h4 className="font-semibold text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mt-1">
                        {rel.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {rel.dateAdded || "Recent"} • {rel.views || "500+"} views
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-3 text-center text-white">
              <span className="material-symbols-outlined text-3xl text-blue-400 block mx-auto">
                support_agent
              </span>
              <h3 className="font-display font-bold text-base text-white">Need Help Applying This?</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Our support specialists can help you configure these workflows in your workspace.
              </p>
              <Link
                href="/customer/create-ticket"
                className="mt-1 inline-block bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-colors"
              >
                Contact Support Desk
              </Link>
            </div>
          </div>
        </div>
      </main>

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
