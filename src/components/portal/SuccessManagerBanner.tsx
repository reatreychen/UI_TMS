import Image from "next/image";
import Link from "next/link";

export function SuccessManagerBanner() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12">
      <div className="group relative mx-auto min-h-[320px] max-w-7xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <Image
          src="/images/hr_service_bg.jpg"
          alt="Dedicated support success team"
          fill
          className="object-cover opacity-30 transition-transform duration-700 group-hover:scale-105"
        />
        <div className="relative z-10 flex min-h-[320px] items-center bg-gradient-to-r from-slate-950/90 via-slate-900/75 to-transparent p-8 sm:p-12">
          <div className="max-w-lg text-white space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold uppercase tracking-wide">
              Enterprise Support
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Dedicated Customer Success
            </h3>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Every Enterprise workspace is paired with a dedicated Account Manager to ensure your support workflows never slow down.
            </p>
            <div className="pt-1">
              <Link
                href="/customer/support"
                className="inline-flex items-center gap-2 font-semibold text-sm text-white bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-xl transition-colors"
              >
                Talk to Customer Success
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
