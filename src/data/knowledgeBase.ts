import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Headphones,
  Users,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";

export interface Article {
  title: string;
  href: string;
  description: string;
}

export interface TrendingDiscussion {
  title: string;
  href: string;
  meta: string;
}

export interface DocLink {
  icon: LucideIcon;
  label: string;
  href: string;
}

export interface SupportCard {
  icon: LucideIcon;
  iconBg: string;
  title: string;
  description: string;
  linkText: string;
}

export interface ResourceLink {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Category {
  title: string;
  href: string;
  icon: string;
  description: string;
}

export const articles: Article[] = [
  {
    title: "Setting Up Automated Escalations",
    href: "/customer/knowledge-base/escalations",
    description:
      "Configure SLA-based escalation rules and notification sequences.",
  },
  {
    title: "API Authentication Guide",
    href: "/customer/knowledge-base/api-auth",
    description: "OAuth 2.0, API keys, and webhook signature verification.",
  },
  {
    title: "Managing User Roles & Permissions",
    href: "/customer/knowledge-base/roles",
    description: "Assign roles, configure access levels, and audit changes.",
  },
];

export const trendingDiscussions: TrendingDiscussion[] = [
  {
    title: "Best practices for bulk ticket import?",
    href: "#",
    meta: "24 replies · Updated 2h ago",
  },
  {
    title: "Custom SLA policies for enterprise tiers",
    href: "#",
    meta: "18 replies · Updated 5h ago",
  },
];

export const docLinks: DocLink[] = [
  { icon: BookOpen, label: "Getting Started", href: "/customer/knowledge-base" },
  { icon: ShieldCheck, label: "Security & Compliance", href: "#" },
];

export const supportCards: SupportCard[] = [
  {
    icon: BookOpen,
    iconBg: "bg-primary-container text-on-primary-container",
    title: "Knowledge Base",
    description: "Browse articles, guides, and tutorials.",
    linkText: "Explore articles",
  },
  {
    icon: Headphones,
    iconBg: "bg-secondary-container text-on-secondary-container",
    title: "Contact Support",
    description: "Open a ticket and get help from our team.",
    linkText: "Create ticket",
  },
  {
    icon: Users,
    iconBg: "bg-tertiary-container text-on-tertiary-container",
    title: "Community",
    description: "Connect with other enterprise customers.",
    linkText: "Join forum",
  },
];

export const resources: ResourceLink[] = [
  {
    icon: BookOpen,
    title: "Getting Started Guide",
    description: "Learn the basics of Kinetic TMS.",
    href: "/customer/knowledge-base/getting-started",
  },
  {
    icon: HelpCircle,
    title: "FAQ",
    description: "Answers to common questions.",
    href: "/customer/knowledge-base#faq",
  },
  {
    icon: ShieldCheck,
    title: "Security Best Practices",
    description: "Keep your account secure.",
    href: "/customer/knowledge-base/security",
  },
];

export const faqs: FAQ[] = [
  {
    question: "How do I reset my password?",
    answer:
      "Go to the login page and click 'Forgot Password'. You'll receive a reset link within a few minutes.",
  },
  {
    question: "What are your support hours?",
    answer:
      "Enterprise customers have 24/7 support. Standard plans receive support Monday–Friday, 9 AM–6 PM local time.",
  },
  {
    question: "How do I escalate a ticket?",
    answer:
      "Reply to your existing ticket and mention 'escalate' or contact your account manager directly for priority handling.",
  },
];

export const popularSearches = [
  "API authentication",
  "SLA configuration",
  "Bulk import",
  "Webhook setup",
];

export const categories: Category[] = [
  {
    title: "Getting Started",
    href: "#",
    icon: "rocket_launch",
    description: "Onboarding, setup, and first steps.",
  },
  {
    title: "Technical",
    href: "#",
    icon: "code",
    description: "API, integrations, and troubleshooting.",
  },
  {
    title: "Billing",
    href: "#",
    icon: "payments",
    description: "Invoices, plans, and payment methods.",
  },
];
