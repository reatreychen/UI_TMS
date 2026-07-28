import Link from "next/link";
import { categories } from "@/src/data/knowledgeBase";

export function KnowledgeCategoryGrid() {
  return (
    <section>
      <div className="mb-stack-md flex items-center justify-between">
        <h2 className="text-headline-lg font-semibold text-on-surface">
          Browse by Category
        </h2>
        <Link
          href="#"
          className="text-label-md font-semibold text-primary hover:underline"
        >
          View all categories
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-stack-md sm:grid-cols-2 md:grid-cols-3">
        {categories.map((cat) => (
          <Link
            key={cat.title}
            href={cat.href}
            className="group rounded-xl border border-outline-variant bg-white p-stack-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="mb-stack-sm flex h-12 w-12 items-center justify-center rounded-lg bg-surface-container-high text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-white">
              {/* eslint-disable-next-line @next/next/no-page-custom-font */}
              <span
                className="material-symbols-outlined transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                aria-hidden="true"
              >
                {cat.icon}
              </span>
            </div>
            <h3 className="mb-base text-headline-md font-semibold">
              {cat.title}
            </h3>
            <p className="text-body-md text-on-surface-variant">
              {cat.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
