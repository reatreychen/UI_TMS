import Link from "next/link";
import { ArrowRight, BookOpen, MessageSquare } from "lucide-react";

export function QuickHelpBento() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="flex flex-col sm:flex-row sm:items-center gap-5 rounded-2xl border border-slate-200 bg-white p-6 soft-shadow md:col-span-2">
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <BookOpen className="size-6" aria-hidden />
        </div>
        <div className="space-y-1.5 flex-1">
          <h3 className="text-base font-bold text-slate-900">
            Self-Service Knowledge Base
          </h3>
          <p className="text-sm text-slate-600">
            Find step-by-step troubleshooting guides, account security
            instructions, and API references.
          </p>
        </div>
        <Link
          href="/customer/knowledge-base"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-sm font-semibold text-slate-800 hover:text-blue-700 transition-colors shrink-0 self-start sm:self-center"
        >
          <span>Browse Guides</span>
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      <div className="flex flex-col justify-between rounded-2xl bg-slate-900 p-6 text-white soft-shadow">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-300">
            <MessageSquare className="size-3.5" aria-hidden />
            Support Team
          </div>
          <h3 className="text-base font-bold">Need direct help?</h3>
          <p className="text-sm text-slate-300">
            Visit the Support Center for live chat and direct contact channels.
          </p>
        </div>
        <Link
          href="/customer/support"
          className="mt-4 inline-flex items-center justify-center gap-1.5 w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-2.5 text-sm font-semibold text-white transition-colors"
        >
          Go to Support Center
        </Link>
      </div>
    </div>
  );
}
