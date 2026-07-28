export type CustomerTicketStatus = "OPEN" | "RESOLVED" | "CLOSED" | "PENDING";

export interface CustomerRecentTicket {
  id: string;
  subject: string;
  status: CustomerTicketStatus;
  date: string;
}

export interface CustomerDetail {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  location: string;
  avatarUrl: string;
  totalTickets: number;
  lastActive: string;
  recentTickets: CustomerRecentTicket[];
}

export interface AgentCustomersStats {
  totalCustomers: string | number;
  activeToday: string | number;
  newThisWeek: string | number;
}

export const AGENT_CUSTOMERS_STATS: AgentCustomersStats = {
  totalCustomers: "12,842",
  activeToday: 847,
  newThisWeek: 124,
};

export const AGENT_CUSTOMERS: CustomerDetail[] = [
  {
    id: "cust-001",
    name: "Emily Nakamura",
    company: "Vertex Analytics",
    email: "emily.n@vertex.io",
    phone: "+1 (415) 555-0182",
    location: "San Francisco, CA",
    avatarUrl: "https://i.pravatar.cc/150?u=emily",
    totalTickets: 23,
    lastActive: "2 hours ago",
    recentTickets: [
      {
        id: "10482",
        subject: "Cannot access billing dashboard",
        status: "OPEN",
        date: "Jul 22, 2026",
      },
      {
        id: "10391",
        subject: "SSO login timeout",
        status: "RESOLVED",
        date: "Jul 18, 2026",
      },
    ],
  },
  {
    id: "cust-002",
    name: "James Okafor",
    company: "Northwind Logistics",
    email: "j.okafor@northwind.com",
    phone: "+1 (312) 555-0294",
    location: "Chicago, IL",
    avatarUrl: "https://i.pravatar.cc/150?u=james",
    totalTickets: 8,
    lastActive: "Yesterday",
    recentTickets: [
      {
        id: "10455",
        subject: "Webhook delivery failures",
        status: "OPEN",
        date: "Jul 21, 2026",
      },
    ],
  },
  {
    id: "cust-003",
    name: "Priya Sharma",
    company: "Globex Inc",
    email: "priya@globex.com",
    phone: "+1 (646) 555-0147",
    location: "New York, NY",
    avatarUrl: "https://i.pravatar.cc/150?u=priya",
    totalTickets: 15,
    lastActive: "4 hours ago",
    recentTickets: [
      {
        id: "10471",
        subject: "Invoice discrepancy for June",
        status: "PENDING",
        date: "Jul 20, 2026",
      },
    ],
  },
];
