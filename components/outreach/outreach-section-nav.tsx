"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const sections = [
  { label: "Emails", href: "/outreach/emails" },
  { label: "Tasks", href: "/outreach/tasks" },
  { label: "Sequences", href: "/outreach/sequences" },
  { label: "Templates", href: "/outreach/templates" },
  { label: "Analytics", href: "/outreach/analytics" },
  { label: "Mailboxes", href: "/outreach/settings" },
]

export function OutreachSectionNav() {
  const pathname = usePathname()

  return (
    <div className="flex flex-wrap gap-2">
      {sections.map((section) => {
        const isActive = pathname === section.href

        return (
          <Link
            key={section.href}
            href={section.href}
            className={cn(
              "inline-flex items-center rounded-full border px-4 py-2 text-sm transition-colors",
              isActive
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            {section.label}
          </Link>
        )
      })}
    </div>
  )
}
