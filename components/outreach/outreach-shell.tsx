import type { ReactNode } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { OutreachSectionNav } from "@/components/outreach/outreach-section-nav"
import { type OutreachSectionKey, getOutreachSectionTheme } from "@/components/outreach/outreach-theme"
import { cn } from "@/lib/utils"

interface OutreachShellProps {
  sectionKey: OutreachSectionKey
  sectionLabel: string
  title: string
  description: string
  actions?: ReactNode
  children: ReactNode
}

export function OutreachShell({ sectionKey, sectionLabel, title, description, actions, children }: OutreachShellProps) {
  const theme = getOutreachSectionTheme(sectionKey)
  const SectionIcon = theme.icon

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/outreach/emails">Outreach</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{sectionLabel}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex-1 overflow-auto p-6" data-testid="outreach-page">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <Card className="border bg-background shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className={cn("flex size-11 items-center justify-center rounded-2xl border", theme.iconClassName)}>
                      <SectionIcon className="size-5" />
                    </div>
                    <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] font-medium">
                      Beta
                    </Badge>
                    <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] text-foreground">
                      Relationship CRM
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
                    <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Personal mailboxes, direct replies, seller-owned sequences and manual follow-up live here. Campaign sender
                    identities, broadcast domains and batch delivery remain outside this module.
                  </p>
                </div>

                {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
              </div>
            </CardContent>
          </Card>

          <OutreachSectionNav />

          {children}
        </div>
      </main>
    </>
  )
}
