"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Plus, Search } from "lucide-react"
import { findSenderByEmail, formatProviderLabel } from "@/lib/email-ops"
import { useCampaigns, useSegments, useSenderIdentities } from "@/lib/hooks"
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
  const { campaigns } = useCampaigns()
  const { segments } = useSegments()
  const { senderIdentities } = useSenderIdentities()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [audienceFilter, setAudienceFilter] = useState("all")

  const filteredCampaigns = useMemo(
    () =>
      campaigns.filter((campaign) => {
        const matchesSearch =
          !searchQuery ||
          [campaign.name, campaign.subject, campaign.templateName, campaign.fromEmail]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === "all" || campaign.status === statusFilter
        const matchesAudience =
          audienceFilter === "all" || campaign.segmentIds.includes(audienceFilter)

        return matchesSearch && matchesStatus && matchesAudience
      }),
    [audienceFilter, campaigns, searchQuery, statusFilter]
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
            <Link href="/campaigns/new">
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
              Each broadcast links one template, one seller-built segment and one sender identity. The provider lane is defined by the sender mailbox and its verified domain.
            </p>
          </div>

          <Card className="border-border/70 bg-card/90 shadow-sm">
            <CardContent className="space-y-4 pt-6">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px_260px]">
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
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Audience</TableHead>
                    <TableHead>Sender</TableHead>
                    <TableHead className="text-right">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampaigns.map((campaign) => {
                    const sender =
                      senderIdentities.find((item) => item.id === campaign.senderIdentityId) ??
                      findSenderByEmail(senderIdentities, campaign.fromEmail)

                    return (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <Link href={`/campaigns/${campaign.id}`} className="font-medium hover:underline">
                              {campaign.name}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              {campaign.templateName || "No template linked"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusClass(campaign.status)}>
                            {campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {campaign.segmentNames.join(", ") || "No audience"}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm">
                              {sender?.fromName || campaign.fromName} {"<"}{campaign.fromEmail}{">"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {sender
                                ? `${formatProviderLabel(sender.provider)} · ${sender.volumeBand}`
                                : formatProviderLabel(campaign.provider)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {relativeDate(campaign.createdAt)}
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
