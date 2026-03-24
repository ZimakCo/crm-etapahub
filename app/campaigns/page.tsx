"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Plus, Search } from "lucide-react"
import { useCampaigns, useSegments } from "@/lib/hooks"
import { formatProviderLabel, getSenderByEmail } from "@/lib/email-ops"
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
      return "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
    case "scheduled":
      return "border-sky-400/20 bg-sky-500/10 text-sky-200"
    case "sending":
      return "border-amber-400/20 bg-amber-500/10 text-amber-200"
    default:
      return "border-white/10 bg-white/[0.03] text-white/70"
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
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-white/10" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Broadcasts</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <Button className="rounded-xl bg-white text-black hover:bg-white/90" asChild>
            <Link href="/campaigns/new">
              <Plus className="size-4" />
              Create email
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-auto bg-[#050505] px-6 py-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8">
          <div className="space-y-2">
            <h1 className="text-5xl font-semibold tracking-tight">Broadcasts</h1>
            <p className="max-w-3xl text-sm text-white/55">
              Create a broadcast from a saved template, pick the seller-built segment, then choose which sender identity and provider lane should deliver it.
            </p>
          </div>

          <Card className="border-white/10 bg-[#111214] text-white shadow-none">
            <CardContent className="space-y-4 pt-6">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px_320px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/35" />
                  <Input
                    className="h-12 rounded-2xl border-white/10 bg-[#1a1b1f] pl-11 text-white placeholder:text-white/35"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-12 w-full rounded-2xl border-white/10 bg-[#1a1b1f] text-white">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="sending">Sending</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={audienceFilter} onValueChange={setAudienceFilter}>
                  <SelectTrigger className="h-12 w-full rounded-2xl border-white/10 bg-[#1a1b1f] text-white">
                    <SelectValue placeholder="All Audiences" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Audiences</SelectItem>
                    {segments.map((segment) => (
                      <SelectItem key={segment.id} value={segment.id}>
                        {segment.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader className="border-white/10">
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-white/55">Name</TableHead>
                    <TableHead className="text-white/55">Status</TableHead>
                    <TableHead className="text-white/55">Audience</TableHead>
                    <TableHead className="text-white/55">From</TableHead>
                    <TableHead className="text-right text-white/55">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampaigns.map((campaign) => {
                    const sender = getSenderByEmail(campaign.fromEmail)

                    return (
                      <TableRow key={campaign.id} className="border-white/10 hover:bg-white/[0.03]">
                        <TableCell>
                          <div className="space-y-1">
                            <Link href={`/campaigns/${campaign.id}`} className="font-medium hover:underline">
                              {campaign.name}
                            </Link>
                            <p className="text-xs text-white/40">
                              {campaign.templateName || "No template linked"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusClass(campaign.status)}>
                            {campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white/75">
                          {campaign.segmentNames.join(", ") || "No audience"}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm text-white">
                              {sender?.fromName || campaign.fromName} {"<"}{campaign.fromEmail}{">"}
                            </p>
                            <p className="text-xs text-white/40">
                              {sender ? `${formatProviderLabel(sender.provider)} · ${sender.volumeBand}` : formatProviderLabel(campaign.provider)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-white/55">
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
