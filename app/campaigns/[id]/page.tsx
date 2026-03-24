"use client"

import { use } from "react"
import Link from "next/link"
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
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  ArrowLeft,
  Send,
  Mail,
  MousePointerClick,
  MessageSquare,
  AlertTriangle,
  UserMinus,
  Users,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  Copy,
  Trash2,
  Pause,
  Boxes,
  Reply,
  FileText,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Campaign } from "@/lib/types"

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function formatNumber(num: number) {
  return num.toLocaleString()
}

function getStatusBadge(status: Campaign["status"]) {
  const styles: Record<string, string> = {
    sent: "bg-success/10 text-success border-success/20",
    scheduled: "bg-info/10 text-info border-info/20",
    draft: "bg-muted text-muted-foreground border-border",
    sending: "bg-warning/10 text-warning border-warning/20",
    paused: "bg-warning/10 text-warning border-warning/20",
    cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  }
  return (
    <Badge variant="outline" className={`${styles[status] || styles.draft} text-sm`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

function formatProvider(provider?: Campaign["provider"]) {
  switch (provider) {
    case "mailgun":
      return "Mailgun"
    case "kumomta":
      return "KumoMTA VPS"
    case "manual":
      return "Manual"
    default:
      return "Resend"
  }
}

export default function CampaignDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params)
  const { campaign, isLoading } = useCampaign(id)

  if (isLoading) {
    return (
      <>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Skeleton className="h-4 w-48" />
        </header>
        <main className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            <Skeleton className="h-32" />
            <div className="grid gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24" />
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
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger className="-ml-1" />
        </header>
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Campaign not found</p>
        </main>
      </>
    )
  }

  const stats = [
    {
      label: "Sent",
      value: campaign.sentCount,
      icon: Send,
      color: "text-foreground",
    },
    {
      label: "Delivered",
      value: campaign.deliveredCount,
      percentage: campaign.sentCount > 0 ? ((campaign.deliveredCount / campaign.sentCount) * 100).toFixed(1) : "0",
      icon: CheckCircle2,
      color: "text-success",
    },
    {
      label: "Opened",
      value: campaign.openedCount,
      percentage: campaign.deliveredCount > 0 ? ((campaign.openedCount / campaign.deliveredCount) * 100).toFixed(1) : "0",
      icon: Mail,
      color: "text-brand-pink",
    },
    {
      label: "Clicked",
      value: campaign.clickedCount,
      percentage: campaign.openedCount > 0 ? ((campaign.clickedCount / campaign.openedCount) * 100).toFixed(1) : "0",
      icon: MousePointerClick,
      color: "text-info",
    },
  ]

  const secondaryStats = [
    {
      label: "Replied",
      value: campaign.repliedCount,
      icon: MessageSquare,
    },
    {
      label: "Bounced",
      value: campaign.bouncedCount,
      icon: AlertTriangle,
    },
    {
      label: "Unsubscribed",
      value: campaign.unsubscribedCount,
      icon: UserMinus,
    },
  ]

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
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
      <main className="flex-1 overflow-auto">
        <div className="flex flex-col gap-6 p-6">
          {/* Back Link */}
          <Button variant="ghost" size="sm" className="w-fit -ml-2" asChild>
            <Link href="/campaigns">
              <ArrowLeft className="size-4" />
              Back to Campaigns
            </Link>
          </Button>

          {/* Campaign Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight">{campaign.name}</h1>
                {getStatusBadge(campaign.status)}
                <Badge variant="secondary">{formatProvider(campaign.provider)}</Badge>
                {campaign.templateFormat && (
                  <Badge variant="outline">{campaign.templateFormat === "plain_text" ? "Plain text" : "HTML"}</Badge>
                )}
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p><span className="font-medium text-foreground">Subject:</span> {campaign.subject}</p>
                <p><span className="font-medium text-foreground">From:</span> {campaign.fromName} {"<"}{campaign.fromEmail}{">"}</p>
                <p><span className="font-medium text-foreground">Reply mailbox:</span> {campaign.replyTo}</p>
                {campaign.templateName && (
                  <p><span className="font-medium text-foreground">Template:</span> {campaign.templateName}</p>
                )}
                {campaign.sentAt && (
                  <p><span className="font-medium text-foreground">Sent:</span> {formatDate(campaign.sentAt)}</p>
                )}
                {campaign.scheduledAt && campaign.status === "scheduled" && (
                  <p><span className="font-medium text-foreground">Scheduled for:</span> {formatDate(campaign.scheduledAt)}</p>
                )}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Users className="size-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {campaign.segmentNames.join(", ")} ({formatNumber(campaign.totalRecipients)} recipients)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {campaign.status === "draft" && (
                <Button>
                  <Send className="size-4" />
                  Send Campaign
                </Button>
              )}
              {campaign.status === "scheduled" && (
                <Button variant="outline">
                  <Pause className="size-4" />
                  Pause
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Copy className="size-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2.5">
                    <Boxes className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Provider Lane</p>
                    <p className="text-lg font-semibold">{formatProvider(campaign.provider)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2.5">
                    <Users className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Audience</p>
                    <p className="text-lg font-semibold">{formatNumber(campaign.totalRecipients)} contacts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2.5">
                    <Reply className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Replies Logged</p>
                    <p className="text-lg font-semibold">{formatNumber(campaign.repliedCount)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2.5">
                    <FileText className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Template Mode</p>
                    <p className="text-lg font-semibold">{campaign.templateFormat === "html" ? "HTML" : "Plain text"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Stats */}
          {campaign.status === "sent" && (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                {stats.map((stat) => (
                  <Card key={stat.label}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">{stat.label}</p>
                          <p className="text-2xl font-bold">{formatNumber(stat.value)}</p>
                          {stat.percentage && (
                            <p className={`text-sm font-medium ${stat.color}`}>
                              {stat.percentage}%
                            </p>
                          )}
                        </div>
                        <div className={`rounded-lg bg-muted p-3 ${stat.color}`}>
                          <stat.icon className="size-5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Delivery Funnel */}
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Funnel</CardTitle>
                  <CardDescription>Delivery, interest and response across the selected audience.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Sent to Delivered</span>
                      <span className="text-muted-foreground">
                        {formatNumber(campaign.deliveredCount)} / {formatNumber(campaign.sentCount)} ({((campaign.deliveredCount / campaign.sentCount) * 100).toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={(campaign.deliveredCount / campaign.sentCount) * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Delivered to Opened</span>
                      <span className="text-muted-foreground">
                        {formatNumber(campaign.openedCount)} / {formatNumber(campaign.deliveredCount)} ({((campaign.openedCount / campaign.deliveredCount) * 100).toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={(campaign.openedCount / campaign.deliveredCount) * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Opened to Clicked</span>
                      <span className="text-muted-foreground">
                        {formatNumber(campaign.clickedCount)} / {formatNumber(campaign.openedCount)} ({((campaign.clickedCount / campaign.openedCount) * 100).toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={(campaign.clickedCount / campaign.openedCount) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Secondary Stats */}
              <div className="grid gap-4 md:grid-cols-3">
                {secondaryStats.map((stat) => (
                  <Card key={stat.label}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-muted p-2">
                          <stat.icon className="size-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{stat.label}</p>
                          <p className="text-xl font-semibold">{formatNumber(stat.value)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {campaign.textContent && (
            <Card>
              <CardHeader>
                <CardTitle>Plain-text Message</CardTitle>
                <CardDescription>
                  Delivery-first content preview used for this batch.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-4 text-sm leading-6 text-foreground">
                  {campaign.textContent}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Draft/Scheduled State */}
          {(campaign.status === "draft" || campaign.status === "scheduled") && (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="mx-auto max-w-md space-y-4">
                  {campaign.status === "draft" ? (
                    <>
                      <div className="mx-auto rounded-full bg-muted p-4 w-fit">
                        <Mail className="size-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium">Campaign Draft</h3>
                      <p className="text-sm text-muted-foreground">
                        This batch is still in draft. Review provider, segment and message before moving it into send.
                      </p>
                      <Button>
                        <Send className="size-4" />
                        Send Campaign
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="mx-auto rounded-full bg-info/10 p-4 w-fit">
                        <Clock className="size-8 text-info" />
                      </div>
                      <h3 className="text-lg font-medium">Campaign Scheduled</h3>
                      <p className="text-sm text-muted-foreground">
                        This batch is scheduled to be sent on {formatDate(campaign.scheduledAt!)}.
                      </p>
                      <div className="flex justify-center gap-2">
                        <Button variant="outline">
                          <Pause className="size-4" />
                          Pause
                        </Button>
                        <Button>Edit Schedule</Button>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  )
}
