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

export function CampaignPerformance({ campaigns }: CampaignPerformanceProps) {
  const recentCampaigns = campaigns
    .filter(c => c.status === "sent")
    .slice(0, 4)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Campaign Performance</CardTitle>
          <CardDescription>Recent email campaign metrics</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/campaigns">
            View All
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentCampaigns.map((campaign) => {
            const openRate = campaign.deliveredCount > 0 
              ? ((campaign.openedCount / campaign.deliveredCount) * 100).toFixed(1)
              : "0"
            const clickRate = campaign.openedCount > 0
              ? ((campaign.clickedCount / campaign.openedCount) * 100).toFixed(1)
              : "0"

            return (
              <Link
                key={campaign.id}
                href={`/campaigns/${campaign.id}`}
                className="block rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{campaign.name}</h4>
                      <Badge variant="outline" className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Sent {campaign.sentAt ? formatDate(campaign.sentAt) : "N/A"}
                    </p>
                  </div>
                  <div className="flex gap-6 text-right">
                    <div>
                      <p className="text-sm font-medium">{openRate}%</p>
                      <p className="text-xs text-muted-foreground">Open Rate</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{clickRate}%</p>
                      <p className="text-xs text-muted-foreground">Click Rate</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>Delivered</span>
                    <span>{campaign.deliveredCount.toLocaleString()} / {campaign.totalRecipients.toLocaleString()}</span>
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
              No campaigns sent yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
