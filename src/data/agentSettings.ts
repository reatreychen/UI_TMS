export interface AgentProfile {
  name: string;
  email: string;
  role: string;
  department: string;
  bio: string;
  avatarUrl: string;
}

export interface SettingsSubNavItem {
  id: "profile" | "notifications" | "security" | "preferences";
  icon: string;
  label: string;
}

export const AGENT_PROFILE: AgentProfile = {
  name: "Alex Rivera",
  email: "alex.rivera@kinetic.io",
  role: "Senior Support Agent",
  department: "Enterprise Support",
  bio: "Specializing in API integrations and enterprise SLA management.",
  avatarUrl: "https://i.pravatar.cc/150?u=alex",
};

export const JOB_ROLES = [
  "Junior Support Agent",
  "Support Agent",
  "Senior Support Agent",
  "Team Lead",
  "Support Manager",
] as const;

export const SETTINGS_SUB_NAV: SettingsSubNavItem[] = [
  { id: "profile", icon: "person", label: "Public Profile" },
  { id: "notifications", icon: "notifications", label: "Notifications" },
  { id: "security", icon: "shield", label: "Security & Privacy" },
  { id: "preferences", icon: "tune", label: "System Preferences" },
];
