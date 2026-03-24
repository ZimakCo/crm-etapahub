"use client"

import { use } from "react"
import Link from "next/link"
import { ArrowLeft, FolderKanban } from "lucide-react"
import { useBroadcasts, useMarketingCampaign } from "@/lib/hooks"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
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

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { campaign, isLoading } = useMarketingCampaign(id)
  const { campaigns: broadcasts } = useBroadcasts()

  if (isLoading) {
    return (
      <>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Skeleton className="h-4 w-48" />
        </header>
        <main className="flex-1 overflow-auto px-6 py-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <Skeleton className="h-32 rounded-3xl" />
            <div className="grid gap-4 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-32 rounded-3xl" />
              ))}
            </div>
          </div>
        </main>
      </>
    )
  }

  if (!campaign) {
    return (
      <>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
        </header>
        <main className="flex flex-1 items-center justify-center text-muted-foreground">
          Campaign not found
        </main>
      </>
    )
  }

  const relatedBroadcasts = broadcasts.filter((broadcast) => broadcast.marketingCampaignId === campaign.id)

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/campaigns">Campaigns</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{campaign.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex-1 overflow-auto bg-[linear-gradient(180deg,rgba(15,23,42,0.04),transparent_14rem)] px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
            <Link href="/campaigns">
              <ArrowLeft className="size-4" />
              Back to campaigns
            </Link>
          </Button>

          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="flex size-16 items-center justify-center rounded-3xl border bg-muted/30">
                <FolderKanban className="size-7 text-foreground" />
              </div>
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                  Parent campaign
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-semibold tracking-tight">{campaign.name}</h1>
                  <Badge variant="outline" className={statusClass(campaign.status)}>
                    {campaign.status}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>{campaign.objective}</p>
                  <p>
                    {campaign.ownerName || "Unassigned"} · {campaign.templateName || "No default template"}
                  </p>
                  {campaign.eventName && <p>Linked event: {campaign.eventName}</p>}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link
                  href={`/broadcasts/new?marketingCampaignId=${campaign.id}${campaign.templateId ? `&templateId=${campaign.templateId}` : ""}`}
                >
                  New broadcast
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-4">
            <Card className="border-border/70 bg-card/90 shadow-sm">
              <CardContent className="pt-6">
                <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Broadcasts</p>
                <p className="mt-2 text-4xl font-semibold">{relatedBroadcasts.length}</p>
              </CardContent>
            </Card>
            <Card className="border-border/70 bg-card/90 shadow-sm">
              <CardContent className="pt-6">
                <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Sent</p>
                <p className="mt-2 text-4xl font-semibold">{campaign.sentCount}</p>
              </CardContent>
            </Card>
            <Card className="border-border/70 bg-card/90 shadow-sm">
              <CardContent className="pt-6">
                <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Delivered</p>
                <p className="mt-2 text-4xl font-semibold">{campaign.deliveredCount}</p>
              </CardContent>
            </Card>
            <Card className="border-border/70 bg-card/90 shadow-sm">
              <CardContent className="pt-6">
                <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Replies</p>
                <p className="mt-2 text-4xl font-semibold">{campaign.repliedCount}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="border-border/70 bg-card/90 shadow-sm">
              <CardHeader>
                <CardTitle>Campaign brief</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="rounded-2xl border bg-muted/20 p-4">
                  <p className="text-muted-foreground">Objective</p>
                  <p className="mt-2 whitespace-pre-wrap">{campaign.objective}</p>
                </div>
                {campaign.notes && (
                  <div className="rounded-2xl border bg-muted/20 p-4">
                    <p className="text-muted-foreground">Notes</p>
                    <p className="mt-2 whitespace-pre-wrap">{campaign.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/90 shadow-sm">
              <CardHeader>
                <CardTitle>Defaults</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="rounded-2xl border bg-muted/20 p-4">
                  <p className="text-muted-foreground">Owner</p>
                  <p className="mt-2 font-medium">{campaign.ownerName || "Unassigned"}</p>
                </div>
                <div className="rounded-2xl border bg-muted/20 p-4">
                  <p className="text-muted-foreground">Template</p>
                  <p className="mt-2 font-medium">{campaign.templateName || "No default template"}</p>
                </div>
                <div className="rounded-2xl border bg-muted/20 p-4">
                  <p className="text-muted-foreground">Event</p>
                  <p className="mt-2 font-medium">{campaign.eventName || "No linked event"}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/70 bg-card/90 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle>Child broadcasts</CardTitle>
              <Button variant="outline" asChild>
                <Link
                  href={`/broadcasts/new?marketingCampaignId=${campaign.id}${campaign.templateId ? `&templateId=${campaign.templateId}` : ""}`}
                >
                  Create broadcast
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Broadcast</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Audience</TableHead>
                    <TableHead>Sender</TableHead>
                    <TableHead className="text-right">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {relatedBroadcasts.map((broadcast) => (
                    <TableRow key={broadcast.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <Link href={`/broadcasts/${broadcast.id}`} className="font-medium hover:underline">
                            {broadcast.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">{broadcast.subject}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-border bg-muted text-muted-foreground">
                          {broadcast.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {broadcast.segmentNames.join(", ") || "No audience"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{broadcast.fromEmail}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {new Date(broadcast.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                  {relatedBroadcasts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <div className="py-8 text-center text-sm text-muted-foreground">
                          No broadcasts yet for this campaign.
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
