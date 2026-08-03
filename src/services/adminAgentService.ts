import { api } from "../lib/api";
import {
  AdminDepartment,
  AdminRole,
  AdminUser,
  adminUserService,
  ApiResponse,
} from "./adminUserService";

export type AgentAvailability = "Online" | "Away (Lunch)" | "On Break" | "Offline";

export interface AgentRecord {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  initials?: string;
  role: string;
  queue: string;
  status: AgentAvailability;
  activeTickets: number;
  capacityPct: number;
}

export interface AgentStats {
  totalAgents: number;
  availableNow: number;
  availabilityPct: number;
}

export interface CreateAgentPayload {
  fullName: string;
  email: string;
  jobTitle?: string;
  departmentId?: string;
  password?: string;
}

export interface AgentManagementData {
  agents: AgentRecord[];
  roles: AdminRole[];
  departments: AdminDepartment[];
  agentRoleId: string | null;
}

interface BackendTicket {
  id: string;
  assignedAgentId?: string | null;
  status: string;
}

interface TicketListPayload {
  data: BackendTicket[];
  meta?: {
    total: number;
  };
}

const ACTIVE_TICKET_STATUSES = new Set(["OPEN", "ASSIGNED", "IN_PROGRESS", "PENDING"]);
const MAX_TICKET_CAPACITY = 10;

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "AG";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getRoleName(user: AdminUser): string {
  if (typeof user.role === "object" && user.role?.name) return user.role.name;
  if (typeof user.role === "string") return user.role;
  return user.jobTitle || "Support Agent";
}

function isAgentUser(user: AdminUser, agentRoleIds: Set<string>) {
  const roleName = getRoleName(user).toLowerCase();
  if (roleName.includes("agent")) return true;
  return Boolean(user.roleId && agentRoleIds.has(user.roleId));
}

function mapAvailability(user: AdminUser): AgentAvailability {
  if (user.accountLocked || !user.isActive) return "Offline";
  return "Online";
}

function mapUserToAgent(
  user: AdminUser,
  ticketCounts: Map<string, number>,
  departmentsById: Map<string, AdminDepartment>
): AgentRecord {
  const activeTickets = ticketCounts.get(user.id) ?? 0;
  const departmentName =
    user.department?.name ||
    (user.departmentId ? departmentsById.get(user.departmentId)?.name : undefined) ||
    "Unassigned";

  return {
    id: user.id,
    name: user.fullName,
    email: user.email,
    avatar: user.profileImage || undefined,
    initials: getInitials(user.fullName),
    role: user.jobTitle || getRoleName(user),
    queue: departmentName,
    status: mapAvailability(user),
    activeTickets,
    capacityPct: Math.min(100, Math.round((activeTickets / MAX_TICKET_CAPACITY) * 100)),
  };
}

function buildTicketCounts(tickets: BackendTicket[]) {
  const counts = new Map<string, number>();

  for (const ticket of tickets) {
    if (!ticket.assignedAgentId || !ACTIVE_TICKET_STATUSES.has(ticket.status)) continue;
    counts.set(ticket.assignedAgentId, (counts.get(ticket.assignedAgentId) ?? 0) + 1);
  }

  return counts;
}

async function fetchTickets(limit = 500): Promise<BackendTicket[]> {
  const res = await api.get<ApiResponse<TicketListPayload | BackendTicket[]>>("/tickets", {
    params: { page: 1, limit },
  });

  const payload = res.data.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

export const adminAgentService = {
  async getAgentManagementData(): Promise<AgentManagementData> {
    const [users, roles, departments, tickets] = await Promise.all([
      adminUserService.getUsers(),
      adminUserService.getRoles(),
      adminUserService.getDepartments(),
      fetchTickets(),
    ]);

    const agentRoles = roles.filter((role) => role.name.toLowerCase().includes("agent"));
    const agentRoleIds = new Set(agentRoles.map((role) => role.id));
    const departmentsById = new Map(departments.map((department) => [department.id, department]));
    const ticketCounts = buildTicketCounts(tickets);

    const agents = users
      .filter((user) => isAgentUser(user, agentRoleIds))
      .map((user) => mapUserToAgent(user, ticketCounts, departmentsById));

    return {
      agents,
      roles,
      departments,
      agentRoleId: agentRoles[0]?.id ?? null,
    };
  },

  computeStats(agents: AgentRecord[]): AgentStats {
    const totalAgents = agents.length;
    const availableNow = agents.filter((agent) => agent.status === "Online").length;

    return {
      totalAgents,
      availableNow,
      availabilityPct: totalAgents === 0 ? 0 : Math.round((availableNow / totalAgents) * 100),
    };
  },

  async createAgent(payload: CreateAgentPayload, agentRoleId: string | null): Promise<AgentRecord> {
    const created = await adminUserService.createUser({
      fullName: payload.fullName,
      email: payload.email,
      password: payload.password || "TempPass123",
      jobTitle: payload.jobTitle,
      departmentId: payload.departmentId,
      roleId: agentRoleId || undefined,
      isActive: true,
    });

    const departments = await adminUserService.getDepartments();
    const departmentsById = new Map(departments.map((department) => [department.id, department]));

    return mapUserToAgent(created, new Map(), departmentsById);
  },

  async updateAgentDepartment(agentId: string, departmentId: string | null): Promise<void> {
    await adminUserService.updateUser(agentId, { departmentId });
  },

  async removeAgent(agentId: string): Promise<void> {
    await adminUserService.deleteUser(agentId);
  },
};
