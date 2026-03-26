"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { outreachSections } from "@/components/outreach/outreach-theme"

export function OutreachSectionNav() {
  const pathname = usePathname()

  return (
    <div className="overflow-x-auto border-b border-border" data-testid="outreach-section-nav">
      <div className="flex min-w-max items-center gap-6">
      {outreachSections.map((section) => {
        const isActive = pathname === section.href
        const Icon = section.icon

        return (
          <Link
            key={section.href}
            href={section.href}
            className={cn(
              "inline-flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors",
              isActive ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <span className={cn("flex size-7 items-center justify-center rounded-full border", section.iconClassName)}>
              <Icon className="size-4" />
            </span>
            <span>{section.label}</span>
            {isActive ? <Badge variant="secondary" className="rounded-full px-2 py-0 text-[11px]">Open</Badge> : null}
          </Link>
        )
      })}
      </div>
    </div>
  )
}
