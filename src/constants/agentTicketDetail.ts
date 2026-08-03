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
  id: "",
  status: "",
  priority: "",
  title: "",
  createdAt: "",
  requester: "",
  category: "",
  customerProfile: {
    avatarUrl: "",
    name: "",
    role: "",
    plan: "",
    organization: "",
    health: "",
    lastActive: "",
  },
  serviceMetrics: {
    responseSlaStatus: "on_track",
    responseSlaMessage: "",
    resolutionSlaTimeLeft: "",
    assignedTeam: "",
    escalations: 0,
  },
  internalNotes: [],
  messages: [],
};
