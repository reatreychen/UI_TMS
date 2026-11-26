import Link from "next/link";
import Image from "next/image";

export function PortalFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md overflow-hidden border border-slate-200 inline-block">
              <Image
                src="/images/tms_pro_logo.jpg"
                alt="TMS Pro"
                width={24}
                height={24}
                className="w-full h-full object-cover"
              />
            </span>
            <span className="text-sm font-bold text-slate-900">TMS Pro</span>
          </div>
          <span className="hidden sm:inline text-slate-300" aria-hidden>
            ·
          </span>
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Kinetic Support Portal. All rights reserved.
          </p>
        </div>

        <nav
          aria-label="Footer links"
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-600"
        >
          <Link
            href="/customer/knowledge-base"
            className="hover:text-slate-900 transition-colors"
          >
            Help Center
          </Link>
          <Link
            href="/customer/my-ticket"
            className="hover:text-slate-900 transition-colors"
          >
            My Tickets
          </Link>
          <Link
            href="/customer/create-ticket"
            className="hover:text-slate-900 transition-colors"
          >
            Submit Ticket
          </Link>
          <Link
            href="/customer/resources"
            className="hover:text-slate-900 transition-colors"
          >
            Resources
          </Link>
          <Link
            href="/customer/pricing"
            className="hover:text-slate-900 transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/customer/support"
            className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold hover:text-emerald-800"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden />
            System Status
          </Link>
        </nav>
      </div>
    </footer>
  );
}
