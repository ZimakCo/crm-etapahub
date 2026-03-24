"use client"

import Link from "next/link"
import { FileText, Mail, Plus, Send, Settings2 } from "lucide-react"
import { useCampaigns, useTemplates } from "@/lib/hooks"
import {
  formatProviderLabel,
  getProviderBadgeClass,
  getTemplatePlaybook,
  getTemplateUsageCount,
  providerLanes,
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
import { Skeleton } from "@/components/ui/skeleton"

export default function TemplatesPage() {
  const { templates, isLoading } = useTemplates()
  const { campaigns } = useCampaigns()

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Templates</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/settings">
              <Settings2 className="size-4" />
              Provider Settings
            </Link>
          </Button>
          <Button asChild>
            <Link href="/templates/new">
              <Plus className="size-4" />
              New Template
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">Template Library</h1>
            <p className="text-sm text-muted-foreground">
              Keep templates separate from campaigns and tie each one to the right provider lane and send window.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Saved Templates</p>
                <p className="mt-1 text-2xl font-semibold">{templates.length}</p>
                <p className="text-xs text-muted-foreground">Plain-text assets managed independently from daily send batches.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Active Provider Lanes</p>
                <p className="mt-1 text-2xl font-semibold">{providerLanes.length}</p>
                <p className="text-xs text-muted-foreground">Resend, Mailgun and KumoMTA routing visible in one place.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Template-linked Campaigns</p>
                <p className="mt-1 text-2xl font-semibold">
                  {campaigns.filter((campaign) => Boolean(campaign.templateId)).length}
                </p>
                <p className="text-xs text-muted-foreground">Batches already generated starting from a saved template.</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-dashed">
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Recommended flow: create the template here, decide the provider lane and active days in Settings, then every day import the chosen CSV list and build the send batch from Campaigns.
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {templates.map((template) => {
                const playbook = getTemplatePlaybook(template.name)
                const usageCount = getTemplateUsageCount(template, campaigns)

                return (
                  <Card key={template.id} className="overflow-hidden">
                    <CardHeader className="gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <CardTitle>{template.name}</CardTitle>
                          <CardDescription>{template.subject}</CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">
                            {template.format === "plain_text" ? "Plain text" : "HTML"}
                          </Badge>
                          {playbook && (
                            <Badge variant="secondary" className={getProviderBadgeClass(playbook.provider)}>
                              {formatProviderLabel(playbook.provider)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-lg border border-border p-3">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Assigned lane</p>
                          <p className="mt-1 font-medium">
                            {playbook ? formatProviderLabel(playbook.provider) : "Not assigned yet"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {playbook ? `${playbook.activeDays} · ${playbook.duration}` : "Decide the provider in Settings before using this template in production."}
                          </p>
                        </div>
                        <div className="rounded-lg border border-border p-3">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Usage</p>
                          <p className="mt-1 font-medium">{usageCount} campaign{usageCount !== 1 ? "s" : ""}</p>
                          <p className="text-xs text-muted-foreground">
                            {playbook ? playbook.listWorkflow : "No provider playbook linked yet."}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-lg bg-muted/40 p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Preview text body</p>
                        <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground">
                          {template.textContent}
                        </pre>
                      </div>

                      {playbook && (
                        <div className="rounded-lg border border-border p-3 text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">Purpose:</span> {playbook.purpose}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" asChild>
                          <Link href="/campaigns/new">
                            <Send className="size-4" />
                            Use in Batch
                          </Link>
                        </Button>
                        <Button variant="outline" asChild>
                          <Link href="/settings">
                            <Mail className="size-4" />
                            Review Provider Lane
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {!isLoading && templates.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
                <FileText className="size-8 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="font-medium">No templates saved yet</p>
                  <p className="text-sm text-muted-foreground">Create your first provider-ready plain-text template.</p>
                </div>
                <Button asChild>
                  <Link href="/templates/new">Create Template</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  )
}
