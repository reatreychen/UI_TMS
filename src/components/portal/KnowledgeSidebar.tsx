import { TicketCheck, Users } from "lucide-react";
import Link from "next/link";
import { trendingDiscussions, docLinks } from "@/src/constants/knowledgeBase";

export function KnowledgeSidebar() {
  return (
    <aside className="flex flex-col gap-stack-lg">
      {/* Help & Support Widget */}
      <div className="flex flex-col gap-stack-md rounded-xl bg-inverse-surface p-stack-lg text-inverse-on-surface shadow-lg">
        <h3 className="text-headline-lg font-semibold">Still need help?</h3>
        <p className="text-body-md opacity-80">
          Our support team is available 24/7 for Enterprise customers. Average
          response time is under 15 minutes.
        </p>
        <div className="flex flex-col gap-stack-sm">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-label-md font-bold text-on-primary transition-all hover:brightness-110 active:scale-95"
          >
            <TicketCheck aria-hidden className="size-4" strokeWidth={2} />
            Contact Support
          </button>
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 py-3 text-label-md font-bold text-white transition-all hover:bg-white/20 active:scale-95"
          >
            <Users aria-hidden className="size-4" strokeWidth={2} />
            Community Forum
          </button>
        </div>

        {/* System Status */}
        <div className="mt-stack-sm border-t border-white/10 pt-stack-sm">
          <div className="flex items-center justify-between text-label-md opacity-70">
            <span>System Status</span>
            <span className="flex items-center gap-1 text-green-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
              All Systems Operational
            </span>
          </div>
        </div>
      </div>

      {/* Trending Discussions */}
      <div className="rounded-xl border border-outline-variant bg-white p-stack-md">
        <h3 className="mb-stack-md text-headline-md font-semibold text-on-surface">
          Trending Discussions
        </h3>
        <ul className="space-y-stack-md">
          {trendingDiscussions.map((item) => (
            <li key={item.title} className="group cursor-pointer">
              <Link href={item.href} className="block">
                <p className="text-body-md text-primary transition-colors group-hover:underline">
                  {item.title}
                </p>
                <span className="text-label-md text-on-surface-variant">
                  {item.meta}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Documentation Quick Links */}
      <div className="rounded-xl bg-surface-container p-stack-md">
        <h3 className="mb-stack-md text-label-md font-bold uppercase tracking-wider text-on-surface-variant">
          Documentation
        </h3>
        <nav className="flex flex-col gap-stack-sm">
          {docLinks.map(({ icon: Icon, label, href }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-2 text-body-md text-on-surface transition-colors hover:text-primary"
            >
              <Icon aria-hidden className="size-4" strokeWidth={2} />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
