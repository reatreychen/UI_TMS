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

export const KANBAN_COLUMNS: KanbanColumnData[] = [
  {
    id: "new",
    title: "New",
    colorClass: "bg-blue-500",
    bgClass: "bg-blue-100",
    textClass: "text-blue-700",
    count: 2,
    tickets: [
      {
        id: "10502",
        title: "Webhook signature validation failing",
        priority: "high",
        requester: { name: "Dev Team", initials: "DT" },
        timeAgo: "10m",
        category: "Technical",
      },
      {
        id: "10503",
        title: "Need help with API rate limits",
        priority: "medium",
        requester: { name: "Startup Co", initials: "SC" },
        timeAgo: "25m",
        category: "Technical",
      },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    colorClass: "bg-purple-500",
    bgClass: "bg-purple-100",
    textClass: "text-purple-700",
    count: 1,
    tickets: [
      {
        id: "10482",
        title: "Production API returning 503 errors",
        priority: "urgent",
        requester: {
          name: "Acme Corp",
          avatarUrl: "https://i.pravatar.cc/150?u=acme",
        },
        timeAgo: "47m",
        category: "Technical",
      },
    ],
  },
  {
    id: "resolved",
    title: "Resolved",
    colorClass: "bg-green-500",
    bgClass: "bg-green-100",
    textClass: "text-green-700",
    count: 1,
    tickets: [
      {
        id: "10430",
        title: "Password reset email not received",
        priority: "low",
        requester: {
          name: "Jane Doe",
          avatarUrl: "https://i.pravatar.cc/150?u=jane",
        },
        timeAgo: "2d",
        category: "Account",
      },
    ],
  },
];
