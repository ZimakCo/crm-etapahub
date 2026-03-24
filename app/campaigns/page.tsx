"use client"

import Link from "next/link"
import { useCampaigns, useTemplates } from "@/lib/hooks"
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
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Plus, 
  Mail, 
  Clock, 
  CheckCircle2,
  PauseCircle,
  FileEdit,
  ArrowRight,
} from "lucide-react"
import type { Campaign } from "@/lib/types"

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatNumber(num: number) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

function getStatusIcon(status: Campaign["status"]) {
  switch (status) {
    case "sent":
      return <CheckCircle2 className="size-4 text-success" />
    case "scheduled":
      return <Clock className="size-4 text-info" />
    case "draft":
      return <FileEdit className="size-4 text-muted-foreground" />
    case "sending":
      return <Mail className="size-4 text-warning" />
    case "paused":
      return <PauseCircle className="size-4 text-warning" />
    default:
      return <Mail className="size-4 text-muted-foreground" />
  }
}

function getStatusBadge(status: Campaign["status"]) {
  const styles: Record<string, string> = {
    sent: "bg-success/10 text-success border-success/20",
    scheduled: "bg-info/10 text-info border-info/20",
    draft: "bg-muted text-muted-foreground border-border",
    sending: "bg-warning/10 text-warning border-warning/20",
    paused: "bg-warning/10 text-warning border-warning/20",
    cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  }
  return (
    <Badge variant="outline" className={styles[status] || styles.draft}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

function formatProvider(provider?: Campaign["provider"]) {
  switch (provider) {
    case "mailgun":
      return "Mailgun"
    case "kumomta":
      return "KumoMTA VPS"
    case "manual":
      return "Manual"
    default:
      return "Resend"
  }
}

export default function CampaignsPage() {
  const { campaigns, isLoading } = useCampaigns()
  const { templates } = useTemplates()

  const sections: Array<{ title: string; campaigns: Campaign[] }> = [
    { title: "Scheduled", campaigns: campaigns.filter((campaign) => campaign.status === "scheduled") },
    { title: "Sending", campaigns: campaigns.filter((campaign) => campaign.status === "sending") },
    { title: "Drafts", campaigns: campaigns.filter((campaign) => campaign.status === "draft") },
    { title: "Paused", campaigns: campaigns.filter((campaign) => campaign.status === "paused") },
    { title: "Sent", campaigns: campaigns.filter((campaign) => campaign.status === "sent") },
    { title: "Cancelled", campaigns: campaigns.filter((campaign) => campaign.status === "cancelled") },
  ]
  const providers = Array.from(new Set(campaigns.map((campaign) => formatProvider(campaign.provider))))
  const totalReplies = campaigns.reduce((total, campaign) => total + campaign.repliedCount, 0)
  const totalBounces = campaigns.reduce((total, campaign) => total + campaign.bouncedCount, 0)

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Campaigns</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <main className="flex-1 overflow-auto">
        <div className="flex flex-col gap-8 p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold tracking-tight">Email Operations</h1>
              <p className="text-sm text-muted-foreground">
                Manage provider lanes, segmented batches and plain-text templates inside the CRM.
              </p>
            </div>
            <Button asChild>
              <Link href="/campaigns/new">
                <Plus className="size-4" />
                Create Campaign
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Providers in Rotation</p>
                    <p className="mt-1 text-2xl font-semibold">{providers.length}</p>
                    <p className="text-xs text-muted-foreground">{providers.join(", ")}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Saved Templates</p>
                    <p className="mt-1 text-2xl font-semibold">{templates.length}</p>
                    <p className="text-xs text-muted-foreground">Reusable plain-text messages for delivery-first batches.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Replies Logged</p>
                    <p className="mt-1 text-2xl font-semibold">{totalReplies.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Conversations already attributed to campaigns.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Bounces to Clean</p>
                    <p className="mt-1 text-2xl font-semibold">{totalBounces.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Recipients that should influence future list hygiene.</p>
                  </CardContent>
                </Card>
              </div>

              {sections.map((section) =>
                section.campaigns.length > 0 ? (
                  <section key={section.title} className="space-y-4">
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      {section.title} ({section.campaigns.length})
                    </h2>
                    <div className="space-y-3">
                      {section.campaigns.map((campaign) => (
                        <CampaignCard key={campaign.id} campaign={campaign} />
                      ))}
                    </div>
                  </section>
                ) : null
              )}
            </div>
          )}
        </div>
      </main>
    </>
  )
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const openRate = campaign.deliveredCount > 0 
    ? ((campaign.openedCount / campaign.deliveredCount) * 100).toFixed(1)
    : "0"
  const clickRate = campaign.deliveredCount > 0
    ? ((campaign.clickedCount / campaign.deliveredCount) * 100).toFixed(1)
    : "0"

  return (
    <Link
      href={`/campaigns/${campaign.id}`}
      className="group block rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="rounded-lg bg-muted p-2.5">
            {getStatusIcon(campaign.status)}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{campaign.name}</h3>
              {getStatusBadge(campaign.status)}
              <Badge variant="secondary">{formatProvider(campaign.provider)}</Badge>
              {campaign.templateFormat && (
                <Badge variant="outline">{campaign.templateFormat === "plain_text" ? "Plain text" : "HTML"}</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {campaign.subject}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{formatNumber(campaign.totalRecipients)} recipients</span>
              <span>·</span>
              {campaign.sentAt ? (
                <span>Sent {formatDate(campaign.sentAt)}</span>
              ) : campaign.scheduledAt ? (
                <span>Scheduled for {formatDate(campaign.scheduledAt)}</span>
              ) : (
                <span>Last edited {formatDate(campaign.updatedAt)}</span>
              )}
              {campaign.segmentNames.length > 0 && (
                <>
                  <span>·</span>
                  <span>{campaign.segmentNames.join(", ")}</span>
                </>
              )}
              {campaign.templateName && (
                <>
                  <span>·</span>
                  <span>Template: {campaign.templateName}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {campaign.status === "sent" && (
          <div className="flex gap-6 items-center">
            <div className="text-right">
              <p className="text-lg font-semibold">{openRate}%</p>
              <p className="text-xs text-muted-foreground">Open Rate</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">{clickRate}%</p>
              <p className="text-xs text-muted-foreground">Click / Delivered</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">{campaign.repliedCount.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Replies</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">{campaign.bouncedCount.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Bounces</p>
            </div>
            <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}

        {campaign.status !== "sent" && (
          <div className="flex items-center gap-6 text-right">
            <div>
              <p className="text-lg font-semibold">{formatNumber(campaign.totalRecipients)}</p>
              <p className="text-xs text-muted-foreground">Recipients</p>
            </div>
            <div>
              <p className="text-lg font-semibold">{campaign.segmentNames.length}</p>
              <p className="text-xs text-muted-foreground">Segments</p>
            </div>
            <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </div>
    </Link>
  )
}
