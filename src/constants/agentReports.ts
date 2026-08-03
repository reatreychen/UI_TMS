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
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  role: string;
  resolved: number;
  rating: number | null;
  slaMet: string;
  slaColor: string;
}
