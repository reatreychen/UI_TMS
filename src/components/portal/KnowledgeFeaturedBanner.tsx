import { ArrowRight } from "lucide-react";

export function KnowledgeFeaturedBanner() {
  return (
    <section className="relative overflow-hidden rounded-xl border border-primary/20 bg-surface-container-low p-stack-lg">
      {/* Subtle decorative gradient accent */}
      <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-primary/5 to-transparent" />

      <div className="relative z-10 grid items-center gap-stack-lg md:grid-cols-2">
        {/* Text Content */}
        <div>
          <span className="mb-stack-sm inline-block rounded-full bg-primary/10 px-3 py-1 text-label-md font-bold text-primary">
            MAJOR UPDATE
          </span>
          <h2 className="mb-stack-sm text-headline-lg font-semibold text-on-surface">
            Introducing Advanced Automated Ticket Routing
          </h2>
          <p className="mb-stack-md text-body-lg text-on-surface-variant">
            Learn how to leverage our new AI-driven engine to reduce response
            times by up to 40% using priority-based queues.
          </p>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-label-md font-bold text-on-primary shadow-sm transition-all hover:brightness-110 active:scale-95"
          >
            Read Guide
            <ArrowRight aria-hidden className="size-4" strokeWidth={2.5} />
          </button>
        </div>

        {/* Feature Image */}
        <div className="h-64 overflow-hidden rounded-lg border border-outline-variant shadow-lg">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCLtqlJJAiGZCaGp37Ki1ZJMKLnlsaVNgLrxd1ABtPbcmFW2b30wmmp0XIZPM9yBMl0oiDmKKk_usoIR9dWrKZtwvmlDkpG-YNTqnOpUYZxlDXGvyTuVBgN2SrILNhox_74tZYm0inRmOZlOL7jRnFWNLSlZBNi6podxMSR3DOfV3AzLY9reCi0lDDYXd7RBwEMuYpcMnnyexgVKdaefXJsY5ISTKuOOty4vMDJdi-8qceuWTfZ8SAWboK4kZdgniZUazW23i4yxf6"
            alt="Advanced Automated Ticket Routing dashboard visualization"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
