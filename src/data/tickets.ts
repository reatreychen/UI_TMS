export type TicketStatus = "Open" | "In Progress" | "Resolved" | "Closed";

export type TicketAgent =
  | { kind: "unassigned" }
  | { name: string; avatarUrl: string };

export interface Ticket {
  id: string;
  subject: string;
  category: string;
  agent: TicketAgent;
  status: TicketStatus;
  lastUpdated: string;
}

export type TicketMetricIcon = "mail" | "sync" | "check" | "archive";

export interface TicketMetric {
  label: string;
  count: number;
  description: string;
  icon: TicketMetricIcon;
  iconClass: string;
}

export const ticketMetrics: TicketMetric[] = [
  {
    label: "Open",
    count: 12,
    description: "Awaiting response",
    icon: "mail",
    iconClass: "bg-blue-100 text-blue-700",
  },
  {
    label: "In Progress",
    count: 8,
    description: "Being worked on",
    icon: "sync",
    iconClass: "bg-purple-100 text-purple-700",
  },
  {
    label: "Resolved",
    count: 47,
    description: "Closed this month",
    icon: "check",
    iconClass: "bg-green-100 text-green-700",
  },
  {
    label: "Archived",
    count: 156,
    description: "Historical tickets",
    icon: "archive",
    iconClass: "bg-gray-100 text-gray-700",
  },
];

export const tickets: Ticket[] = [
  {
    id: "TKT-10482",
    subject: "Cannot access billing dashboard",
    category: "Billing",
    agent: {
      name: "Sarah Chen",
      avatarUrl: "https://i.pravatar.cc/150?u=sarah",
    },
    status: "In Progress",
    lastUpdated: "2 hours ago",
  },
  {
    id: "TKT-10471",
    subject: "API rate limit errors in production",
    category: "Technical",
    agent: { kind: "unassigned" },
    status: "Open",
    lastUpdated: "5 hours ago",
  },
  {
    id: "TKT-10455",
    subject: "Request for SSO configuration guide",
    category: "Account",
    agent: {
      name: "Marcus Webb",
      avatarUrl: "https://i.pravatar.cc/150?u=marcus",
    },
    status: "Resolved",
    lastUpdated: "Yesterday",
  },
  {
    id: "TKT-10440",
    subject: "Invoice discrepancy for June billing cycle",
    category: "Billing",
    agent: {
      name: "Sarah Chen",
      avatarUrl: "https://i.pravatar.cc/150?u=sarah",
    },
    status: "Closed",
    lastUpdated: "3 days ago",
  },
];
