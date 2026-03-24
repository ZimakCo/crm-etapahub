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
  formatProviderLabel,
  getBroadcastClickRate,
  getBroadcastDeliverability,
  getDomainByEmail,
  getSenderByEmail,
} from "@/lib/email-ops"
import { useCampaign } from "@/lib/hooks"
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
      return "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
    case "scheduled":
      return "border-sky-400/20 bg-sky-500/10 text-sky-200"
    default:
      return "border-white/10 bg-white/[0.03] text-white/70"
  }
}

export default function BroadcastDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { campaign, isLoading } = useCampaign(id)

  if (isLoading) {
    return (
      <>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4 bg-white/10" />
          <Skeleton className="h-4 w-48" />
        </header>
        <main className="flex-1 overflow-auto bg-[#050505] px-6 py-10">
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

  if (!campaign) {
    return (
      <>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-4">
          <SidebarTrigger className="-ml-1" />
        </header>
        <main className="flex flex-1 items-center justify-center bg-[#050505] text-white">
          Broadcast not found
        </main>
      </>
    )
  }

  const sender = getSenderByEmail(campaign.fromEmail)
  const domain = getDomainByEmail(campaign.fromEmail)
  const deliverability = getBroadcastDeliverability(campaign)
  const engagement = getBroadcastClickRate(campaign)
  const optOutRate =
    campaign.deliveredCount === 0
      ? 0
      : Number(((campaign.unsubscribedCount / campaign.deliveredCount) * 100).toFixed(1))
  const links = extractLinksFromText(campaign.textContent)

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-white/10" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/campaigns">Broadcasts</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{campaign.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex-1 overflow-auto bg-[#050505] px-6 py-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8">
          <Button variant="ghost" size="sm" className="-ml-2 w-fit text-white/60 hover:bg-white/[0.03] hover:text-white" asChild>
            <Link href="/campaigns">
              <ArrowLeft className="size-4" />
              Back to Broadcasts
            </Link>
          </Button>

          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-start gap-6">
              <div className="flex size-28 items-center justify-center rounded-[32px] border border-emerald-400/20 bg-emerald-500/10">
                <Boxes className="size-9 text-emerald-300" />
              </div>
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.2em] text-white/40">Broadcast</p>
                <div className="flex items-center gap-3">
                  <h1 className="text-5xl font-semibold tracking-tight">{campaign.name}</h1>
                  <Badge variant="outline" className={statusClass(campaign.status)}>
                    {campaign.status}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-white/55">
                  <p>{campaign.subject}</p>
                  <p>
                    {sender?.fromName || campaign.fromName} {"<"}{campaign.fromEmail}{">"} ·{" "}
                    {formatProviderLabel(campaign.provider)}
                  </p>
                  <p>{campaign.segmentNames.join(", ") || "No segment linked"}</p>
                </div>
              </div>
            </div>
          </div>

          {domain?.tracking !== "enabled" && (
            <Card className="border-white/10 bg-[#111214] text-white shadow-none">
              <CardContent className="flex items-center gap-4 px-6 py-5">
                <AlertTriangle className="size-5 text-white/55" />
                <p className="text-lg text-white/75">
                  Tracking is not fully enabled on the <span className="font-semibold text-white">{domain?.name || campaign.fromEmail.split("@")[1]}</span> domain, so open metrics may be incomplete.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="border-white/10 bg-[#09090a] text-white shadow-none">
              <CardHeader>
                <CardTitle className="text-lg">Deliverability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-6xl font-semibold">{deliverability}%</p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-white/55">Delivered</span>
                    <span>{campaign.deliveredCount} · {deliverability}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/55">Bounced</span>
                    <span>{campaign.bouncedCount} · {campaign.sentCount === 0 ? 0 : Math.round((campaign.bouncedCount / campaign.sentCount) * 100)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/55">Suppressed</span>
                    <span>0 · 0%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-[#09090a] text-white shadow-none">
              <CardHeader>
                <CardTitle className="text-lg">Engagement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-6xl font-semibold">{engagement}%</p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-white/55">Clicked</span>
                    <span>{campaign.clickedCount} · {engagement}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/55">Opened</span>
                    <span>{campaign.openedCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/55">Replied</span>
                    <span>{campaign.repliedCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-[#09090a] text-white shadow-none">
              <CardHeader>
                <CardTitle className="text-lg">Opt-out</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-6xl font-semibold">{optOutRate}%</p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-white/55">
                      <UserMinus className="size-4" />
                      Unsubscribed
                    </span>
                    <span>{campaign.unsubscribedCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/55">Complained</span>
                    <span>0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <Card className="border-white/10 bg-[#09090a] text-white shadow-none">
              <CardHeader>
                <CardTitle>User Interactions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-white/55">Audience slice</p>
                  <p className="mt-2 text-lg font-medium text-white">
                    {campaign.segmentNames.join(", ") || "No linked segment"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-white/55">Sender identity</p>
                  <p className="mt-2 text-lg font-medium text-white">
                    {sender?.fromName || campaign.fromName}
                  </p>
                  <p className="text-white/45">{campaign.fromEmail}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-white/55">Reply mailbox</p>
                  <p className="mt-2 text-lg font-medium text-white">{campaign.replyTo}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-[#09090a] text-white shadow-none">
              <CardHeader>
                <CardTitle className="inline-flex items-center gap-2">
                  <MousePointerClick className="size-4" />
                  Top Clicked Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {links.length === 0 ? (
                  <p className="text-white/45">No tracked links found inside this broadcast body.</p>
                ) : (
                  links.map((link, index) => (
                    <div key={link} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="font-medium text-white">Link {index + 1}</p>
                      <a href={link} target="_blank" rel="noopener noreferrer" className="mt-2 block break-all text-white/60 hover:text-white">
                        {link}
                      </a>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}
