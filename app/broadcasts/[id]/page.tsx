"use client"

import { use } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowLeft,
  Boxes,
  MousePointerClick,
  UserMinus,
} from "lucide-react"
import {
  extractLinksFromText,
  findDomainByEmail,
  findSenderByEmail,
  formatProviderLabel,
  getBroadcastClickRate,
  getBroadcastDeliverability,
} from "@/lib/email-ops"
import { useBroadcast, useEmailDomains, useSenderIdentities } from "@/lib/hooks"
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
import type { Campaign } from "@/lib/types"

function statusClass(status: Campaign["status"]) {
  switch (status) {
    case "sent":
      return "border-emerald-200 bg-emerald-50 text-emerald-700"
    case "scheduled":
      return "border-sky-200 bg-sky-50 text-sky-700"
    case "paused":
      return "border-zinc-200 bg-zinc-100 text-zinc-700"
    default:
      return "border-border bg-muted text-muted-foreground"
  }
}

export default function BroadcastDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { campaign: broadcast, isLoading } = useBroadcast(id)
  const { senderIdentities } = useSenderIdentities()
  const { domains } = useEmailDomains()

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
            <div className="grid gap-4 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-52 rounded-3xl" />
              ))}
            </div>
          </div>
        </main>
      </>
    )
  }

  if (!broadcast) {
    return (
      <>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
        </header>
        <main className="flex flex-1 items-center justify-center text-muted-foreground">
          Broadcast not found
        </main>
      </>
    )
  }

  const sender =
    senderIdentities.find((item) => item.id === broadcast.senderIdentityId) ??
    findSenderByEmail(senderIdentities, broadcast.fromEmail)
  const domain = findDomainByEmail(domains, broadcast.fromEmail)
  const deliverability = getBroadcastDeliverability(broadcast)
  const engagement = getBroadcastClickRate(broadcast)
  const optOutRate =
    broadcast.deliveredCount === 0
      ? 0
      : Number(((broadcast.unsubscribedCount / broadcast.deliveredCount) * 100).toFixed(1))
  const links = extractLinksFromText(broadcast.textContent)

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/broadcasts">Broadcasts</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{broadcast.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex-1 overflow-auto bg-[linear-gradient(180deg,rgba(15,23,42,0.04),transparent_14rem)] px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
            <Link href="/broadcasts">
              <ArrowLeft className="size-4" />
              Back to broadcasts
            </Link>
          </Button>

          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="flex size-16 items-center justify-center rounded-3xl border bg-muted/30">
                <Boxes className="size-7 text-foreground" />
              </div>
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                  Broadcast
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-semibold tracking-tight">{broadcast.name}</h1>
                  <Badge variant="outline" className={statusClass(broadcast.status)}>
                    {broadcast.status}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>{broadcast.subject}</p>
                  <p>
                    {sender?.fromName || broadcast.fromName} {"<"}{broadcast.fromEmail}{">"} ·{" "}
                    {formatProviderLabel(broadcast.provider)}
                  </p>
                  <p>{broadcast.segmentNames.join(", ") || "No segment linked"}</p>
                  {broadcast.marketingCampaignId && (
                    <p>
                      Parent campaign:{" "}
                      <Link
                        href={`/campaigns/${broadcast.marketingCampaignId}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {broadcast.marketingCampaignName}
                      </Link>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {domain?.tracking !== "enabled" && (
            <Card className="border-amber-200 bg-amber-50 shadow-sm">
              <CardContent className="flex items-center gap-4 px-6 py-5 text-amber-900">
                <AlertTriangle className="size-5" />
                <p className="text-sm">
                  Tracking is not fully enabled on{" "}
                  <span className="font-semibold">{domain?.name || broadcast.fromEmail.split("@")[1]}</span>, so some metrics may still be partial.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="border-border/70 bg-card/90 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Deliverability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-4xl font-semibold">{deliverability}%</p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Delivered</span>
                    <span>
                      {broadcast.deliveredCount} · {deliverability}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Bounced</span>
                    <span>
                      {broadcast.bouncedCount} ·{" "}
                      {broadcast.sentCount === 0
                        ? 0
                        : Math.round((broadcast.bouncedCount / broadcast.sentCount) * 100)}
                      %
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Sent</span>
                    <span>{broadcast.sentCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/90 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Engagement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-4xl font-semibold">{engagement}%</p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-muted-foreground">
                      <MousePointerClick className="size-4" />
                      Clicked
                    </span>
                    <span>
                      {broadcast.clickedCount} · {engagement}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Opened</span>
                    <span>{broadcast.openedCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Replied</span>
                    <span>{broadcast.repliedCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/90 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Opt-out</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-4xl font-semibold">{optOutRate}%</p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-muted-foreground">
                      <UserMinus className="size-4" />
                      Unsubscribed
                    </span>
                    <span>{broadcast.unsubscribedCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Complained</span>
                    <span>0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <Card className="border-border/70 bg-card/90 shadow-sm">
              <CardHeader>
                <CardTitle>Broadcast setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="rounded-2xl border bg-muted/20 p-4">
                  <p className="text-muted-foreground">Audience slice</p>
                  <p className="mt-2 font-medium">{broadcast.segmentNames.join(", ") || "No segment"}</p>
                </div>
                <div className="rounded-2xl border bg-muted/20 p-4">
                  <p className="text-muted-foreground">Sender identity</p>
                  <p className="mt-2 font-medium">
                    {sender?.fromName || broadcast.fromName} {"<"}{broadcast.fromEmail}{">"}
                  </p>
                  <p className="mt-2 text-muted-foreground">
                    Reply-To: {broadcast.replyTo}
                  </p>
                </div>
                {broadcast.notes && (
                  <div className="rounded-2xl border bg-muted/20 p-4">
                    <p className="text-muted-foreground">Notes</p>
                    <p className="mt-2 whitespace-pre-wrap">{broadcast.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/90 shadow-sm">
              <CardHeader>
                <CardTitle>Tracked links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {links.length > 0 ? (
                  links.map((link) => (
                    <div key={link} className="rounded-2xl border bg-muted/20 p-4">
                      <p className="break-all font-medium text-foreground">{link}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No links found inside this plain-text body.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}
