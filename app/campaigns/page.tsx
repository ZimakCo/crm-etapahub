"use client"

import Link from "next/link"
import { useCampaigns } from "@/lib/hooks"
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

export default function CampaignsPage() {
  const { campaigns, isLoading } = useCampaigns()

  // Group campaigns by status
  const sentCampaigns = campaigns.filter(c => c.status === "sent")
  const scheduledCampaigns = campaigns.filter(c => c.status === "scheduled")
  const draftCampaigns = campaigns.filter(c => c.status === "draft")

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
              <h1 className="text-2xl font-semibold tracking-tight">Campaigns</h1>
              <p className="text-sm text-muted-foreground">
                Create and manage email campaigns
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
              {/* Scheduled Campaigns */}
              {scheduledCampaigns.length > 0 && (
                <section className="space-y-4">
                  <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Scheduled ({scheduledCampaigns.length})
                  </h2>
                  <div className="space-y-3">
                    {scheduledCampaigns.map((campaign) => (
                      <CampaignCard key={campaign.id} campaign={campaign} />
                    ))}
                  </div>
                </section>
              )}

              {/* Draft Campaigns */}
              {draftCampaigns.length > 0 && (
                <section className="space-y-4">
                  <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Drafts ({draftCampaigns.length})
                  </h2>
                  <div className="space-y-3">
                    {draftCampaigns.map((campaign) => (
                      <CampaignCard key={campaign.id} campaign={campaign} />
                    ))}
                  </div>
                </section>
              )}

              {/* Sent Campaigns */}
              {sentCampaigns.length > 0 && (
                <section className="space-y-4">
                  <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Sent ({sentCampaigns.length})
                  </h2>
                  <div className="space-y-3">
                    {sentCampaigns.map((campaign) => (
                      <CampaignCard key={campaign.id} campaign={campaign} />
                    ))}
                  </div>
                </section>
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
  const clickRate = campaign.openedCount > 0
    ? ((campaign.clickedCount / campaign.openedCount) * 100).toFixed(1)
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
            </div>
          </div>
        </div>

        {/* Stats for sent campaigns */}
        {campaign.status === "sent" && (
          <div className="flex gap-6 items-center">
            <div className="text-right">
              <p className="text-lg font-semibold">{openRate}%</p>
              <p className="text-xs text-muted-foreground">Open Rate</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">{clickRate}%</p>
              <p className="text-xs text-muted-foreground">Click Rate</p>
            </div>
            <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </div>
    </Link>
  )
}
