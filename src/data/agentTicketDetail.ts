export type AgentMessageType = "system" | "agent" | "customer";
export type ResponseSlaStatus = "overdue" | "on_track" | "warning";

export interface AgentTicketAttachment {
  name: string;
  size: string;
  type: string;
}

export interface AgentTicketMessage {
  id: string;
  type: AgentMessageType;
  text: string;
  time: string;
  author?: string;
  avatarUrl?: string;
  attachment?: AgentTicketAttachment;
}

export interface AgentCustomerProfile {
  avatarUrl: string;
  name: string;
  role: string;
  plan: string;
  organization: string;
  health: string;
  lastActive: string;
}

export interface AgentServiceMetrics {
  responseSlaStatus: ResponseSlaStatus;
  responseSlaMessage: string;
  resolutionSlaTimeLeft: string;
  assignedTeam: string;
  escalations: number;
}

export interface AgentInternalNote {
  author: string;
  time: string;
  text: string;
}

export interface AgentTicketDetail {
  id: string;
  status: string;
  priority: string;
  title: string;
  createdAt: string;
  requester: string;
  category: string;
  customerProfile: AgentCustomerProfile;
  serviceMetrics: AgentServiceMetrics;
  internalNotes: AgentInternalNote[];
  messages: AgentTicketMessage[];
}

export const MOCK_AGENT_TICKET_DETAIL: AgentTicketDetail = {
  id: "10482",
  status: "In Progress",
  priority: "Urgent",
  title: "Production API returning 503 errors",
  createdAt: "Jul 22, 2026 at 9:14 AM",
  requester: "DevOps Team @ Acme Corp",
  category: "Technical",
  customerProfile: {
    avatarUrl: "https://i.pravatar.cc/150?u=acme",
    name: "DevOps Team",
    role: "Platform Engineering",
    plan: "Enterprise Plus",
    organization: "Acme Corporation",
    health: "Healthy",
    lastActive: "5 minutes ago",
  },
  serviceMetrics: {
    responseSlaStatus: "overdue",
    responseSlaMessage: "Overdue by 12 min",
    resolutionSlaTimeLeft: "3h 48m remaining",
    assignedTeam: "Tier 2 – Infrastructure",
    escalations: 1,
  },
  internalNotes: [
    {
      author: "Sarah Chen",
      time: "10:32 AM",
      text: "Customer confirmed issue started after deploy v2.4.1. Checking load balancer logs.",
    },
  ],
  messages: [
    {
      id: "m1",
      type: "system",
      text: "Ticket assigned to Alex Rivera",
      time: "9:15 AM",
    },
    {
      id: "m2",
      type: "customer",
      author: "James Okafor",
      avatarUrl: "https://i.pravatar.cc/150?u=james",
      time: "9:14 AM",
      text: "Our production API has been returning <strong>503 Service Unavailable</strong> since 9:00 AM UTC. All regions affected.",
    },
    {
      id: "m3",
      type: "agent",
      author: "Alex Rivera",
      avatarUrl: "https://i.pravatar.cc/150?u=alex",
      time: "9:22 AM",
      text: "Thank you for reporting this. I'm investigating the load balancer configuration now.",
      attachment: {
        name: "lb-logs.txt",
        size: "24 KB",
        type: "text/plain",
      },
    },
  ],
};
