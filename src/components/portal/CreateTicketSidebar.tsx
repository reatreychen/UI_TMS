import Link from "next/link";
import { resources } from "@/src/constants/knowledgeBase";

export function CreateTicketSidebar() {
  return (
    <aside className="lg:col-span-4 flex flex-col gap-6">
      {/* Helpful Resources Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="flex items-center gap-2.5 border-b border-slate-200 bg-slate-50 px-5 py-4">
          <span
            className="material-symbols-outlined text-blue-600 text-[20px]"
            aria-hidden="true"
          >
            auto_stories
          </span>
          <h3 className="font-display text-base font-bold text-slate-900">Helpful Resources</h3>
        </div>

        <div className="space-y-2 p-4">
          {resources.map(({ icon: Icon, title, description, href }) => (
            <Link
              key={title}
              href={href}
              className="group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-slate-50"
            >
              <div className="p-2 rounded-lg bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shrink-0">
                <Icon className="size-4" aria-hidden strokeWidth={2} />
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {title}
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-5 py-3.5">
          <Link
            href="/customer/knowledge-base"
            className="block w-full text-center text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            View Full Knowledge Base
          </Link>
        </div>
      </div>

      {/* Pro-Tip Banner Card */}
      <div className="group relative h-48 overflow-hidden rounded-2xl border border-slate-200 shadow-xs bg-slate-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/guide_desk_bg.jpg"
          alt="Support troubleshooting workspace"
          className="absolute inset-0 h-full w-full object-cover opacity-55 transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent" />
        <div className="absolute bottom-0 left-0 p-5 text-white">
          <span className="inline-block px-2 py-0.5 rounded bg-blue-600 text-[10px] font-bold uppercase tracking-wider mb-2">
            Pro Tip
          </span>
          <h4 className="font-display text-lg font-bold text-white leading-snug">
            Attach screenshots or error logs for faster resolution
          </h4>
        </div>
      </div>
    </aside>
  );
}
