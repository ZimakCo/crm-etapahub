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
          <Card className={cn("overflow-hidden border", theme.heroClassName)}>
            <CardContent className="p-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-2xl border border-foreground/10 bg-white/85 shadow-sm">
                      <SectionIcon className="size-6 text-foreground" />
                    </div>
                    <Badge variant="outline" className={cn("rounded-full px-3 py-1 text-[11px] font-medium", theme.accentClassName)}>
                      Beta
                    </Badge>
                    <Badge variant="outline" className="rounded-full border-white/70 bg-white/70 px-3 py-1 text-[11px] text-foreground">
                      Seller-only module
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
                    <p className="max-w-4xl text-sm text-muted-foreground">{description}</p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-white/70 bg-white/70 p-3 text-sm text-muted-foreground shadow-sm">
                      <p className="font-medium text-foreground">Mailbox-linked</p>
                      <p className="mt-1">Each seller works from personal inbox connections, not a pooled sender stack.</p>
                    </div>
                    <div className="rounded-2xl border border-white/70 bg-white/70 p-3 text-sm text-muted-foreground shadow-sm">
                      <p className="font-medium text-foreground">Reply-driven</p>
                      <p className="mt-1">Replies, clicks and stop rules drive the next seller action in the workspace.</p>
                    </div>
                    <div className="rounded-2xl border border-white/70 bg-white/70 p-3 text-sm text-muted-foreground shadow-sm">
                      <p className="font-medium text-foreground">Separate from Email Ops</p>
                      <p className="mt-1">Contacts may be shared, but campaigns, broadcast domains and sender identities stay outside Outreach.</p>
                    </div>
                  </div>
                </div>

                {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
              </div>
            </CardContent>
          </Card>

          <Card className={cn("border-dashed", theme.mutedClassName)}>
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
