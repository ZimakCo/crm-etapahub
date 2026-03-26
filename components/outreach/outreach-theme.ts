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
  iconClassName: string
}

export const outreachSections: OutreachSectionTheme[] = [
  {
    key: "emails",
    label: "Emails",
    href: "/outreach/emails",
    icon: Inbox,
    iconClassName: "border-sky-200/80 bg-sky-50 text-sky-700",
  },
  {
    key: "tasks",
    label: "Tasks",
    href: "/outreach/tasks",
    icon: Settings2,
    iconClassName: "border-amber-200/80 bg-amber-50 text-amber-700",
  },
  {
    key: "sequences",
    label: "Sequences",
    href: "/outreach/sequences",
    icon: Workflow,
    iconClassName: "border-emerald-200/80 bg-emerald-50 text-emerald-700",
  },
  {
    key: "templates",
    label: "Templates",
    href: "/outreach/templates",
    icon: Sparkles,
    iconClassName: "border-fuchsia-200/80 bg-fuchsia-50 text-fuchsia-700",
  },
  {
    key: "analytics",
    label: "Analytics",
    href: "/outreach/analytics",
    icon: BarChart3,
    iconClassName: "border-violet-200/80 bg-violet-50 text-violet-700",
  },
  {
    key: "mailboxes",
    label: "Mailboxes",
    href: "/outreach/settings",
    icon: Mail,
    iconClassName: "border-rose-200/80 bg-rose-50 text-rose-700",
  },
]

export function getOutreachSectionTheme(key: OutreachSectionKey) {
  return outreachSections.find((section) => section.key === key) ?? outreachSections[0]
}
