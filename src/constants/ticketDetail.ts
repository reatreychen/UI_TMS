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
  id: "",
  subject: "",
  status: "",
  createdAt: "",
  assignee: {
    avatarUrl: "",
    name: "",
  },
  priority: "",
  category: "",
  slaDue: "",
};

export const TIMELINE_ITEMS: TimelineItem[] = [];

export const ATTACHMENTS: Attachment[] = [];

export const ACTIVITY_LOG: ActivityLogEntry[] = [];
