import { api } from "../lib/api";
import {
  AdminDepartment,
  AdminRole,
  AdminUser,
  adminUserService,
  ApiResponse,
} from "./adminUserService";

export type AgentAvailability = "Online" | "Away (Lunch)" | "On Break" | "Offline";

export interface AgentPerformance {
  ticketsResolved: number;
  csatScore: number | null;
  avgResponseTime: string;
  slaRate: number | null;
}

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
  maxCapacity: number;
  capacityPct: number;
  skills: string[];
  autoAssignEnabled: boolean;
  performance?: AgentPerformance;
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
  skills?: string[];
  maxCapacity?: number;
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
  createdAt?: string | Date | null;
  firstResponseAt?: string | Date | null;
  resolvedAt?: string | Date | null;
  closedAt?: string | Date | null;
  updatedAt?: string | Date | null;
  rating?: number | null;
  slaDueAt?: string | Date | null;
}

interface TicketListPayload {
  data: BackendTicket[];
  meta?: {
    total: number;
  };
}

const ACTIVE_TICKET_STATUSES = new Set(["OPEN", "ASSIGNED", "IN_PROGRESS", "PENDING"]);

// Predefined skill presets per role for realistic agent data
const DEFAULT_SKILLS_BY_ROLE: Record<string, string[]> = {
  "Senior Support Specialist": ["Hardware", "Network", "Security"],
  "Tier 2 Engineer": ["Database", "API", "Cloud"],
  "Junior Agent": ["General", "Onboarding"],
  "Support Manager": ["Triage", "Escalations", "SLA Management"],
};

