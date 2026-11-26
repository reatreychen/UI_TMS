import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function KnowledgeFeaturedBanner() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
      <div className="grid items-center gap-8 md:grid-cols-2">
        <div>
          <span className="mb-3 inline-block rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-700 uppercase tracking-wide">
            Major Update
          </span>
          <h2 className="mb-3 font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Introducing Automated Ticket Routing
          </h2>
          <p className="mb-6 text-sm sm:text-base text-slate-600 leading-relaxed">
            Learn how intelligent triage reduces response times by up to 40% by matching tickets directly to specialist queues.
          </p>
          <Link
            href="/customer/knowledge-base"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            Read Guide
            <ArrowRight aria-hidden className="size-4" strokeWidth={2.25} />
          </Link>
        </div>

        <div className="h-56 sm:h-64 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/solutions_hero_banner.jpg"
            alt="Automated ticket routing overview"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
