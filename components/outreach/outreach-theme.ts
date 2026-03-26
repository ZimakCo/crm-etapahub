import {
  BarChart3,
  Inbox,
  Mail,
  Settings2,
  Sparkles,
  Workflow,
  type LucideIcon,
} from "lucide-react"

export type OutreachSectionKey = "emails" | "tasks" | "sequences" | "templates" | "analytics" | "mailboxes"

export interface OutreachSectionTheme {
  key: OutreachSectionKey
  label: string
  href: string
  icon: LucideIcon
  heroClassName: string
  accentClassName: string
  mutedClassName: string
}

export const outreachSections: OutreachSectionTheme[] = [
  {
    key: "emails",
    label: "Emails",
    href: "/outreach/emails",
    icon: Inbox,
    heroClassName: "border-sky-200/70 bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.35),transparent_38%),linear-gradient(135deg,rgba(239,246,255,0.96),rgba(248,250,252,0.9))]",
    accentClassName: "border-sky-300/70 bg-sky-100 text-sky-900",
    mutedClassName: "border-sky-200/80 bg-sky-50/70",
  },
  {
    key: "tasks",
    label: "Tasks",
    href: "/outreach/tasks",
    icon: Settings2,
    heroClassName: "border-amber-200/70 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.3),transparent_36%),linear-gradient(135deg,rgba(255,251,235,0.98),rgba(248,250,252,0.92))]",
    accentClassName: "border-amber-300/70 bg-amber-100 text-amber-900",
    mutedClassName: "border-amber-200/80 bg-amber-50/80",
  },
  {
    key: "sequences",
    label: "Sequences",
    href: "/outreach/sequences",
    icon: Workflow,
    heroClassName: "border-emerald-200/70 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.28),transparent_36%),linear-gradient(135deg,rgba(236,253,245,0.98),rgba(248,250,252,0.92))]",
    accentClassName: "border-emerald-300/70 bg-emerald-100 text-emerald-900",
    mutedClassName: "border-emerald-200/80 bg-emerald-50/80",
  },
  {
    key: "templates",
    label: "Templates",
    href: "/outreach/templates",
    icon: Sparkles,
    heroClassName: "border-fuchsia-200/70 bg-[radial-gradient(circle_at_top_left,rgba(217,70,239,0.24),transparent_36%),linear-gradient(135deg,rgba(253,244,255,0.98),rgba(248,250,252,0.92))]",
    accentClassName: "border-fuchsia-300/70 bg-fuchsia-100 text-fuchsia-900",
    mutedClassName: "border-fuchsia-200/80 bg-fuchsia-50/80",
  },
  {
    key: "analytics",
    label: "Analytics",
    href: "/outreach/analytics",
    icon: BarChart3,
    heroClassName: "border-violet-200/70 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.24),transparent_36%),linear-gradient(135deg,rgba(245,243,255,0.98),rgba(248,250,252,0.92))]",
    accentClassName: "border-violet-300/70 bg-violet-100 text-violet-900",
    mutedClassName: "border-violet-200/80 bg-violet-50/80",
  },
  {
    key: "mailboxes",
    label: "Mailboxes",
    href: "/outreach/settings",
    icon: Mail,
    heroClassName: "border-rose-200/70 bg-[radial-gradient(circle_at_top_left,rgba(251,113,133,0.24),transparent_36%),linear-gradient(135deg,rgba(255,241,242,0.98),rgba(248,250,252,0.92))]",
    accentClassName: "border-rose-300/70 bg-rose-100 text-rose-900",
    mutedClassName: "border-rose-200/80 bg-rose-50/80",
  },
]

export function getOutreachSectionTheme(key: OutreachSectionKey) {
  return outreachSections.find((section) => section.key === key) ?? outreachSections[0]
}
