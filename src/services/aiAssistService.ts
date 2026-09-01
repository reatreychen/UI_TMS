import { api } from "@/src/lib/api";

export interface AiKbArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  relevanceScore: number;
}

export interface AiSuggestResult {
  suggestedCategoryId: string | null;
  suggestedCategoryName: string | null;
  confidence: "high" | "medium" | "low";
  kbArticles: AiKbArticle[];
  reasoning: string;
}

export interface AiDraftResult {
  draft: string;
}

/**
 * Ask Gemini AI to suggest a category and relevant KB articles
 * based on the ticket subject and description.
 */
export async function aiSuggestTicket(
  subject: string,
  description: string
): Promise<AiSuggestResult | null> {
  try {
    const { data } = await api.post("/ai-assist/suggest", {
      subject,
      description,
    });
    return (data?.data as AiSuggestResult) ?? null;
  } catch {
    return null;
  }
}

/**
 * Ask Gemini AI to draft a professional first-response for a ticket.
 * Requires JWT auth (agent must be logged in).
 */
export async function aiDraftReply(ticketId: string): Promise<string | null> {
  try {
    const { data } = await api.post("/ai-assist/draft-reply", { ticketId });
    const result = data?.data as AiDraftResult;
    return result?.draft ?? null;
  } catch {
    return null;
  }
}
