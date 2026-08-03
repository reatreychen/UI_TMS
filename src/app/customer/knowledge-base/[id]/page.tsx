import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { TopNav } from "@/src/components/portal/TopNav";
import { PortalFooter } from "@/src/components/portal/PortalFooter";
import { ArticleContent } from "@/src/components/portal/ArticleContent";
import { ArticleSidebar } from "@/src/components/portal/ArticleSidebar";
import { ARTICLE_DETAIL } from "@/src/constants/articleDetail";

export const metadata = {
  title: `${ARTICLE_DETAIL.title} | Kinetic TMS Knowledge Base`,
  description: "Read the article in the Kinetic TMS Knowledge Base.",
};

export default function ArticleDetailPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-body-lg text-on-surface">
      <TopNav activePage="knowledge-base" />

      <main className="mx-auto flex w-full max-w-[1440px] flex-grow flex-col px-container-margin py-stack-lg">
        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="mb-stack-lg flex items-center gap-2 text-label-md font-semibold text-secondary"
        >
          <Link
            href="/customer/knowledge-base"
            className="transition-colors hover:text-primary"
          >
            Knowledge Base
          </Link>
          <ChevronRight aria-hidden className="size-4" />
          <Link href="#" className="transition-colors hover:text-primary">
            Getting Started
          </Link>
          <ChevronRight aria-hidden className="size-4" />
          <span className="text-on-surface">{ARTICLE_DETAIL.title}</span>
        </nav>

        <div className="flex flex-col gap-stack-lg lg:flex-row">
          {/* Left Column: Article Content */}
          <ArticleContent />

          {/* Right Column: Sidebar */}
          <ArticleSidebar />
        </div>
      </main>

      <PortalFooter />
    </div>
  );
}
