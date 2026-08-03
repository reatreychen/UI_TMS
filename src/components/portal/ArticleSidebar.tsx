import Link from "next/link";
import { Headset } from "lucide-react";
import { ARTICLE_TOC, RELATED_ARTICLES } from "@/src/constants/articleDetail";

export function ArticleSidebar() {
  return (
    <aside className="flex flex-col gap-stack-lg lg:w-1/3">
      {/* Table of Contents */}
      <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
        <h4 className="mb-4 text-headline-md font-semibold text-on-background">
          On this page
        </h4>
        <nav className="flex flex-col gap-3">
          {ARTICLE_TOC.map((item, index) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`text-body-md pl-3 transition-colors ${
                index === 0
                  ? "border-l-2 border-primary font-semibold text-primary"
                  : "border-l-2 border-transparent text-secondary hover:text-primary"
              }`}
            >
              {item.title}
            </a>
          ))}
        </nav>
      </div>

      {/* Related Articles */}
      <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
        <h4 className="mb-4 text-headline-md font-semibold text-on-background">
          Related Articles
        </h4>
        <ul className="flex flex-col gap-4">
          {RELATED_ARTICLES.map((article, index) => (
            <li
              key={article.title}
              className={`group ${
                index > 0 ? "border-t border-outline-variant pt-4" : ""
              }`}
            >
              <Link href={article.href} className="flex flex-col gap-1">
                <span className="text-body-md font-semibold text-on-surface transition-colors group-hover:text-primary">
                  {article.title}
                </span>
                <span className="line-clamp-1 text-label-md text-secondary">
                  {article.description}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Contact Support Box */}
      <div className="relative overflow-hidden rounded-lg bg-primary-container p-6 text-on-primary-container shadow-md">
        <div className="relative z-10">
          <h4 className="mb-2 text-headline-md font-semibold">
            Still need help?
          </h4>
          <p className="mb-6 text-body-md opacity-90">
            Can't find what you're looking for? Our support team is available
            24/7 for Enterprise customers.
          </p>
          <Link
            href="/customer/create-ticket"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 font-semibold text-primary-container transition-colors hover:bg-surface-container"
          >
            <Headset aria-hidden className="size-5" strokeWidth={2} />
            Contact Support
          </Link>
        </div>
        {/* Abstract Decorative Element */}
        <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-white/5 blur-xl" />
      </div>
    </aside>
  );
}
