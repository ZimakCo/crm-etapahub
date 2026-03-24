"use client"

import Link from "next/link"
import { Mail, MessageSquare, FolderKanban, Wallet, FileText, Users } from "lucide-react"
import { useCampaigns, useContacts, useEvents, useInvoices, useRegistrations, useSegments, useTemplates } from "@/lib/hooks"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { CampaignPerformance } from "@/components/dashboard/campaign-performance"
import { UpcomingEvents } from "@/components/dashboard/upcoming-events"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const { contacts, isLoading: contactsLoading } = useContacts()
  const { campaigns, isLoading: campaignsLoading } = useCampaigns()
  const { segments, isLoading: segmentsLoading } = useSegments()
  const { events, isLoading: eventsLoading } = useEvents()
  const { templates, isLoading: templatesLoading } = useTemplates()
  const { registrations, isLoading: registrationsLoading } = useRegistrations()
  const { invoices, isLoading: invoicesLoading } = useInvoices()

  const isLoading =
    contactsLoading ||
    campaignsLoading ||
    segmentsLoading ||
    eventsLoading ||
    templatesLoading ||
    registrationsLoading ||
    invoicesLoading

  const reachableAudience = contacts.filter(
    (contact) =>
      contact.subscriptionStatus === "subscribed" &&
      contact.emailStatus !== "invalid" &&
      contact.emailStatus !== "spam"
  ).length
  const repliedContacts = contacts.filter((contact) => contact.hasReplied || contact.lastReplyAt).length
  const brochureQueue = contacts.filter((contact) => contact.brochureStatus === "requested").length
  const pendingFinance = invoices.filter((invoice) => invoice.paymentStatus !== "paid").length
  const ownedContacts = contacts.filter((contact) => Boolean(contact.ownerName)).length
  const pendingRegistrations = registrations.filter((registration) => registration.status === "pending").length
  const providerMix = Array.from(new Set(campaigns.map((campaign) => campaign.provider ?? "resend")))
  const upcomingEventFolders = events.filter((event) => event.status === "upcoming" || event.status === "ongoing").length
  const scheduledBatches = campaigns.filter((campaign) => campaign.status === "scheduled").length
  const sentBatches = campaigns.filter((campaign) => campaign.status === "sent").length

  const spotlightCards = [
    {
      title: "Reachable Audience",
      description: "Subscribed contacts usable for next batch",
      value: reachableAudience.toLocaleString(),
      icon: Users,
    },
    {
      title: "Replies Tracked",
      description: "Contacts already engaged in conversation",
      value: repliedContacts.toLocaleString(),
      icon: MessageSquare,
    },
    {
      title: "Brochure Queue",
      description: "Contacts waiting for brochure follow-up",
      value: brochureQueue.toLocaleString(),
      icon: FileText,
    },
    {
      title: "Finance Attention",
      description: "Invoices still not fully paid",
      value: pendingFinance.toLocaleString(),
      icon: Wallet,
    },
  ]

  const formatProvider = (provider: string) => {
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

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <main className="flex-1 overflow-auto">
        <div className="flex flex-col gap-6 p-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">EtapaHub Command Center</h1>
            <p className="text-sm text-muted-foreground">
              Email operations and relationship tracking for segmented B2B event outreach.
            </p>
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {spotlightCards.map((card) => (
                  <Card key={card.title}>
                    <CardContent className="flex items-start justify-between gap-4 pt-6">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                        <p className="text-2xl font-bold">{card.value}</p>
                        <p className="text-xs text-muted-foreground">{card.description}</p>
                      </div>
                      <div className="rounded-xl bg-muted p-3">
                        <card.icon className="size-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-brand-pink/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="size-5 text-brand-pink" />
                      Email Ops Control
                    </CardTitle>
                    <CardDescription>
                      Providers, segments and plain-text batches prepared for high-delivery outreach.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {providerMix.map((provider) => (
                        <Badge key={provider} variant="secondary">
                          {formatProvider(provider)}
                        </Badge>
                      ))}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Saved Templates</p>
                        <p className="mt-1 text-xl font-semibold">{templates.length}</p>
                        <p className="text-xs text-muted-foreground">Plain-text assets ready for resend-style sends.</p>
                      </div>
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Active Segments</p>
                        <p className="mt-1 text-xl font-semibold">{segments.filter((segment) => segment.isActive).length}</p>
                        <p className="text-xs text-muted-foreground">Reusable audiences from CSV, campaigns and event folders.</p>
                      </div>
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Scheduled Batches</p>
                        <p className="mt-1 text-xl font-semibold">{scheduledBatches}</p>
                        <p className="text-xs text-muted-foreground">Queued sends waiting for provider execution.</p>
                      </div>
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Sent Batches</p>
                        <p className="mt-1 text-xl font-semibold">{sentBatches}</p>
                        <p className="text-xs text-muted-foreground">Campaigns already tracked inside the CRM timeline.</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" asChild>
                        <Link href="/templates">Open Templates</Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href="/settings">Provider Settings</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FolderKanban className="size-5 text-info" />
                      Relationship Desk
                    </CardTitle>
                    <CardDescription>
                      Commercial ownership, brochure demand, registrations and finance around each contact.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Owned Contacts</p>
                      <p className="mt-1 text-xl font-semibold">{ownedContacts}</p>
                      <p className="text-xs text-muted-foreground">Contacts already assigned to sales or operations.</p>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Event Folders</p>
                      <p className="mt-1 text-xl font-semibold">{upcomingEventFolders}</p>
                      <p className="text-xs text-muted-foreground">Upcoming or ongoing events acting as contact containers.</p>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Pending Registrations</p>
                      <p className="mt-1 text-xl font-semibold">{pendingRegistrations}</p>
                      <p className="text-xs text-muted-foreground">Registrations still awaiting confirmation or finance clearance.</p>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Campaign-ready Contacts</p>
                      <p className="mt-1 text-xl font-semibold">{reachableAudience}</p>
                      <p className="text-xs text-muted-foreground">Audience that can move from CSV to segment to provider lane.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          <QuickActions />

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {campaignsLoading ? (
                <Skeleton className="h-80 rounded-lg" />
              ) : (
                <CampaignPerformance campaigns={campaigns} />
              )}
            </div>

            <div>
              {eventsLoading ? (
                <Skeleton className="h-80 rounded-lg" />
              ) : (
                <UpcomingEvents events={events} />
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <RecentActivity />
        </div>
      </main>
    </>
  )
}
