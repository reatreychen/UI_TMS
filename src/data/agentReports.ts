export type ReportKPIIcon = "star" | "verified";
export type ReportKPIBadgeColor = "green" | "blue";

export interface ReportKPI {
  label: string;
  value: string | number;
  valueSuffix?: string;
  footer: string;
  badge?: string;
  badgeColor?: ReportKPIBadgeColor;
  icon?: ReportKPIIcon;
}

export interface ReportVolumeWeek {
  week: string;
  resolved: number;
  newTickets: number;
}

export interface ReportCategory {
  label: string;
  percent: number;
  color: string;
}

export interface ReportPerformanceBar {
  metric: string;
  teamAvgHeight: number;
  myHeight: number;
}

export interface ReportContributor {
  name: string;
  initials: string;
  avatarColor: string;
  role: string;
  resolved: number;
  rating: number;
  slaMet: string;
  slaColor: string;
}

export const REPORTS_KPIS: ReportKPI[] = [
  {
    label: "Tickets Resolved",
    value: 142,
    footer: "+12% vs last month",
    badge: "+12%",
    badgeColor: "green",
  },
  {
    label: "Avg. Resolution Time",
    value: "4.2",
    valueSuffix: " hrs",
    footer: "Target: 6 hrs",
    badge: "On Track",
    badgeColor: "blue",
  },
  {
    label: "Customer Rating",
    value: "4.8",
    valueSuffix: "/5",
    footer: "Based on 89 surveys",
    icon: "star",
  },
  {
    label: "SLA Compliance",
    value: "96",
    valueSuffix: "%",
    footer: "Enterprise tier",
    icon: "verified",
  },
];

export const REPORTS_VOLUME_WEEKS: ReportVolumeWeek[] = [
  { week: "W1", resolved: 45, newTickets: 52 },
  { week: "W2", resolved: 58, newTickets: 48 },
  { week: "W3", resolved: 62, newTickets: 55 },
  { week: "W4", resolved: 71, newTickets: 60 },
];

export const REPORTS_CATEGORIES: ReportCategory[] = [
  { label: "Technical", percent: 42, color: "bg-primary" },
  { label: "Billing", percent: 28, color: "bg-secondary" },
  { label: "Account", percent: 18, color: "bg-tertiary" },
  { label: "Feature Request", percent: 12, color: "bg-outline" },
];

export const REPORTS_PERFORMANCE: ReportPerformanceBar[] = [
  { metric: "Resolution", teamAvgHeight: 65, myHeight: 82 },
  { metric: "Response", teamAvgHeight: 70, myHeight: 88 },
  { metric: "CSAT", teamAvgHeight: 75, myHeight: 91 },
  { metric: "SLA", teamAvgHeight: 80, myHeight: 96 },
];

export const REPORTS_CONTRIBUTORS: ReportContributor[] = [
  {
    name: "Sarah Chen",
    initials: "SC",
    avatarColor: "bg-primary-container text-on-primary-container",
    role: "Senior Agent",
    resolved: 187,
    rating: 4.9,
    slaMet: "98%",
    slaColor: "bg-green-100 text-green-700",
  },
  {
    name: "Marcus Webb",
    initials: "MW",
    avatarColor: "bg-secondary-container text-on-secondary-container",
    role: "Support Agent",
    resolved: 156,
    rating: 4.7,
    slaMet: "95%",
    slaColor: "bg-green-100 text-green-700",
  },
  {
    name: "Alex Rivera",
    initials: "AR",
    avatarColor: "bg-tertiary-container text-on-tertiary-container",
    role: "Senior Agent",
    resolved: 142,
    rating: 4.8,
    slaMet: "96%",
    slaColor: "bg-green-100 text-green-700",
  },
];
