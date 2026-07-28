import { api } from "@/src/lib/api";

export interface BackendCategory {
  id: string;
  name: string;
  department_id: string;
  department?: { id: string; name: string };
}

export interface PortalStatsResponse {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
}

export async function fetchPublicCategories(): Promise<BackendCategory[]> {
  try {
    const res = await api.get("/categories/public");
    const payload = res.data?.data;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
  } catch {
    return [];
  }
}

export async function fetchMyTickets(params?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const res = await api.get("/tickets", { params: { ...params, limit: 5 } });
    const payload = res.data?.data;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
  } catch {
    return [];
  }
}
