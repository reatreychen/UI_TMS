export type QueuePriority = "urgent" | "high" | "normal" | "low";
export type QueueChannel = "mail" | "chat" | "bolt" | "call";

export interface QueueTicketRow {
  id: string;
  ticketNumber?: string;
  subject: string;
  requester: string;
  waitTime: string;
  priority: QueuePriority;
  channel: QueueChannel;
}

export const AGENT_QUEUE_TICKETS: QueueTicketRow[] = [];
