export type QueuePriority = "urgent" | "high" | "normal" | "low";
export type QueueChannel = "mail" | "chat" | "bolt" | "call";

export interface QueueTicketRow {
  id: string;
  subject: string;
  requester: string;
  waitTime: string;
  priority: QueuePriority;
  channel: QueueChannel;
}

export const AGENT_QUEUE_TICKETS: QueueTicketRow[] = [
  {
    id: "10501",
    subject: "Production API returning 503 errors",
    requester: "DevOps Team @ Acme Corp",
    waitTime: "47 min",
    priority: "urgent",
    channel: "bolt",
  },
  {
    id: "10500",
    subject: "Invoice discrepancy for June billing cycle",
    requester: "Finance @ Globex",
    waitTime: "23 min",
    priority: "high",
    channel: "mail",
  },
  {
    id: "10499",
    subject: "How to configure custom webhook headers?",
    requester: "Alex Kim",
    waitTime: "12 min",
    priority: "normal",
    channel: "chat",
  },
  {
    id: "10498",
    subject: "Feature request: bulk ticket export",
    requester: "Product Team @ Initech",
    waitTime: "8 min",
    priority: "low",
    channel: "call",
  },
];
