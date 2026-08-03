import { api } from "@/src/lib/api";

export interface ChatSessionCustomer {
  id: string;
  fullName?: string;
  avatarUrl?: string;
}

export interface ChatSession {
  id: string;
  customerId: string;
  agentId?: string;
  isEnterprise: boolean;
  startedAt: string;
  endedAt?: string | null;
  customer?: ChatSessionCustomer;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  message: string;
  createdAt: string;
  sender?: {
    id: string;
    fullName?: string;
    name?: string;
    avatarUrl?: string;
    role?: string;
  };
}

export async function fetchActiveChatSessions(): Promise<ChatSession[]> {
  const res = await api.get("/chat/sessions", { params: { active: true } });
  return res.data?.data ?? [];
}

export async function fetchChatSessionMessages(sessionId: string): Promise<ChatMessage[]> {
  const res = await api.get(`/chat/sessions/${sessionId}/messages`);
  return res.data?.data ?? [];
}

export async function sendChatSessionMessage(
  sessionId: string,
  senderId: string,
  message: string,
): Promise<ChatMessage> {
  const res = await api.post(`/chat/sessions/${sessionId}/messages`, {
    senderId,
    message,
  });

  return res.data?.data ?? res.data;
}
