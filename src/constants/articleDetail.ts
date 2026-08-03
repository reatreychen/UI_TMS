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
  title: "Knowledge Base Article",
  lastUpdated: "",
  readTime: "",
  author: {
    avatarUrl: "",
    name: "",
  },
  helpfulCount: 0,
};

export const ARTICLE_TOC: TocItem[] = [];

export const RELATED_ARTICLES: RelatedArticle[] = [];
