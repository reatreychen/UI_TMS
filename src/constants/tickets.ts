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
    count: 0,
    description: "Awaiting response",
    icon: "mail",
    iconClass: "bg-blue-100 text-blue-700",
  },
  {
    label: "In Progress",
    count: 0,
    description: "Being worked on",
    icon: "sync",
    iconClass: "bg-purple-100 text-purple-700",
  },
  {
    label: "Resolved",
    count: 0,
    description: "Closed this month",
    icon: "check",
    iconClass: "bg-green-100 text-green-700",
  },
  {
    label: "Archived",
    count: 0,
    description: "Historical tickets",
    icon: "archive",
    iconClass: "bg-gray-100 text-gray-700",
  },
];

export const tickets: Ticket[] = [];