const DEFAULT_PERFORMANCE_BY_AGENT: Record<string, AgentPerformance> = {
  default: {
    ticketsResolved: 42,
    csatScore: 4.8,
    avgResponseTime: "12m",
    slaRate: 98.2,
  },
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "AG";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getRoleName(user: AdminUser): string {
  if (typeof user.role === "object" && user.role?.name) return user.role.name;
  if (typeof user.role === "string") return user.role;
  return user.jobTitle || "";
}

function isAgentUser(user: AdminUser, agentRoleIds: Set<string>) {
  const roleName = getRoleName(user).toLowerCase();

  // Exclude standard customer accounts that have no department or jobTitle
  if (roleName === "user" && !user.departmentId && !user.jobTitle) {
    return false;
  }

  return true;
}

function mapAvailability(user: AdminUser): AgentAvailability {
  if (user.accountLocked || !user.isActive) return "Offline";
  return "Online";
}

function calculateAvgResponseTime(tickets: BackendTicket[]): string {
  const timesInMinutes: number[] = [];
  for (const t of tickets) {
    const start = t.createdAt ? new Date(t.createdAt).getTime() : null;
    const endStr = t.firstResponseAt || t.resolvedAt || t.closedAt || t.updatedAt;
    const end = endStr ? new Date(endStr).getTime() : null;
    if (start && end && end >= start) {
      timesInMinutes.push((end - start) / 60000);
    }
  }

  if (timesInMinutes.length === 0) return "N/A";
  const avgMin = Math.round(timesInMinutes.reduce((a, b) => a + b, 0) / timesInMinutes.length);
  if (avgMin === 0) return "<1m";
  if (avgMin < 60) return `${avgMin}m`;
  const hrs = Math.floor(avgMin / 60);
  const mins = avgMin % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

function mapUserToAgent(
  user: AdminUser,
  ticketCounts: Map<string, number>,
  departmentsById: Map<string, AdminDepartment>,
  tickets: BackendTicket[] = []
): AgentRecord {
  const activeTickets = ticketCounts.get(user.id) ?? 0;
  const maxCapacity = 5;
  const role = user.jobTitle || getRoleName(user) || "Support Agent";
  const departmentName =
    user.department?.name ||
    (user.departmentId ? departmentsById.get(user.departmentId)?.name : undefined) ||
    "Technical Support";

  const skills = (user as any).skills && Array.isArray((user as any).skills) && (user as any).skills.length > 0
    ? (user as any).skills
    : DEFAULT_SKILLS_BY_ROLE[role] || ["General", "Customer Care"];

  // Compute real performance statistics from assigned tickets
  const assignedTickets = tickets.filter((t) => t.assignedAgentId === user.id);
  const resolvedCount = assignedTickets.filter((t) => {
    const s = (t.status || "").toUpperCase();
    return s === "RESOLVED" || s === "CLOSED" || Boolean(t.resolvedAt) || Boolean(t.closedAt);
  }).length;

  const ratedTickets = assignedTickets.filter((t) => typeof t.rating === "number" && (t.rating as number) > 0);
  const csatScore =
    ratedTickets.length > 0
      ? Number((ratedTickets.reduce((sum, t) => sum + (t.rating as number), 0) / ratedTickets.length).toFixed(1))
      : null;

  const slaTickets = assignedTickets.filter((t) => t.slaDueAt);
  const slaMetCount = slaTickets.filter((t) => {
    const end = t.resolvedAt || t.closedAt;
    return end && new Date(end) <= new Date(t.slaDueAt as string);
  }).length;
  const slaRate = slaTickets.length > 0 ? Number(((slaMetCount / slaTickets.length) * 100).toFixed(1)) : null;

  const avgResponseTime = calculateAvgResponseTime(assignedTickets);

  return {
    id: user.id,
    name: user.fullName,
    email: user.email,
    avatar: user.profileImage || undefined,
    initials: getInitials(user.fullName),
    role,
    queue: departmentName,
    status: mapAvailability(user),
    activeTickets,
    maxCapacity,
    capacityPct: Math.min(100, Math.round((activeTickets / maxCapacity) * 100)),
    skills,
    autoAssignEnabled: true,
    performance: {
      ticketsResolved: resolvedCount,
      csatScore,
      avgResponseTime,
      slaRate,
    },
  };
}

function buildTicketCounts(tickets: BackendTicket[]) {
  const counts = new Map<string, number>();

  for (const ticket of tickets) {
    const status = (ticket.status || "").toUpperCase().replace(/\s+/g, "_");
    if (!ticket.assignedAgentId || !ACTIVE_TICKET_STATUSES.has(status)) continue;
    counts.set(ticket.assignedAgentId, (counts.get(ticket.assignedAgentId) ?? 0) + 1);
  }

  return counts;
}

async function fetchTickets(limit = 500): Promise<BackendTicket[]> {
  try {
    const res = await api.get<ApiResponse<TicketListPayload | BackendTicket[]>>("/tickets", {
      params: { page: 1, limit },
    });

    const payload = res.data.data;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  } catch (err) {
    return [];
  }
}

// In-memory fallback mock agents matching user screenshot if backend users list is sparse
const MOCK_AGENTS_FALLBACK: AgentRecord[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    name: "Alex Morgan",
    email: "alex.morgan@company.com",
    initials: "AM",
    role: "Senior Support Specialist",
    queue: "Infrastructure",
    status: "Online",
    activeTickets: 4,
    maxCapacity: 5,
    capacityPct: 80,
    skills: ["Hardware", "Network", "Security"],
    autoAssignEnabled: true,
    performance: { ticketsResolved: 58, csatScore: 4.9, avgResponseTime: "8m", slaRate: 99.1 },
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    name: "Sarah Chen",
    email: "sarah.chen@company.com",
    initials: "SC",
    role: "Tier 2 Engineer",
    queue: "Backend Services",
    status: "Online",
    activeTickets: 2,
    maxCapacity: 5,
    capacityPct: 40,
    skills: ["Database", "API", "Cloud"],
    autoAssignEnabled: true,
    performance: { ticketsResolved: 44, csatScore: 4.8, avgResponseTime: "11m", slaRate: 98.5 },
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    name: "David Kim",
    email: "david.kim@company.com",
    initials: "DK",
    role: "Junior Agent",
    queue: "General Helpdesk",
    status: "Away (Lunch)",
    activeTickets: 5,
    maxCapacity: 5,
    capacityPct: 100,
    skills: ["General", "Onboarding"],
    autoAssignEnabled: false,
    performance: { ticketsResolved: 29, csatScore: 4.6, avgResponseTime: "18m", slaRate: 94.2 },
  },
];

export const adminAgentService = {
  async getAgentManagementData(): Promise<AgentManagementData> {
    const [users, roles, departments, tickets] = await Promise.all([
      adminUserService.getUsers().catch(() => []),
      adminUserService.getRoles().catch(() => []),
      adminUserService.getDepartments().catch(() => []),
      fetchTickets(),
    ]);

    const agentRoles = roles.filter((role) => role.name.toLowerCase().includes("agent") || role.name.toLowerCase().includes("support") || role.name.toLowerCase().includes("manager"));
    const agentRoleIds = new Set(agentRoles.map((role) => role.id));
    const departmentsById = new Map(departments.map((department) => [department.id, department]));
    const ticketCounts = buildTicketCounts(tickets);

    let agents: AgentRecord[] = [];

    if (users && users.length > 0) {
      const agentUsers = users.filter((user) => isAgentUser(user, agentRoleIds));
      const targetUsers = agentUsers.length > 0 ? agentUsers : users;

      // Deduplicate agents by ID
      const uniqueMap = new Map<string, AdminUser>();
      for (const u of targetUsers) {
        if (!uniqueMap.has(u.id)) {
          uniqueMap.set(u.id, u);
        }
      }
      const uniqueUsers = Array.from(uniqueMap.values());

      agents = uniqueUsers.map((user) => {
        const mapped = mapUserToAgent(user, ticketCounts, departmentsById, tickets);
        return {
          ...mapped,
          autoAssignEnabled: true,
          maxCapacity: 5,
          capacityPct: Math.min(100, Math.round((mapped.activeTickets / 5) * 100)),
        };
      });
    }

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
    let finalRoleId = agentRoleId;
    if (!finalRoleId) {
      const roles = await adminUserService.getRoles().catch(() => []);
      const agentRole = roles.find((r) => r.name.toLowerCase().includes("agent") || r.name.toLowerCase().includes("support")) || roles[0];
      finalRoleId = agentRole?.id || null;
    }

    const created = await adminUserService.createUser({
      fullName: payload.fullName,
      email: payload.email,
      password: payload.password || "TempPass123",
      jobTitle: payload.jobTitle || "Support Agent",
      departmentId: payload.departmentId,
      roleId: finalRoleId || undefined,
      isActive: true,
    });

    const departments = await adminUserService.getDepartments().catch(() => []);
    const departmentsById = new Map(departments.map((department) => [department.id, department]));

    const agent = mapUserToAgent(created, new Map(), departmentsById);
    if (payload.skills) agent.skills = payload.skills;
    if (payload.maxCapacity) {
      agent.maxCapacity = payload.maxCapacity;
      agent.capacityPct = Math.min(100, Math.round((agent.activeTickets / agent.maxCapacity) * 100));
    }
    return agent;
  },

  async updateAgentDepartment(agentId: string, departmentId: string | null): Promise<void> {
    await adminUserService.updateUser(agentId, { departmentId });
  },

  async removeAgent(agentId: string): Promise<void> {
    await adminUserService.deleteUser(agentId);
  },
};
