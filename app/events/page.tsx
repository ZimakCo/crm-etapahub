"use client"

import Link from "next/link"
import { useEvents } from "@/lib/hooks"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Calendar, MapPin, Users, ArrowRight } from "lucide-react"
import type { Event } from "@/lib/types"

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function getEventTypeColor(type: Event["type"]) {
  switch (type) {
    case "conference":
      return "bg-brand-pink/10 text-brand-pink border-brand-pink/20"
    case "webinar":
      return "bg-info/10 text-info border-info/20"
    case "workshop":
      return "bg-warning/10 text-warning border-warning/20"
    case "meetup":
      return "bg-success/10 text-success border-success/20"
    case "trade_show":
      return "bg-accent/10 text-accent border-accent/20"
    default:
      return "bg-muted text-muted-foreground border-border"
  }
}

function getStatusBadge(status: Event["status"]) {
  switch (status) {
    case "upcoming":
      return <Badge variant="outline" className="bg-info/10 text-info border-info/20">Upcoming</Badge>
    case "ongoing":
      return <Badge variant="outline" className="bg-success/10 text-success border-success/20">Ongoing</Badge>
    case "completed":
      return <Badge variant="outline" className="bg-muted text-muted-foreground border-border">Completed</Badge>
    case "cancelled":
      return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Cancelled</Badge>
    default:
      return null
  }
}

export default function EventsPage() {
  const { events, isLoading } = useEvents()

  // Group events by status
  const upcomingEvents = events.filter(e => e.status === "upcoming" || e.status === "ongoing")
  const completedEvents = events.filter(e => e.status === "completed")

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Events</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <main className="flex-1 overflow-auto">
        <div className="flex flex-col gap-8 p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
              <p className="text-sm text-muted-foreground">
                Track conferences, webinars, and meetups
              </p>
            </div>
            <Button asChild>
              <Link href="/events/new">
                <Plus className="size-4" />
                Create Event
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Upcoming Events */}
              {upcomingEvents.length > 0 && (
                <section className="space-y-4">
                  <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Upcoming ({upcomingEvents.length})
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {upcomingEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </section>
              )}

              {/* Completed Events */}
              {completedEvents.length > 0 && (
                <section className="space-y-4">
                  <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Completed ({completedEvents.length})
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {completedEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  )
}

function EventCard({ event }: { event: Event }) {
  const registrationProgress = (event.registeredCount / event.capacity) * 100
  const attendanceRate = event.status === "completed" && event.registeredCount > 0
    ? ((event.attendedCount / event.registeredCount) * 100).toFixed(0)
    : null

  return (
    <Link href={`/events/${event.id}`}>
      <Card className="group h-full transition-colors hover:bg-muted/50 cursor-pointer">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium">{event.name}</h3>
                  <Badge variant="outline" className={getEventTypeColor(event.type)}>
                    {event.type.replace("_", " ")}
                  </Badge>
                  {getStatusBadge(event.status)}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {event.description}
                </p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                <span>{event.location}</span>
              </div>
            </div>

            {/* Registration Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5">
                  <Users className="size-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {event.registeredCount} / {event.capacity} registered
                  </span>
                </div>
                {attendanceRate && (
                  <span className="text-muted-foreground">
                    {attendanceRate}% attended
                  </span>
                )}
              </div>
              <Progress value={registrationProgress} className="h-1.5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
