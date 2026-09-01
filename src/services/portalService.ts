import { api } from "@/src/lib/api";

export interface BackendCategory {
  id: string;
  name: string;
  department_id: string;
  department?: { id: string; name: string };
}

export interface PortalStatsResponse {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
}

export interface QueueTicket {
  id: string;
  ticketNumber?: string;
  customerId?: string;
  subject: string;
  description?: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | string;
  status: string;
  assignedAgentId?: string | null;
  assignedAgent?: {
    id: string;
    fullName?: string;
    name?: string;
  } | null;
  categoryId?: string | null;
  createdAt: string;
  updatedAt?: string;
  slaDueAt?: string | null;
  firstResponseAt?: string | null;
  resolvedAt?: string | null;
  closedAt?: string | null;
  rating?: number | null;
  ratingFeedback?: string | null;
  ratedAt?: string | null;
  customer?: {
    id: string;
    fullName?: string;
    name?: string;
  };
  category?: {
    id: string;
    name: string;
    department?: { id: string; name: string };
  };
  channel?: string;
}

interface QueueTicketListResponse {
  items: QueueTicket[];
  total: number;
}

export async function fetchPublicCategories(): Promise<BackendCategory[]> {
  try {
    const res = await api.get("/categories/public");
    const payload = res.data?.data;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
  } catch {
    return [];
  }
}

export async function fetchMyTickets(params?: {
  status?: string;
  page?: number;
  limit?: number;
  customerId?: string;
}) {
  try {
    const res = await api.get("/tickets", { params: { ...params } });
    const payload = res.data?.data;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  } catch {
    return [];
  }
}

export async function fetchQueueTickets(params?: {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  categoryId?: string;
  q?: string;
}): Promise<QueueTicketListResponse> {
  const res = await api.get("/tickets", {
    params: { page: 1, limit: 100, ...params },
  });
  const payload = res.data?.data;

  if (Array.isArray(payload)) {
    return { items: payload, total: payload.length };
  }

  return {
    items: Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.items)
        ? payload.items
        : [],
    total: Number(payload?.meta?.total ?? 0),
  };
}

export interface TriageInsightItem {
  name: string;
  count: number;
  percentage: number;
  color?: string;
}

export interface UrgentSlaItem {
  id: string;
  ticketNumber: string;
  subject: string;
  priority: string;
  status: string;
  slaDueAt?: string;
  remainingLabel: string;
  remainingColorClass: string;
  agentName: string;
}

export interface TicketAnalyticsOverview {
  totalTickets: number;
  triageInsights: TriageInsightItem[];
  urgentSlaWatch: {
    atRiskCount: number;
    items: UrgentSlaItem[];
  };
}

export async function fetchTicketAnalyticsOverview(): Promise<TicketAnalyticsOverview> {
  const res = await api.get("/tickets/analytics/overview");
  const payload = res.data?.data || res.data;
  return {
    totalTickets: payload?.totalTickets ?? 0,
    triageInsights: Array.isArray(payload?.triageInsights) ? payload.triageInsights : [],
    urgentSlaWatch: {
      atRiskCount: payload?.urgentSlaWatch?.atRiskCount ?? 0,
      items: Array.isArray(payload?.urgentSlaWatch?.items) ? payload.urgentSlaWatch.items : [],
    },
  };
}

export interface CreateTicketPayload {
  customerId: string;
  subject: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  categoryId?: string;
}

export interface CreatedTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  status: string;
  priority: string;
}

export interface TicketCommentUser {
  id: string;
  fullName?: string;
  name?: string;
  avatarUrl?: string;
  profileImage?: string;
  role?: { name?: string } | string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  userId: string;
  message: string;
  isInternal?: boolean;
  createdAt: string;
  user?: TicketCommentUser;
}

export async function createTicket(
  payload: CreateTicketPayload
): Promise<CreatedTicket> {
  const res = await api.post("/tickets", payload);
  return res.data?.data ?? res.data;
}

export async function deleteTicket(id: string): Promise<void> {
  await api.delete(`/tickets/${id}`);
}

export async function fetchTicket(id: string) {
  const res = await api.get(`/tickets/${id}`);
  return res.data?.data ?? res.data;
}

export interface TicketAttachment {
  id: string;
  ticketId?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  uploadedById?: string;
  createdAt?: string;
}

