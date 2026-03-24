"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Plus, Search } from "lucide-react"
import { findSenderByEmail, formatProviderLabel } from "@/lib/email-ops"
import { useBroadcasts, useMarketingCampaigns, useSegments, useSenderIdentities } from "@/lib/hooks"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Campaign } from "@/lib/types"

function statusClass(status: Campaign["status"]) {
  switch (status) {
    case "sent":
      return "border-emerald-200 bg-emerald-50 text-emerald-700"
    case "scheduled":
      return "border-sky-200 bg-sky-50 text-sky-700"
    case "sending":
      return "border-amber-200 bg-amber-50 text-amber-700"
    case "paused":
      return "border-zinc-200 bg-zinc-100 text-zinc-700"
    default:
      return "border-border bg-muted text-muted-foreground"
  }
}

function relativeDate(dateString: string) {
  const diffDays = Math.max(
    1,
    Math.round((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24))
  )
  return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`
}

export default function BroadcastsPage() {
  const { campaigns: broadcasts } = useBroadcasts()
  const { campaigns: marketingCampaigns } = useMarketingCampaigns()
  const { segments } = useSegments()
  const { senderIdentities } = useSenderIdentities()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [campaignFilter, setCampaignFilter] = useState("all")
  const [audienceFilter, setAudienceFilter] = useState("all")

  const filteredBroadcasts = useMemo(
    () =>
      broadcasts.filter((broadcast) => {
        const matchesSearch =
          !searchQuery ||
          [
            broadcast.name,
            broadcast.subject,
            broadcast.templateName,
            broadcast.fromEmail,
            broadcast.marketingCampaignName,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === "all" || broadcast.status === statusFilter
        const matchesCampaign =
          campaignFilter === "all" || broadcast.marketingCampaignId === campaignFilter
        const matchesAudience =
          audienceFilter === "all" || broadcast.segmentIds.includes(audienceFilter)

        return matchesSearch && matchesStatus && matchesCampaign && matchesAudience
      }),
    [audienceFilter, broadcasts, campaignFilter, searchQuery, statusFilter]
  )

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Broadcasts</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <Button asChild>
            <Link href="/broadcasts/new">
              <Plus className="size-4" />
              New broadcast
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-auto bg-[linear-gradient(180deg,rgba(15,23,42,0.04),transparent_14rem)] px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Broadcasts</h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Broadcasts are the actual sends: one parent campaign, one seller-built segment, one template snapshot and one sender identity.
            </p>
          </div>

          <Card className="border-border/70 bg-card/90 shadow-sm">
            <CardContent className="space-y-4 pt-6">
              <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_240px_260px_240px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Search broadcasts"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="sending">Sending</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={campaignFilter} onValueChange={setCampaignFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All campaigns" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All campaigns</SelectItem>
                    {marketingCampaigns.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={audienceFilter} onValueChange={setAudienceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All audiences" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All audiences</SelectItem>
                    {segments.map((segment) => (
                      <SelectItem key={segment.id} value={segment.id}>
                        {segment.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Broadcast</TableHead>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Audience</TableHead>
                    <TableHead>Sender</TableHead>
                    <TableHead className="text-right">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBroadcasts.map((broadcast) => {
                    const sender =
                      senderIdentities.find((item) => item.id === broadcast.senderIdentityId) ??
                      findSenderByEmail(senderIdentities, broadcast.fromEmail)

                    return (
                      <TableRow key={broadcast.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <Link href={`/broadcasts/${broadcast.id}`} className="font-medium hover:underline">
                              {broadcast.name}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              {broadcast.templateName || "No template linked"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {broadcast.marketingCampaignId ? (
                            <Link
                              href={`/campaigns/${broadcast.marketingCampaignId}`}
                              className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                            >
                              {broadcast.marketingCampaignName}
                            </Link>
                          ) : (
                            <span className="text-sm text-muted-foreground">No parent campaign</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusClass(broadcast.status)}>
                            {broadcast.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {broadcast.segmentNames.join(", ") || "No audience"}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm">
                              {sender?.fromName || broadcast.fromName} {"<"}{broadcast.fromEmail}{">"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {sender
                                ? `${formatProviderLabel(sender.provider)} · ${sender.volumeBand}`
                                : formatProviderLabel(broadcast.provider)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {relativeDate(broadcast.createdAt)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
