export type ChatSender = "customer" | "agent";

export interface ChatMessage {
  id: string;
  sender: ChatSender;
  body: string;
  timestamp: string;
  authorName?: string;
  authorAvatarUrl?: string;
}

export interface TimelineEvent {
  kind: "event";
  id: string;
  description: string;
}

export type TimelineItem = ChatMessage | TimelineEvent;

export interface TicketAssignee {
  avatarUrl: string;
  name: string;
}

export interface TicketDetailData {
  id: string;
  subject: string;
  status: string;
  createdAt: string;
  assignee: TicketAssignee;
  priority: string;
  category: string;
  slaDue: string;
}

export type AttachmentType = "image" | "document";

export interface Attachment {
  id: string;
  filename: string;
  type: AttachmentType;
  thumbnailUrl?: string;
}

export interface ActivityLogEntry {
  id: string;
  description: string;
  timestamp: string;
  actor?: string;
  isLatest?: boolean;
}

export const TICKET_DETAIL: TicketDetailData = {
  id: "TKT-10482",
  subject: "Cannot access billing dashboard",
  status: "in progress",
  createdAt: "Jul 22, 2026",
  assignee: {
    avatarUrl: "https://i.pravatar.cc/150?u=sarah",
    name: "Sarah Chen",
  },
  priority: "High",
  category: "Billing",
  slaDue: "Jul 23, 2026 · 5:00 PM",
};

export const TIMELINE_ITEMS: TimelineItem[] = [
  {
    kind: "event",
    id: "e1",
    description:
      "Ticket created and assigned to <strong>Sarah Chen</strong>",
  },
  {
    id: "m1",
    sender: "customer",
    body: "I'm unable to access the billing dashboard since this morning. I get a 403 error when I click on Billing in the sidebar.",
    timestamp: "9:14 AM",
  },
  {
    id: "m2",
    sender: "agent",
    authorName: "Sarah Chen",
    authorAvatarUrl: "https://i.pravatar.cc/150?u=sarah",
    body: "Hi! Thanks for reaching out. I've checked your account permissions and it looks like your role was recently changed. I'm restoring billing access now.",
    timestamp: "9:28 AM",
  },
  {
    kind: "event",
    id: "e2",
    description: "Priority changed to <strong>High</strong>",
  },
];

export const ATTACHMENTS: Attachment[] = [
  {
    id: "a1",
    filename: "error-screenshot.png",
    type: "image",
    thumbnailUrl: "https://picsum.photos/seed/tms1/200",
  },
  { id: "a2", filename: "browser-console.log", type: "document" },
];

export const ACTIVITY_LOG: ActivityLogEntry[] = [
  {
    id: "log1",
    description: "Ticket created",
    timestamp: "Jul 22, 2026 · 9:14 AM",
    actor: "Emily Nakamura",
    isLatest: false,
  },
  {
    id: "log2",
    description: "Assigned to <strong>Sarah Chen</strong>",
    timestamp: "Jul 22, 2026 · 9:15 AM",
    isLatest: false,
  },
  {
    id: "log3",
    description: "Agent replied",
    timestamp: "Jul 22, 2026 · 9:28 AM",
    actor: "Sarah Chen",
    isLatest: true,
  },
];
