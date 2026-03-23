"use client"

import { useDashboardStats, useCampaigns, useSegments, useEvents } from "@/lib/hooks"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { CampaignPerformance } from "@/components/dashboard/campaign-performance"
import { UpcomingEvents } from "@/components/dashboard/upcoming-events"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const { stats, isLoading: statsLoading } = useDashboardStats()
  const { campaigns, isLoading: campaignsLoading } = useCampaigns()
  const { segments, isLoading: segmentsLoading } = useSegments()
  const { events, isLoading: eventsLoading } = useEvents()

  const isLoading = statsLoading || campaignsLoading || segmentsLoading || eventsLoading

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
          {/* Page Header */}
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Overview of your contacts, campaigns, and events
            </p>
          </div>

          {/* Stats Cards */}
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
          ) : stats ? (
            <StatsCards stats={stats} />
          ) : null}

          {/* Quick Actions */}
          <QuickActions />

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Campaign Performance - Takes 2 columns */}
            <div className="lg:col-span-2">
              {campaignsLoading ? (
                <Skeleton className="h-80 rounded-lg" />
              ) : (
                <CampaignPerformance campaigns={campaigns} />
              )}
            </div>

            {/* Upcoming Events */}
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
