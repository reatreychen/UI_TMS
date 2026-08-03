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

export const AGENT_MY_TICKETS: AgentTicketRow[] = [];
