export type KanbanPriority = "urgent" | "high" | "medium" | "low";

export interface KanbanRequester {
  name: string;
  avatarUrl?: string;
  initials?: string;
}

export interface TicketCardData {
  id: string;
  title: string;
  priority: KanbanPriority;
  requester: KanbanRequester;
  timeAgo: string;
  category: string;
}

export interface KanbanColumnData {
  id: string;
  title: string;
  colorClass: string;
  bgClass: string;
  textClass: string;
  count: number;
  tickets: TicketCardData[];
}

export const KANBAN_COLUMNS: KanbanColumnData[] = [];
