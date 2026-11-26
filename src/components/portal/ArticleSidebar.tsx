import Link from "next/link";
import { Headset } from "lucide-react";
import { ARTICLE_TOC, RELATED_ARTICLES } from "@/src/constants/articleDetail";

export function ArticleSidebar() {
  return (
    <aside className="flex flex-col gap-5 lg:w-1/3">
      {/* Table of Contents */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
        <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-slate-500">
          On this page
        </h2>
        <nav className="flex flex-col gap-2.5">
          {ARTICLE_TOC.map((item, index) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`text-sm pl-3 transition-colors ${
                index === 0
                  ? "border-l-2 border-blue-600 font-semibold text-blue-600"
                  : "border-l-2 border-transparent text-slate-600 hover:text-blue-600"
              }`}
            >
              {item.title}
            </a>
          ))}
        </nav>
      </div>

      {/* Related Articles */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
        <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-slate-500">
          Related Articles
        </h2>
        <ul className="flex flex-col gap-3.5">
          {RELATED_ARTICLES.map((article, index) => (
            <li
              key={article.title}
              className={`group ${index > 0 ? "border-t border-slate-200 pt-3.5" : ""}`}
            >
              <Link href={article.href} className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-slate-900 transition-colors group-hover:text-blue-600">
                  {article.title}
                </span>
                <span className="line-clamp-1 text-xs text-slate-500">
                  {article.description}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Contact Support Box */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 text-white shadow-xs">
        <h2 className="mb-2 font-display text-lg font-bold text-white">Still need help?</h2>
        <p className="mb-5 text-sm text-slate-300 leading-relaxed">
          Can&apos;t find what you&apos;re looking for? Our support specialists are ready to help.
        </p>
        <Link
          href="/customer/create-ticket"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
        >
          <Headset aria-hidden className="size-4" strokeWidth={2} />
          Contact Support
        </Link>
      </div>
    </aside>
  );
}
