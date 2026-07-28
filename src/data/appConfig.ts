import type { LucideIcon } from "lucide-react";
import {
  Bold,
  Italic,
  List,
  Link2,
  Paperclip,
  Image as ImageIcon,
} from "lucide-react";

export interface ToolbarItem {
  icon: LucideIcon;
  label: string;
}

export type PriorityValue = "low" | "medium" | "high" | "critical";
export type CategoryValue = "technical" | "billing" | "feature" | "account";

export interface PriorityOption {
  value: PriorityValue;
  label: string;
  color: string;
}

export interface CategoryOption {
  value: CategoryValue;
  label: string;
}

export const TOOLBAR_ACTIONS: ToolbarItem[] = [
  { icon: Bold, label: "Bold" },
  { icon: Italic, label: "Italic" },
  { icon: List, label: "Bullet list" },
  { icon: Link2, label: "Insert link" },
];

export const TOOLBAR_ATTACHMENTS: ToolbarItem[] = [
  { icon: Paperclip, label: "Attach file" },
  { icon: ImageIcon, label: "Insert image" },
];

export const PRIORITY_OPTIONS: PriorityOption[] = [
  { value: "low", label: "Low", color: "text-on-surface-variant" },
  { value: "medium", label: "Medium", color: "text-blue-600" },
  { value: "high", label: "High", color: "text-orange-600" },
  { value: "critical", label: "Critical", color: "text-error" },
];

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: "technical", label: "Technical Issue" },
  { value: "billing", label: "Billing & Payments" },
  { value: "feature", label: "Feature Request" },
  { value: "account", label: "Account & Access" },
];
