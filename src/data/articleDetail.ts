export interface ArticleAuthor {
  avatarUrl: string;
  name: string;
}

export interface ArticleDetailData {
  title: string;
  lastUpdated: string;
  readTime: string;
  author: ArticleAuthor;
  helpfulCount: number;
}

export interface TocItem {
  id: string;
  title: string;
}

export interface RelatedArticle {
  title: string;
  href: string;
  description: string;
}

export const ARTICLE_DETAIL: ArticleDetailData = {
  title: "Setting Up Automated Escalations",
  lastUpdated: "July 15, 2026",
  readTime: "8 min read",
  author: {
    avatarUrl: "https://i.pravatar.cc/150?u=author",
    name: "Sarah Chen",
  },
  helpfulCount: 342,
};

export const ARTICLE_TOC: TocItem[] = [
  {
    id: "understanding-workflow-triggers",
    title: "Understanding Workflow Triggers",
  },
  { id: "technical-implementation", title: "Technical Implementation" },
];

export const RELATED_ARTICLES: RelatedArticle[] = [
  {
    title: "Configuring SLA Policies",
    href: "/customer/knowledge-base/sla",
    description: "Define response and resolution time targets.",
  },
  {
    title: "Webhook Integration Guide",
    href: "/customer/knowledge-base/webhooks",
    description: "Send real-time ticket events to external systems.",
  },
];
