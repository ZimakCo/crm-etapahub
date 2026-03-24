"use client"

import { useMemo, useState } from "react"
import { deliveryMetrics, emailDomains, formatProviderLabel } from "@/lib/email-ops"
import { useCampaigns } from "@/lib/hooks"
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

export default function MetricsPage() {
  const { campaigns } = useCampaigns()
  const [domainFilter, setDomainFilter] = useState("all")
  const [periodFilter, setPeriodFilter] = useState("last-15-days")

  const sentCampaigns = campaigns.filter((campaign) => campaign.status === "sent")
  const totalEmails = sentCampaigns.reduce((sum, campaign) => sum + campaign.sentCount, 0)
  const totalDelivered = sentCampaigns.reduce((sum, campaign) => sum + campaign.deliveredCount, 0)
  const totalBounced = sentCampaigns.reduce((sum, campaign) => sum + campaign.bouncedCount, 0)
  const totalComplained = 0
  const deliverability = totalEmails === 0 ? 0 : Number(((totalDelivered / totalEmails) * 100).toFixed(2))
  const bounceRate = totalEmails === 0 ? 0 : Number(((totalBounced / totalEmails) * 100).toFixed(2))
  const complaintRate = totalEmails === 0 ? 0 : Number(((totalComplained / totalEmails) * 100).toFixed(2))

  const maxMetricValue = Math.max(...deliveryMetrics.flatMap((point) => [point.delivered, point.clicked, point.bounced]), 1)
  const deliveredLine = buildLine(deliveryMetrics.map((point) => point.delivered), maxMetricValue, 360, 980)
  const clickedLine = buildLine(deliveryMetrics.map((point) => point.clicked), maxMetricValue, 360, 980)
  const bouncedLine = buildLine(deliveryMetrics.map((point) => point.bounced), maxMetricValue, 360, 980)

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
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-white/10" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Metrics</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex-1 overflow-auto bg-[#050505] px-6 py-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-5xl font-semibold tracking-tight">Metrics</h1>
              <p className="max-w-3xl text-sm text-white/55">
                Deliverability and engagement across active sending domains and broadcast windows.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={domainFilter} onValueChange={setDomainFilter}>
                <SelectTrigger className="h-12 min-w-[220px] rounded-2xl border-white/10 bg-[#1a1b1f] text-white">
                  <SelectValue placeholder="All Domains" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Domains</SelectItem>
                  {emailDomains.map((domain) => (
                    <SelectItem key={domain.id} value={domain.id}>
                      {domain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="h-12 min-w-[190px] rounded-2xl border-white/10 bg-[#1a1b1f] text-white">
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

          <Card className="border-white/10 bg-[#09090a] text-white shadow-none">
            <CardContent className="space-y-8 px-8 py-8">
              <div className="grid gap-6 md:grid-cols-[160px_220px_1fr]">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-white/45">Emails</p>
                  <p className="mt-2 text-6xl font-semibold">{totalEmails}</p>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-white/45">Deliverability rate</p>
                  <p className="mt-2 text-6xl font-semibold">{deliverability}%</p>
                </div>
                <div className="justify-self-end">
                  <Select defaultValue="all-events">
                    <SelectTrigger className="h-12 min-w-[200px] rounded-2xl border-white/10 bg-[#1a1b1f] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-events">All Events</SelectItem>
                      <SelectItem value="conference">Conference audiences</SelectItem>
                      <SelectItem value="follow-up">Follow-up broadcasts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="overflow-hidden rounded-[32px] border border-white/10 bg-black/60 p-6">
                <div className="relative h-[420px]">
                  <svg viewBox="0 0 980 360" className="h-full w-full">
                    {Array.from({ length: 4 }).map((_, index) => {
                      const y = ((index + 1) / 4) * 360
                      return (
                        <line
                          key={index}
                          x1="0"
                          y1={y}
                          x2="980"
                          y2={y}
                          stroke="rgba(255,255,255,0.08)"
                          strokeDasharray="4 8"
                        />
                      )
                    })}
                    <polyline
                      fill="rgba(52, 211, 153, 0.14)"
                      stroke="rgba(52, 211, 153, 0)"
                      points={`0,360 ${deliveredLine} 980,360`}
                    />
                    <polyline
                      fill="none"
                      stroke="#34d399"
                      strokeWidth="3"
                      points={deliveredLine}
                    />
                    <polyline
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="3"
                      points={clickedLine}
                    />
                    <polyline
                      fill="none"
                      stroke="#f87171"
                      strokeWidth="3"
                      points={bouncedLine}
                    />
                  </svg>
                  <div className="mt-4 grid grid-cols-[repeat(15,minmax(0,1fr))] gap-2 text-sm text-white/45">
                    {deliveryMetrics.map((point) => (
                      <span key={point.date}>{point.date}</span>
                    ))}
                  </div>
                  <div className="mt-10 flex flex-wrap items-center justify-between gap-4 text-sm text-white/55">
                    <span>
                      {emailDomains[0].name} ({totalEmails})
                    </span>
                    <div className="flex flex-wrap gap-4">
                      <span className="inline-flex items-center gap-2">
                        <span className="size-2 rounded-full bg-emerald-400" />
                        {deliverability}%
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <span className="size-2 rounded-full bg-violet-400" />
                        {totalDelivered === 0 ? 0 : Math.round((sentCampaigns.reduce((sum, campaign) => sum + campaign.clickedCount, 0) / totalDelivered) * 100)}%
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <span className="size-2 rounded-full bg-rose-400" />
                        {bounceRate}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="border-white/10 bg-[#09090a] text-white shadow-none">
              <CardHeader>
                <CardTitle className="text-lg">Bounce rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-6xl font-semibold">{bounceRate}%</p>
                <p className="mt-3 text-sm text-white/55">
                  Based on the selected period and current broadcast history.
                </p>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-[#09090a] text-white shadow-none">
              <CardHeader>
                <CardTitle className="text-lg">Complain rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-6xl font-semibold">{complaintRate}%</p>
                <p className="mt-3 text-sm text-white/55">
                  Complaints received from provider feedback loops and webhook events.
                </p>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-[#09090a] text-white shadow-none">
              <CardHeader>
                <CardTitle className="text-lg">Provider mix</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(providerSummary).map(([provider, volume]) => (
                  <div key={provider} className="flex items-center justify-between text-sm">
                    <span className="text-white/65">{provider}</span>
                    <span className="font-medium text-white">{volume}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}