export async function uploadTicketAttachment(
  ticketId: string,
  uploadedById: string,
  file: File
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);

  await api.post("/ticket-attachments/upload", formData, {
    params: { ticketId, uploadedById },
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function fetchTicketAttachments(ticketId: string): Promise<TicketAttachment[]> {
  const res = await api.get(`/ticket-attachments/ticket/${ticketId}`);
  return res.data?.data ?? [];
}

export async function createTicketComment(payload: {
  ticketId: string;
  userId: string;
  message: string;
  isInternal?: boolean;
}): Promise<TicketComment> {
  const res = await api.post("/ticket-comments", payload);
  return res.data?.data ?? res.data;
}

export async function fetchTicketComments(ticketId: string): Promise<TicketComment[]> {
  const res = await api.get(`/ticket-comments/ticket/${ticketId}`);
  return res.data?.data ?? [];
}

export async function updateTicketStatus(ticketId: string, status: string) {
  const res = await api.patch(`/tickets/${ticketId}/status`, { status });
  return res.data?.data ?? res.data;
}

export async function assignTicket(ticketId: string, agentId: string) {
  const res = await api.post(`/tickets/${ticketId}/assign`, { assignedTo: agentId });
  return res.data?.data ?? res.data;
}

export interface KnowledgeBaseArticleRecord {
  id: string;
  title: string;
  slug: string;
  content: string;
  category?: string;
  published: boolean;
  createdById?: string;
  createdBy?: {
    id: string;
    fullName?: string;
    name?: string;
  };
  createdAt: string;
}

export async function fetchAllKnowledgeBaseArticles(all: boolean = true, query?: string): Promise<KnowledgeBaseArticleRecord[]> {
  const params = new URLSearchParams();
  if (all) params.append("all", "true");
  if (query) params.append("q", query);
  const res = await api.get(`/kb/articles?${params.toString()}`);
  const payload = res.data?.data ?? res.data;
  return Array.isArray(payload) ? payload : [];
}

export async function createKnowledgeBaseArticle(payload: {
  title: string;
  slug: string;
  content: string;
  category?: string;
  published?: boolean;
}): Promise<KnowledgeBaseArticleRecord> {
  const res = await api.post("/kb/articles", payload);
  return res.data?.data ?? res.data;
}

export async function publishKnowledgeBaseArticle(id: string, published: boolean): Promise<KnowledgeBaseArticleRecord> {
  const res = await api.patch(`/kb/articles/${id}/publish`, { published });
  return res.data?.data ?? res.data;
}

export async function deleteKnowledgeBaseArticle(id: string): Promise<void> {
  await api.delete(`/kb/articles/${id}`);
}

export interface ResourceRecord {
  id: string;
  title: string;
  subtitle: string;
  type: "Whitepaper" | "Case Study" | "Webinar" | "E-book" | "Guide" | "Video" | string;
  status: "Published" | "Draft" | "Scheduled" | "Archived" | string;
  dateAdded: string;
  downloads: string;
  views: string;
  description?: string;
  scheduleDate?: string;
  scheduleTime?: string;
}

export async function fetchAllResources(query?: {
  type?: string;
  status?: string;
  q?: string;
}): Promise<ResourceRecord[]> {
  const params = new URLSearchParams();
  if (query?.type && query.type !== "All") params.append("type", query.type);
  if (query?.status && query.status !== "All") params.append("status", query.status);
  if (query?.q) params.append("q", query.q);
  const res = await api.get(`/resources?${params.toString()}`);
  const payload = res.data?.data ?? res.data;
  return Array.isArray(payload) ? payload : [];
}

export async function fetchResourceById(id: string): Promise<ResourceRecord> {
  const res = await api.get(`/resources/${id}`);
  return res.data?.data ?? res.data;
}

export async function createResource(payload: Partial<ResourceRecord>): Promise<ResourceRecord> {
  const res = await api.post("/resources", payload);
  return res.data?.data ?? res.data;
}

export async function updateResource(id: string, payload: Partial<ResourceRecord>): Promise<ResourceRecord> {
  const res = await api.patch(`/resources/${id}`, payload);
  return res.data?.data ?? res.data;
}

export async function deleteResource(id: string): Promise<void> {
  await api.delete(`/resources/${id}`);
}

export async function bulkDeleteResources(ids: string[]): Promise<void> {
  await api.post("/resources/bulk-delete", { ids });
}

export async function bulkArchiveResources(ids: string[]): Promise<void> {
  await api.post("/resources/bulk-archive", { ids });
}

export async function fetchTelegramStatus() {
  const res = await api.get("/telegram/status");
  return res.data;
}

export async function sendTelegramTestMessage(chatId?: string) {
  const res = await api.post("/telegram/test", { chatId });
  return res.data;
}

export async function setTelegramChatId(chatId: string) {
  const res = await api.post("/telegram/chat-id", { chatId });
  return res.data;
}

export async function discoverTelegramChatId() {
  const res = await api.get("/telegram/discover");
  return res.data;
}

export async function rateTicket(ticketId: string, rating: number, feedback?: string) {
  const res = await api.patch(`/tickets/${ticketId}/rate`, { rating, feedback });
  return res.data;
}

export async function fetchSystemStatus() {
  const res = await api.get("/resources/system-status");
  return res.data?.data ?? res.data;
}


