"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { outreachSections } from "@/components/outreach/outreach-theme"

export function OutreachSectionNav() {
  const pathname = usePathname()

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6" data-testid="outreach-section-nav">
      {outreachSections.map((section) => {
        const isActive = pathname === section.href
        const Icon = section.icon

        return (
          <Link
            key={section.href}
            href={section.href}
            className={cn(
              "group rounded-2xl border p-4 transition-all",
              isActive
                ? `${section.accentClassName} shadow-sm`
                : `${section.mutedClassName} text-muted-foreground hover:-translate-y-0.5 hover:text-foreground`
            )}
          >
            <div className="flex w-full items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="flex size-10 items-center justify-center rounded-2xl border border-foreground/10 bg-white/80 shadow-sm">
                  <Icon className="size-5" />
                </div>
                <div>
                  <p className="font-medium">{section.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {section.key === "emails" && "Inbox and replies"}
                    {section.key === "tasks" && "Manual seller work"}
                    {section.key === "sequences" && "Multi-step motion"}
                    {section.key === "templates" && "1:1 content blocks"}
                    {section.key === "analytics" && "Performance signals"}
                    {section.key === "mailboxes" && "OAuth and sync"}
                  </p>
                </div>
              </div>
              {isActive ? (
                <Badge variant="secondary" className="rounded-full border border-foreground/10 bg-white/80 text-foreground">
                  Live
                </Badge>
              ) : null}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
