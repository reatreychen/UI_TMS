import { api } from "@/src/lib/api";

export interface AuditLogRecord {
  id: string;
  userId?: string | null;
  entity: string;
  entityId: string;
  action: string;
  ipAddress?: string | null;
  browserSignature?: string | null;
  createdAt: string;
}

export async function fetchAuditLogs(params?: { action?: string }): Promise<AuditLogRecord[]> {
  const response = await api.get("/audit-logs", { params });
  const payload = response.data?.data;

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}
