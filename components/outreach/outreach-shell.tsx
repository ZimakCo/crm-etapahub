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

interface OutreachShellProps {
  sectionLabel: string
  title: string
  description: string
  actions?: ReactNode
  children: ReactNode
}

export function OutreachShell({ sectionLabel, title, description, actions, children }: OutreachShellProps) {
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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
                <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[11px]">
                  Beta
                </Badge>
              </div>
              <p className="max-w-4xl text-sm text-muted-foreground">{description}</p>
            </div>
            {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
          </div>

          <Card className="border-dashed">
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Outreach is the seller relationship workspace. It uses personal mailbox OAuth, seller-owned sequences, direct replies and task follow-up. Campaigns, broadcast domains, sender identities and batch delivery stay in Email Ops.
            </CardContent>
          </Card>

          <OutreachSectionNav />

          {children}
        </div>
      </main>
    </>
  )
}
