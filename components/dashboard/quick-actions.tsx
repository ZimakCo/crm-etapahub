"use client"

import Link from "next/link"
import { Plus, Upload, Mail, Filter, CalendarFold } from "lucide-react"
import { Button } from "@/components/ui/button"

export function QuickActions() {
  const actions = [
    {
      label: "Add Contact",
      href: "/contacts/new",
      icon: Plus,
      variant: "default" as const,
    },
    {
      label: "Import CSV Batch",
      href: "/contacts/import",
      icon: Upload,
      variant: "secondary" as const,
    },
    {
      label: "New Plain-text Campaign",
      href: "/campaigns/new",
      icon: Mail,
      variant: "secondary" as const,
    },
    {
      label: "Create Segment",
      href: "/segments/new",
      icon: Filter,
      variant: "secondary" as const,
    },
    {
      label: "Create Event Folder",
      href: "/events/new",
      icon: CalendarFold,
      variant: "secondary" as const,
    },
  ]

  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((action) => (
        <Button key={action.label} variant={action.variant} asChild>
          <Link href={action.href}>
            <action.icon className="size-4" />
            {action.label}
          </Link>
        </Button>
      ))}
    </div>
  )
}
