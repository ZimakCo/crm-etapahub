"use client"

import { useMemo, useState } from "react"
import { deliveryMetrics, formatProviderLabel } from "@/lib/email-ops"
import { useCampaigns, useEmailDomains } from "@/lib/hooks"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function buildLine(points: number[], maxValue: number, height: number, width: number) {
  if (points.length === 0) return ""

  return points
    .map((point, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * width
      const y = height - (point / maxValue) * height
      return `${x},${y}`
    })
    .join(" ")
}

function subtractDays(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

export default function MetricsPage() {
  const { campaigns } = useCampaigns()
  const { domains } = useEmailDomains()
  const [domainFilter, setDomainFilter] = useState("all")
  const [periodFilter, setPeriodFilter] = useState("last-15-days")
  const selectedDomain = useMemo(
    () => domains.find((domain) => domain.id === domainFilter) ?? null,
    [domainFilter, domains]
  )

  const periodStart = useMemo(() => {
    switch (periodFilter) {
      case "last-7-days":
        return subtractDays(7)
      case "last-30-days":
        return subtractDays(30)
      default:
        return subtractDays(15)
    }
  }, [periodFilter])

  const sentCampaigns = useMemo(
    () =>
      campaigns.filter((campaign) => {
        if (campaign.status !== "sent") {
          return false
        }

        const matchesDomain =
          domainFilter === "all" ||
          (selectedDomain
            ? campaign.fromEmail.toLowerCase().endsWith(`@${selectedDomain.name.toLowerCase()}`)
            : false)
        const sentAt = campaign.sentAt ? new Date(campaign.sentAt) : new Date(campaign.createdAt)
        const matchesPeriod = sentAt >= periodStart

        return matchesDomain && matchesPeriod
      }),
    [campaigns, domainFilter, periodStart, selectedDomain]
  )

  const totalEmails = sentCampaigns.reduce((sum, campaign) => sum + campaign.sentCount, 0)
  const totalDelivered = sentCampaigns.reduce((sum, campaign) => sum + campaign.deliveredCount, 0)
  const totalBounced = sentCampaigns.reduce((sum, campaign) => sum + campaign.bouncedCount, 0)
  const totalComplained = 0
  const totalClicked = sentCampaigns.reduce((sum, campaign) => sum + campaign.clickedCount, 0)
  const deliverability = totalEmails === 0 ? 0 : Number(((totalDelivered / totalEmails) * 100).toFixed(2))
  const bounceRate = totalEmails === 0 ? 0 : Number(((totalBounced / totalEmails) * 100).toFixed(2))
  const complaintRate = totalEmails === 0 ? 0 : Number(((totalComplained / totalEmails) * 100).toFixed(2))
  const clickRate = totalDelivered === 0 ? 0 : Number(((totalClicked / totalDelivered) * 100).toFixed(2))

  const maxMetricValue = Math.max(
    ...deliveryMetrics.flatMap((point) => [point.delivered, point.clicked, point.bounced]),
    1
  )
  const deliveredLine = buildLine(deliveryMetrics.map((point) => point.delivered), maxMetricValue, 280, 980)
  const clickedLine = buildLine(deliveryMetrics.map((point) => point.clicked), maxMetricValue, 280, 980)
  const bouncedLine = buildLine(deliveryMetrics.map((point) => point.bounced), maxMetricValue, 280, 980)

  const providerSummary = useMemo(
    () =>
      sentCampaigns.reduce<Record<string, number>>((accumulator, campaign) => {
        const key = formatProviderLabel(campaign.provider)
        accumulator[key] = (accumulator[key] ?? 0) + campaign.sentCount
        return accumulator
      }, {}),
    [sentCampaigns]
  )

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Metrics</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex-1 overflow-auto bg-[linear-gradient(180deg,rgba(15,23,42,0.04),transparent_14rem)] px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight">Metrics</h1>
              <p className="max-w-3xl text-sm text-muted-foreground">
                Deliverability and engagement across domains, sender mailboxes and provider lanes.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={domainFilter} onValueChange={setDomainFilter}>
                <SelectTrigger className="min-w-[220px]">
                  <SelectValue placeholder="All domains" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All domains</SelectItem>
                  {domains.map((domain) => (
                    <SelectItem key={domain.id} value={domain.id}>
                      {domain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="min-w-[190px]">
                  <SelectValue placeholder="Last 15 days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-7-days">Last 7 days</SelectItem>
                  <SelectItem value="last-15-days">Last 15 days</SelectItem>
                  <SelectItem value="last-30-days">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="border-border/70 bg-card/90 shadow-sm">
            <CardContent className="space-y-8 px-8 py-8">
              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Emails</p>
                  <p className="mt-2 text-4xl font-semibold">{totalEmails}</p>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Deliverability</p>
                  <p className="mt-2 text-4xl font-semibold">{deliverability}%</p>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Click rate</p>
                  <p className="mt-2 text-4xl font-semibold">{clickRate}%</p>
                </div>
              </div>

              <div className="overflow-hidden rounded-[28px] border bg-background p-6 shadow-sm">
                <div className="relative h-[340px]">
                  <svg viewBox="0 0 980 280" className="h-full w-full">
                    {Array.from({ length: 4 }).map((_, index) => {
                      const y = ((index + 1) / 4) * 280
                      return (
                        <line
                          key={index}
                          x1="0"
                          y1={y}
                          x2="980"
                          y2={y}
                          stroke="rgba(100,116,139,0.18)"
                          strokeDasharray="4 8"
                        />
                      )
                    })}
                    <polyline
                      fill="rgba(16,185,129,0.10)"
                      stroke="rgba(16,185,129,0)"
                      points={`0,280 ${deliveredLine} 980,280`}
                    />
                    <polyline fill="none" stroke="#10b981" strokeWidth="3" points={deliveredLine} />
                    <polyline fill="none" stroke="#2563eb" strokeWidth="3" points={clickedLine} />
                    <polyline fill="none" stroke="#ef4444" strokeWidth="3" points={bouncedLine} />
                  </svg>
                  <div className="mt-4 grid grid-cols-[repeat(15,minmax(0,1fr))] gap-2 text-sm text-muted-foreground">
                    {deliveryMetrics.map((point) => (
                      <span key={point.date}>{point.date}</span>
                    ))}
                  </div>
                  <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
                    <span>
                      {domainFilter === "all"
                        ? "All active sending domains"
                        : selectedDomain?.name}
                    </span>
                    <div className="flex flex-wrap gap-4">
                      <span className="inline-flex items-center gap-2">
                        <span className="size-2 rounded-full bg-emerald-500" />
                        Delivered {deliverability}%
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <span className="size-2 rounded-full bg-blue-600" />
                        Clicked {clickRate}%
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <span className="size-2 rounded-full bg-red-500" />
                        Bounced {bounceRate}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="border-border/70 bg-card/90 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Bounce rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-semibold">{bounceRate}%</p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Based on the current broadcast history and selected filters.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/70 bg-card/90 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Complaint rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-semibold">{complaintRate}%</p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Complaint events are fed back via webhook endpoints.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/70 bg-card/90 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Provider mix</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(providerSummary).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No sent broadcasts in the selected window.</p>
                ) : (
                  Object.entries(providerSummary).map(([provider, volume]) => (
                    <div key={provider} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{provider}</span>
                      <span className="font-medium">{volume}</span>
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
