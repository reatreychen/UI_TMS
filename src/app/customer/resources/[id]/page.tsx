"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight, ArrowLeft, Download, Share2, Eye, Calendar, FileText, CheckCircle2, BookOpen, Video, ExternalLink } from "lucide-react";
import { TopNav } from "@/src/components/portal/TopNav";
import { PortalFooter } from "@/src/components/portal/PortalFooter";
import { fetchResourceById, fetchAllResources, ResourceRecord } from "@/src/services/portalService";

export default function ResourceDetailPage() {
  const params = useParams();
  const router = useRouter();
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
    setIsLoading(true);

    // Fetch primary resource and related published resources
    Promise.all([
      fetchResourceById(id).catch(() => null),
      fetchAllResources({ status: "Published" }).catch(() => []),
    ])
      .then(([resData, allData]) => {
        if (resData) {
          setResource(resData);
          // Filter related resources (exclude current resource)
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
      <div className="min-h-screen bg-background text-on-background font-body-md antialiased flex flex-col">
        <TopNav activePage="dashboard" />
        <main className="flex-grow pt-24 pb-stack-lg px-container-margin max-w-[1440px] mx-auto w-full flex items-center justify-center">
          <div className="py-20 text-center text-on-surface-variant font-body-md">
            <span className="material-symbols-outlined text-4xl animate-spin block mb-2 mx-auto text-primary">
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
      <div className="min-h-screen bg-background text-on-background font-body-md antialiased flex flex-col">
        <TopNav activePage="dashboard" />
        <main className="flex-grow pt-24 pb-stack-lg px-container-margin max-w-[1440px] mx-auto w-full">
          <div className="py-20 text-center text-on-surface-variant font-body-md bg-surface-container-low rounded-2xl border border-outline-variant max-w-2xl mx-auto my-12 p-8">
            <span className="material-symbols-outlined text-5xl text-outline block mb-3 mx-auto">
              folder_off
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">
              Resource Not Found
            </h2>
            <p className="text-on-surface-variant font-body-md mb-6">
              The requested resource could not be found or has been archived.
            </p>
            <Link
              href="/customer/resources"
              className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-label-md inline-flex items-center gap-2 hover:brightness-110 transition-all"
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
  const heroImage =
    type === "Case Study"
      ? "https://lh3.googleusercontent.com/aida-public/AB6AXuCwXl3birODmYwQTy-7FS8eywojGpOzOSKp5fsGLU-3eLF3W7oJ49lrjF_wMxShZbueq8-0ZSAO9aRqxGEULbCzKnEYXf-4yphQDfWub9wDRD2iRpmaigRov1lWmSmI0ll0TGP6pzenST05bp7jzIA_Th68j5giu9eBZs7-y53PCZGJDb6ia5NhcDEpgfsWaWvtfC7ipz96wL-JA5kwHCCc0frg90sXqtZMQIahcGA_6DeXOAxlsAbe1bwCZF2ki10RyGFXmB9xtjTm"
      : isVideo
      ? "https://lh3.googleusercontent.com/aida-public/AB6AXuDHOyMjXdyrRLYM-pLY6vHoYgr25N4op389ZIr59bVQhF1A2U-gr4h4fC4Xq89c0ThLR0dulNYBxwIb0cwqqIBmU84WUBPW2SBhJ-VQFQrUGuUwdnNh0ZtnXL4-p-6foEQ7XNV9s4yU5TJcD3I-1Ujg-ZXKu6M-DjFxtIWBSj6D9nEmc5iwPgiPiSgJjIFKD3AYNHIhA7ezCHST95Y_imLVZHHQWxwa5KmZCr2raOAXyCWqRjGHrK11rLHVwJpt5TvoOyELM0tbNXsM"
      : "https://lh3.googleusercontent.com/aida-public/AB6AXuAwUK6h-n768hgfEdMCJin1ysjYc6kwhZYm4Q-_uQAl1rw_U4cKDsp29TYw-OeQWBPnw1TiMdUJEEb9zFyphXpbif_sAIvRX9aNSWcqSVwZBACwO90HW2xXPtXIsVuN74ibKGo1TKOwnjkoHRsWFFcuj3-6PzCNn2N3kHTLseZ6V9HqG8ee1Zp9GIhz9V954UtCS5pWvApesOJTP1VGBXoEW71vTyXjxpWB3lPa6_2bM-qqquDrvCQqjjq1GEvvvo_Prq86FB6bfwpn";

  return (
    <div className="flex min-h-screen flex-col bg-background font-body-md text-on-background antialiased">
      <TopNav activePage="dashboard" />

      <main className="mx-auto flex w-full max-w-[1440px] flex-grow flex-col px-container-margin pt-24 pb-stack-lg">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex items-center gap-2 text-label-md font-semibold text-secondary flex-wrap"
        >
          <Link
            href="/customer/resources"
            className="transition-colors hover:text-primary flex items-center gap-1.5"
          >
            <ArrowLeft className="size-4" />
            Resources &amp; Insights
          </Link>
          <ChevronRight aria-hidden className="size-4 text-outline" />
          <span className="text-secondary">{type}</span>
          <ChevronRight aria-hidden className="size-4 text-outline" />
          <span className="text-on-surface truncate max-w-xs sm:max-w-md font-bold">
            {resource.title}
          </span>
        </nav>

        {/* Hero Section */}
        <section className="mb-12 bg-surface-container-low rounded-3xl border border-outline-variant p-8 md:p-12 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full font-label-md text-label-md font-semibold">
                  <span className="material-symbols-outlined text-[16px]">
                    {isVideo ? "videocam" : type === "Case Study" ? "corporate_fare" : "auto_stories"}
                  </span>
                  {type}
                </span>
                <span className="inline-flex items-center gap-1 text-secondary text-label-md bg-surface-container-high px-3 py-1 rounded-full">
                  <Calendar className="size-3.5" />
                  {resource.dateAdded || "Recently published"}
                </span>
                <span className="inline-flex items-center gap-1 text-secondary text-label-md bg-surface-container-high px-3 py-1 rounded-full">
                  <Eye className="size-3.5" />
                  {resource.views || "1.2k"} views
                </span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl text-on-surface font-bold leading-tight">
                {resource.title}
              </h1>

              <p className="font-body-lg text-lg text-on-surface-variant max-w-3xl leading-relaxed">
                {resource.subtitle || "Enterprise research, frameworks, and actionable guidance for high-performing support teams."}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => showToast(`Downloading "${resource.title}"...`)}
                  className="bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md flex items-center gap-2.5 hover:brightness-110 shadow-sm transition-all cursor-pointer"
                >
                  <Download className="size-5" />
                  <span>{isVideo ? "Download Recording" : "Download PDF Document"}</span>
                </button>
                <button
                  onClick={() => showToast("Link copied to clipboard!")}
                  className="bg-surface border border-outline-variant text-on-surface px-5 py-3 rounded-xl font-label-md flex items-center gap-2 hover:bg-surface-container-high transition-all cursor-pointer"
                >
                  <Share2 className="size-4 text-secondary" />
                  <span>Share Resource</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <div className="relative w-full max-w-sm rounded-2xl overflow-hidden border border-outline-variant shadow-md aspect-[4/3] bg-surface group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroImage}
                  alt={resource.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                  <span className="text-white font-label-md text-sm drop-shadow-sm flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    Official Kinetic Resource
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* Navigation Tabs */}
            <div className="flex border-b border-outline-variant gap-8 font-label-md">
              <button
                onClick={() => setActiveTab("overview")}
                className={`pb-3 font-semibold transition-colors relative ${
                  activeTab === "overview"
                    ? "text-primary border-b-2 border-primary"
                    : "text-secondary hover:text-on-surface"
                }`}
              >
                Executive Overview
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className={`pb-3 font-semibold transition-colors relative ${
                  activeTab === "preview"
                    ? "text-primary border-b-2 border-primary"
                    : "text-secondary hover:text-on-surface"
                }`}
              >
                {isVideo ? "Video Player Preview" : "Document Preview"}
              </button>
              <button
                onClick={() => setActiveTab("notes")}
                className={`pb-3 font-semibold transition-colors relative ${
                  activeTab === "notes"
                    ? "text-primary border-b-2 border-primary"
                    : "text-secondary hover:text-on-surface"
                }`}
              >
                Key Takeaways
              </button>
            </div>

            {/* Tab 1: Overview */}
            {activeTab === "overview" && (
              <div className="bg-surface rounded-2xl border border-outline-variant p-8 space-y-6">
                <h3 className="font-headline-md text-2xl font-bold text-on-surface">
                  About This {type}
                </h3>
                <div className="prose max-w-none text-on-surface-variant leading-relaxed space-y-4">
                  <p>
                    {resource.description ||
                      "Modern logistics organizations face increasing complexity across multi-tier supply chain networks. This resource explores practical architectures, compliance benchmarks, and automation paradigms designed to reduce ticket triage friction and eliminate SLA breaches."}
                  </p>
                  <p>
                    Whether your team is scaling support from regional operations to enterprise global deployment or modernizing legacy ticketing workflows, this material provides peer-reviewed frameworks and real-world deployment metrics.
                  </p>
                </div>

                {/* Highlight Box */}
                <div className="bg-primary/5 rounded-xl border border-primary/20 p-6 space-y-3">
                  <h4 className="font-headline-md text-lg font-bold text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined">lightbulb</span>
                    Who Should Read This?
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-on-surface text-body-md">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-green-600 flex-shrink-0" />
                      <span>VP of Support &amp; Customer Success</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-green-600 flex-shrink-0" />
                      <span>Logistics &amp; Dispatch IT Architects</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-green-600 flex-shrink-0" />
                      <span>Support Operations Managers</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-green-600 flex-shrink-0" />
                      <span>SLA Compliance Officers</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Tab 2: Preview */}
            {activeTab === "preview" && (
              <div className="bg-surface rounded-2xl border border-outline-variant p-8 space-y-6 text-center">
                <div className="bg-surface-container-low rounded-xl border border-outline-variant p-12 flex flex-col items-center justify-center space-y-4">
                  <span className="material-symbols-outlined text-6xl text-primary opacity-80">
                    {isVideo ? "play_circle" : "picture_as_pdf"}
                  </span>
                  <h4 className="font-headline-md text-xl font-bold text-on-surface">
                    {isVideo ? "On-Demand Video Player Ready" : "Interactive PDF Preview Available"}
                  </h4>
                  <p className="text-on-surface-variant max-w-md text-sm">
                    {isVideo
                      ? "Stream the high-definition recording with closed captions and downloadable slide deck."
                      : "Preview the complete document online or download to read offline at your convenience."}
                  </p>
                  <button
                    onClick={() => showToast(`Opening interactive preview for "${resource.title}"...`)}
                    className="mt-2 bg-primary text-on-primary px-6 py-2.5 rounded-xl font-label-md inline-flex items-center gap-2 hover:brightness-110 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                    Launch Fullscreen Preview
                  </button>
                </div>
              </div>
            )}

            {/* Tab 3: Notes & Takeaways */}
            {activeTab === "notes" && (
              <div className="bg-surface rounded-2xl border border-outline-variant p-8 space-y-6">
                <h3 className="font-headline-md text-2xl font-bold text-on-surface">
                  Core Takeaways &amp; Findings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-xl bg-surface-container-low border border-outline-variant space-y-2">
                    <span className="text-primary font-bold text-lg">01</span>
                    <h4 className="font-bold text-on-surface">Automated Initial Triage</h4>
                    <p className="text-sm text-on-surface-variant">
                      LLM-assisted ticket classification reduces manual routing delays by up to 64% across enterprise logistics desks.
                    </p>
                  </div>
                  <div className="p-5 rounded-xl bg-surface-container-low border border-outline-variant space-y-2">
                    <span className="text-primary font-bold text-lg">02</span>
                    <h4 className="font-bold text-on-surface">Multi-Tier Escalations</h4>
                    <p className="text-sm text-on-surface-variant">
                      Establishing clear SLA timers with automated fallback rules prevents critical breach anomalies.
                    </p>
                  </div>
                  <div className="p-5 rounded-xl bg-surface-container-low border border-outline-variant space-y-2">
                    <span className="text-primary font-bold text-lg">03</span>
                    <h4 className="font-bold text-on-surface">Unified Knowledge Integration</h4>
                    <p className="text-sm text-on-surface-variant">
                      Embedding contextual articles within agent ticket views speeds first-contact resolution by 38%.
                    </p>
                  </div>
                  <div className="p-5 rounded-xl bg-surface-container-low border border-outline-variant space-y-2">
                    <span className="text-primary font-bold text-lg">04</span>
                    <h4 className="font-bold text-on-surface">Continuous Compliance Audits</h4>
                    <p className="text-sm text-on-surface-variant">
                      Automated audit trails simplify security reviews and ensure SOC2 and ITIL 4 alignment.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar Column */}
          <div className="lg:col-span-4 space-y-8">
            {/* Resource Metadata Card */}
            <div className="bg-surface rounded-2xl border border-outline-variant p-6 space-y-5">
              <h4 className="font-headline-md text-lg font-bold text-on-surface border-b border-outline-variant pb-3">
                Resource Specifications
              </h4>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center py-1 border-b border-outline-variant/40">
                  <span className="text-secondary font-medium">Format</span>
                  <span className="text-on-surface font-semibold">{isVideo ? "MP4 Recording" : "PDF Document"}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-outline-variant/40">
                  <span className="text-secondary font-medium">File Size</span>
                  <span className="text-on-surface font-semibold">{isVideo ? "210 MB" : "4.8 MB"}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-outline-variant/40">
                  <span className="text-secondary font-medium">Downloads</span>
                  <span className="text-on-surface font-semibold">{resource.downloads || "1.2k"}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-outline-variant/40">
                  <span className="text-secondary font-medium">Published Date</span>
                  <span className="text-on-surface font-semibold">{resource.dateAdded || "Recently"}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-secondary font-medium">Language</span>
                  <span className="text-on-surface font-semibold">English (US)</span>
                </div>
              </div>

              <button
                onClick={() => showToast(`Downloading "${resource.title}"...`)}
                className="w-full bg-primary-container text-on-primary-container py-3 rounded-xl font-label-md font-semibold flex items-center justify-center gap-2 hover:brightness-95 transition-all cursor-pointer"
              >
                <Download className="size-4" />
                <span>Instant Download</span>
              </button>
            </div>

            {/* Related Resources Sidebar Card */}
            <div className="bg-surface rounded-2xl border border-outline-variant p-6 space-y-5">
              <h4 className="font-headline-md text-lg font-bold text-on-surface border-b border-outline-variant pb-3">
                Related Resources
              </h4>

              {relatedResources.length === 0 ? (
                <p className="text-sm text-secondary text-center py-4">No related resources available at the moment.</p>
              ) : (
                <div className="space-y-4">
                  {relatedResources.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/customer/resources/${rel.id}`}
                      className="group block p-3.5 rounded-xl border border-outline-variant/60 hover:border-primary hover:bg-surface-container-low transition-all"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                          {rel.type || "Whitepaper"}
                        </span>
                      </div>
                      <h5 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors line-clamp-2">
                        {rel.title}
                      </h5>
                      <p className="text-xs text-secondary mt-1">
                        {rel.dateAdded || "Recent"} • {rel.views || "500+"} views
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Support CTA Sidebar Card */}
            <div className="bg-gradient-to-br from-primary/10 to-secondary-container/30 rounded-2xl border border-primary/20 p-6 space-y-3 text-center">
              <span className="material-symbols-outlined text-4xl text-primary block mx-auto">
                support_agent
              </span>
              <h5 className="font-bold text-on-surface">Need Custom Enterprise Help?</h5>
              <p className="text-xs text-on-surface-variant">
                Our solutions engineering team can help implement these frameworks into your existing TMS architecture.
              </p>
              <Link
                href="/customer/create-ticket"
                className="mt-2 inline-block bg-primary text-on-primary px-5 py-2 rounded-lg font-label-md text-xs hover:brightness-110 transition-all"
              >
                Contact Support Desk
              </Link>
            </div>
          </div>
        </div>
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
