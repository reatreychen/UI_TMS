import { api } from "@/src/lib/api";

export interface AuditLogRecord {
  id: string;
  userId?: string | null;
  user_id?: string | null;
  user?: {
    id: string;
    fullName?: string;
    name?: string;
    profileImage?: string;
    avatarUrl?: string;
  } | null;
  entity: string;
  entityId?: string;
  entity_id?: string;
  action: string;
  ipAddress?: string | null;
  ip_address?: string | null;
  browserSignature?: string | null;
  browser_signature?: string | null;
  createdAt?: string;
  created_at?: string;
}

export async function fetchAuditLogs(params?: { action?: string }): Promise<AuditLogRecord[]> {
  try {
    const response = await api.get("/audit-logs", { params });
    const payload = response.data?.data;

    let records: AuditLogRecord[] = [];
    if (Array.isArray(payload)) {
      records = payload;
    } else if (Array.isArray(payload?.data)) {
      records = payload.data;
    }

    if (records.length > 0) {
      return records;
    }

    // Fallback: If audit_logs table has no entries yet, load from ticket-logs
    const ticketLogsRes = await api.get("/ticket-logs");
    const ticketLogsPayload = ticketLogsRes.data?.data;
    const ticketLogs = Array.isArray(ticketLogsPayload)
      ? ticketLogsPayload
      : Array.isArray(ticketLogsPayload?.data)
      ? ticketLogsPayload.data
      : [];

    if (Array.isArray(ticketLogs) && ticketLogs.length > 0) {
      return ticketLogs.map((log: any) => ({
        id: log.id || `TLOG-${Math.random().toString(36).substring(2, 7)}`,
        userId: log.actorId || log.actor?.id,
        user: log.actor ? {
          id: log.actor.id,
          fullName: log.actor.fullName || log.actor.name,
          profileImage: log.actor.profileImage,
        } : null,
        entity: "Ticket",
        entityId: log.ticketId ? `#${log.ticketId.slice(0, 8)}` : "—",
        action: log.action || "UPDATE",
        ipAddress: "127.0.0.1",
        browserSignature: "System Telemetry / Agent",
        createdAt: log.createdAt || new Date().toISOString(),
      }));
    }

    return [];
  } catch (error) {
    console.warn("fetchAuditLogs direct call failed, attempting fallback to ticket-logs", error);
    try {
      const ticketLogsRes = await api.get("/ticket-logs");
      const ticketLogsPayload = ticketLogsRes.data?.data;
      const ticketLogs = Array.isArray(ticketLogsPayload)
        ? ticketLogsPayload
        : Array.isArray(ticketLogsPayload?.data)
        ? ticketLogsPayload.data
        : [];

      if (Array.isArray(ticketLogs) && ticketLogs.length > 0) {
        return ticketLogs.map((log: any) => ({
          id: log.id,
          userId: log.actorId || log.actor?.id,
          user: log.actor ? {
            id: log.actor.id,
            fullName: log.actor.fullName || log.actor.name,
            profileImage: log.actor.profileImage,
          } : null,
          entity: "Ticket",
          entityId: log.ticketId ? `#${log.ticketId.slice(0, 8)}` : "—",
          action: log.action || "UPDATE",
          ipAddress: "127.0.0.1",
          browserSignature: "System Telemetry",
          createdAt: log.createdAt || new Date().toISOString(),
        }));
      }
    } catch {
      // Ignore fallback error
    }
    return [];
  }
}

export async function fetchAuditLogsById(id: string): Promise<AuditLogRecord | null> {
  try {
    const response = await api.get(`/audit-logs/${id}`);
    const payload = response.data?.data;
    return payload || null;
  } catch {
    return null;
  }
}
