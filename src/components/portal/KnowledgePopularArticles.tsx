import { FileText } from "lucide-react";
import Link from "next/link";
import { articles } from "@/src/data/knowledgeBase";

export function KnowledgePopularArticles() {
  return (
    <section>
      <h2 className="mb-stack-md text-headline-lg font-semibold text-on-surface">
        Popular Articles
      </h2>

      <div className="grid grid-cols-1 gap-stack-md md:grid-cols-2">
        {articles.map((article) => (
          <Link
            key={article.title}
            href={article.href}
            className="group flex cursor-pointer gap-stack-md rounded-xl border border-outline-variant bg-white p-stack-md transition-all duration-200 hover:border-primary/40 hover:shadow-sm"
          >
            <FileText
              aria-hidden
              className="mt-0.5 size-5 shrink-0 text-primary-container"
              strokeWidth={1.5}
            />
            <div>
              <h4 className="mb-1 text-headline-md font-semibold transition-colors duration-200 group-hover:text-primary">
                {article.title}
              </h4>
              <p className="text-body-md leading-relaxed text-on-surface-variant">
                {article.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
