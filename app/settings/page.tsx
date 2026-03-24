"use client"

import Link from "next/link"
import { Cable, FileText, Mail, Upload } from "lucide-react"
import { useTemplates } from "@/lib/hooks"
import {
  formatProviderLabel,
  getProviderBadgeClass,
  getProviderStatusBadgeClass,
  providerLanes,
  templatePlaybooks,
} from "@/lib/email-ops"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  const { templates } = useTemplates()

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Settings</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">Operations Settings</h1>
            <p className="text-sm text-muted-foreground">
              One place to understand provider routing, send windows and the manual day-by-day workflow used by the team.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Provider Lanes</p>
                <p className="mt-1 text-2xl font-semibold">{providerLanes.length}</p>
                <p className="text-xs text-muted-foreground">Resend, Mailgun and KumoMTA visualized as distinct operational lanes.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Template Playbooks</p>
                <p className="mt-1 text-2xl font-semibold">{templatePlaybooks.length}</p>
                <p className="text-xs text-muted-foreground">Templates tied to provider and active days, ready for manual list upload workflow.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Saved Templates</p>
                <p className="mt-1 text-2xl font-semibold">{templates.length}</p>
                <p className="text-xs text-muted-foreground">The content assets currently available in your CRM library.</p>
              </CardContent>
            </Card>
          </div>

          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Provider Connections</h2>
              <p className="text-sm text-muted-foreground">
                These are the sending lanes the team works with when preparing daily batches.
              </p>
            </div>
            <div className="grid gap-4 xl:grid-cols-3">
              {providerLanes.map((lane) => (
                <Card key={lane.id}>
                  <CardHeader className="gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle>{lane.title}</CardTitle>
                        <CardDescription>{lane.bestFor}</CardDescription>
                      </div>
                      <Badge variant="secondary" className={getProviderStatusBadgeClass(lane.status)}>
                        {lane.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center justify-between rounded-lg border border-border p-3">
                      <span className="text-muted-foreground">Provider</span>
                      <Badge variant="secondary" className={getProviderBadgeClass(lane.provider)}>
                        {formatProviderLabel(lane.provider)}
                      </Badge>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Active days</p>
                        <p className="mt-1 font-medium">{lane.activeDays}</p>
                      </div>
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Send window</p>
                        <p className="mt-1 font-medium">{lane.sendWindow}</p>
                      </div>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Identity</p>
                      <p className="mt-1 font-medium">{lane.fromIdentity}</p>
                      <p className="text-xs text-muted-foreground">{lane.dailyVolume}</p>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-3 text-muted-foreground">
                      {lane.notes}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Template to Provider Mapping</h2>
              <p className="text-sm text-muted-foreground">
                This is the operational logic you described: template X goes through provider X for a defined window of days.
              </p>
            </div>
            <div className="space-y-3">
              {templatePlaybooks.map((playbook) => (
                <Card key={playbook.id}>
                  <CardContent className="flex flex-col gap-4 pt-6 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{playbook.templateName}</p>
                        <Badge variant="secondary" className={getProviderBadgeClass(playbook.provider)}>
                          {formatProviderLabel(playbook.provider)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{playbook.purpose}</p>
                    </div>
                    <div className="grid gap-3 text-sm md:min-w-[340px] md:grid-cols-2">
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Active days</p>
                        <p className="mt-1 font-medium">{playbook.activeDays}</p>
                        <p className="text-xs text-muted-foreground">{playbook.duration}</p>
                      </div>
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Daily list workflow</p>
                        <p className="mt-1 text-muted-foreground">{playbook.listWorkflow}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Manual Daily Workflow</h2>
              <p className="text-sm text-muted-foreground">
                The product now exposes the exact operational order your team follows every day.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="space-y-2 pt-6">
                  <Upload className="size-5 text-muted-foreground" />
                  <p className="font-medium">1. Import CSV</p>
                  <p className="text-sm text-muted-foreground">Load the chosen list manually and keep the batch name as the tracking tag.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="space-y-2 pt-6">
                  <FileText className="size-5 text-muted-foreground" />
                  <p className="font-medium">2. Pick Template</p>
                  <p className="text-sm text-muted-foreground">Choose the right plain-text asset from the separate template library.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="space-y-2 pt-6">
                  <Cable className="size-5 text-muted-foreground" />
                  <p className="font-medium">3. Route Provider</p>
                  <p className="text-sm text-muted-foreground">Send through the lane assigned to that template and active for that day window.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="space-y-2 pt-6">
                  <Mail className="size-5 text-muted-foreground" />
                  <p className="font-medium">4. Track Outcome</p>
                  <p className="text-sm text-muted-foreground">Monitor replies, bounces, unsubscribes and conversation history from the CRM.</p>
                </CardContent>
              </Card>
            </div>
          </section>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/templates">Open Template Library</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contacts/import">Import CSV Batch</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/campaigns/new">Create Daily Send Batch</Link>
            </Button>
          </div>
        </div>
      </main>
    </>
  )
}
