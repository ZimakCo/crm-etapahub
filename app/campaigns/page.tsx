"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { FolderKanban, Plus, Search } from "lucide-react"
import { useBroadcasts, useMarketingCampaigns } from "@/lib/hooks"
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
import type { MarketingCampaign } from "@/lib/types"

function statusClass(status: MarketingCampaign["status"]) {
  switch (status) {
    case "active":
      return "border-emerald-200 bg-emerald-50 text-emerald-700"
    case "completed":
      return "border-sky-200 bg-sky-50 text-sky-700"
    case "archived":
      return "border-zinc-200 bg-zinc-100 text-zinc-700"
    default:
      return "border-amber-200 bg-amber-50 text-amber-700"
  }
}

function relativeDate(dateString: string) {
  const diffDays = Math.max(
    1,
    Math.round((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24))
  )
  return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`
}

export default function CampaignsPage() {
  const { campaigns, isLoading } = useMarketingCampaigns()
  const { campaigns: broadcasts } = useBroadcasts()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredCampaigns = useMemo(
    () =>
      campaigns.filter((campaign) => {
        const matchesSearch =
          !searchQuery ||
          [campaign.name, campaign.objective, campaign.ownerName, campaign.templateName, campaign.eventName]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === "all" || campaign.status === statusFilter
        return matchesSearch && matchesStatus
      }),
    [campaigns, searchQuery, statusFilter]
  )

  const activeCount = campaigns.filter((campaign) => campaign.status === "active").length
  const scheduledBroadcasts = broadcasts.filter((broadcast) => broadcast.status === "scheduled").length
  const sentBroadcasts = broadcasts.filter((broadcast) => broadcast.status === "sent").length

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Campaigns</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/broadcasts/new">New broadcast</Link>
          </Button>
          <Button asChild>
            <Link href="/campaigns/new">
              <Plus className="size-4" />
              New campaign
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-auto bg-[linear-gradient(180deg,rgba(15,23,42,0.04),transparent_14rem)] px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Campaigns</h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Campaigns are the parent initiatives. They hold the objective, owner, event and default template, while daily sends are tracked as child broadcasts.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-border/70 bg-card/90 shadow-sm">
              <CardContent className="pt-6">
                <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Active campaigns</p>
                <p className="mt-2 text-4xl font-semibold">{activeCount}</p>
              </CardContent>
            </Card>
            <Card className="border-border/70 bg-card/90 shadow-sm">
              <CardContent className="pt-6">
                <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Scheduled broadcasts</p>
                <p className="mt-2 text-4xl font-semibold">{scheduledBroadcasts}</p>
              </CardContent>
            </Card>
            <Card className="border-border/70 bg-card/90 shadow-sm">
              <CardContent className="pt-6">
                <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Sent broadcasts</p>
                <p className="mt-2 text-4xl font-semibold">{sentBroadcasts}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/70 bg-card/90 shadow-sm">
            <CardContent className="space-y-4 pt-6">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Search campaigns"
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
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Default template</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Broadcasts</TableHead>
                    <TableHead className="text-right">Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <Link href={`/campaigns/${campaign.id}`} className="font-medium hover:underline">
                            {campaign.name}
                          </Link>
                          <p className="line-clamp-2 text-xs text-muted-foreground">
                            {campaign.objective}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusClass(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {campaign.templateName || "No default template"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {campaign.ownerName || "Unassigned"}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <p className="font-medium">{campaign.broadcastCount}</p>
                          <p className="text-xs text-muted-foreground">
                            {campaign.sentCount} sent · {campaign.repliedCount} replies
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {relativeDate(campaign.updatedAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!isLoading && filteredCampaigns.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <div className="flex flex-col items-center gap-3 py-10 text-center">
                          <FolderKanban className="size-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            No parent campaigns match the current filters.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
