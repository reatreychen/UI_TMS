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
  name: "",
  email: "",
  role: "",
  department: "",
  bio: "",
  avatarUrl: "",
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
