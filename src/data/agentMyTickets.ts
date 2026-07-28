export type AgentTicketPriority = "critical" | "medium" | "low";

export interface AgentTicketCustomer {
  name: string;
  avatarUrl?: string;
  initials?: string;
}

export interface AgentTicketStatusColors {
  bg: string;
  text: string;
}

export interface AgentTicketRow {
  id: string;
  subject: string;
  descriptionSnippet: string;
  priority: AgentTicketPriority;
  customer: AgentTicketCustomer;
  status: string;
  statusColors: AgentTicketStatusColors;
  lastActivity: string;
}

export interface AgentStatsData {
  avgResponseTime: string;
  resolvedToday: number;
  sla: string;
}

export const AGENT_STATS: AgentStatsData = {
  avgResponseTime: "18 min",
  resolvedToday: 7,
  sla: "96.4%",
};

export const AGENT_MY_TICKETS: AgentTicketRow[] = [
  {
    id: "10482",
    subject: "Production API returning 503 errors",
    descriptionSnippet: "All regions affected since 9:00 AM UTC deploy...",
    priority: "critical",
    customer: {
      name: "Acme Corp",
      avatarUrl: "https://i.pravatar.cc/150?u=acme",
    },
    status: "In Progress",
    statusColors: { bg: "bg-purple-100", text: "text-purple-700" },
    lastActivity: "5 min ago",
  },
  {
    id: "10471",
    subject: "Invoice discrepancy for June",
    descriptionSnippet: "Line item #4421 shows incorrect quantity...",
    priority: "medium",
    customer: { name: "Globex Inc", initials: "GI" },
    status: "Pending",
    statusColors: { bg: "bg-amber-100", text: "text-amber-700" },
    lastActivity: "1 hour ago",
  },
  {
    id: "10455",
    subject: "SSO configuration guide request",
    descriptionSnippet: "Need documentation for Azure AD SAML setup...",
    priority: "low",
    customer: { name: "Initech", initials: "IN" },
    status: "Open",
    statusColors: { bg: "bg-blue-100", text: "text-blue-700" },
    lastActivity: "3 hours ago",
  },
];
