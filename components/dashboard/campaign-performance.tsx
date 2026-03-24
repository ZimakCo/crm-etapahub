"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Campaign } from "@/lib/types"

interface CampaignPerformanceProps {
  campaigns: Campaign[]
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function getStatusColor(status: Campaign["status"]) {
  switch (status) {
    case "sent":
      return "bg-success/10 text-success border-success/20"
    case "scheduled":
      return "bg-info/10 text-info border-info/20"
    case "draft":
      return "bg-muted text-muted-foreground border-border"
    case "sending":
      return "bg-warning/10 text-warning border-warning/20"
    default:
      return "bg-muted text-muted-foreground border-border"
  }
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

export function CampaignPerformance({ campaigns }: CampaignPerformanceProps) {
  const recentCampaigns = campaigns
    .filter(c => c.status === "sent")
    .slice(0, 4)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Broadcasts</CardTitle>
          <CardDescription>Latest send executions across providers, sender identities and seller-built segments</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/broadcasts">
            View All
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentCampaigns.map((campaign) => {
            const inboxRate = campaign.sentCount > 0
              ? ((campaign.deliveredCount / campaign.sentCount) * 100).toFixed(1)
              : "0"
            const clickRate = campaign.deliveredCount > 0
              ? ((campaign.clickedCount / campaign.deliveredCount) * 100).toFixed(1)
              : "0"

            return (
              <Link
                key={campaign.id}
                href={`/broadcasts/${campaign.id}`}
                className="block rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{campaign.name}</h4>
                      <Badge variant="outline" className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                      <Badge variant="secondary">{formatProvider(campaign.provider)}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Sent {campaign.sentAt ? formatDate(campaign.sentAt) : "N/A"} · {campaign.segmentNames.length} segment{campaign.segmentNames.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex gap-6 text-right">
                    <div>
                      <p className="text-sm font-medium">{inboxRate}%</p>
                      <p className="text-xs text-muted-foreground">Inbox Reach</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{clickRate}%</p>
                      <p className="text-xs text-muted-foreground">Click Rate</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{campaign.repliedCount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Replies</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>Delivered</span>
                    <span>{campaign.deliveredCount.toLocaleString()} / {campaign.totalRecipients.toLocaleString()} · {campaign.bouncedCount.toLocaleString()} bounced</span>
                  </div>
                  <Progress 
                    value={(campaign.deliveredCount / campaign.totalRecipients) * 100} 
                    className="h-1.5"
                  />
                </div>
              </Link>
            )
          })}
          {recentCampaigns.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No sent broadcasts yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
