import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { TopNav } from "@/src/components/portal/TopNav";
import { PortalFooter } from "@/src/components/portal/PortalFooter";
import { ArticleContent } from "@/src/components/portal/ArticleContent";
import { ArticleSidebar } from "@/src/components/portal/ArticleSidebar";
import { ARTICLE_DETAIL } from "@/src/constants/articleDetail";

export const metadata = {
  title: `${ARTICLE_DETAIL.title} | Help Center`,
  description: "Read the article in the Kinetic Support Help Center.",
};

export default function ArticleDetailPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased">
      <TopNav activePage="knowledge-base" />

      <main className="mx-auto flex w-full max-w-7xl flex-grow flex-col px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center gap-2 text-xs sm:text-sm font-medium text-slate-500"
        >
          <Link
            href="/customer/knowledge-base"
            className="transition-colors hover:text-blue-600"
          >
            Help Center
          </Link>
          <ChevronRight aria-hidden className="size-4 text-slate-400" />
          <Link
            href="/customer/knowledge-base"
            className="transition-colors hover:text-blue-600"
          >
            Getting Started
          </Link>
          <ChevronRight aria-hidden className="size-4 text-slate-400" />
          <span className="text-slate-900 font-semibold">{ARTICLE_DETAIL.title}</span>
        </nav>

        <div className="flex flex-col gap-6 lg:flex-row">
          <ArticleContent />
          <ArticleSidebar />
        </div>
      </main>

      <PortalFooter />
    </div>
  );
}
