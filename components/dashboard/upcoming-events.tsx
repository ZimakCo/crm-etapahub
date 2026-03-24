"use client"

import Link from "next/link"
import { ArrowRight, Calendar, MapPin, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Event } from "@/lib/types"

interface UpcomingEventsProps {
  events: Event[]
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
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
    default:
      return "bg-muted text-muted-foreground border-border"
  }
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  const upcomingEvents = events
    .filter(e => e.status === "upcoming")
    .slice(0, 3)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Event Folders</CardTitle>
          <CardDescription>Upcoming EtapaHub event containers with delegates and capacity</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/events">
            View All
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingEvents.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="block rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium leading-tight">{event.name}</h4>
                  <Badge variant="outline" className={getEventTypeColor(event.type)}>
                    {event.type}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-3.5" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="size-3.5" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="size-3.5" />
                    <span>{event.registeredCount} / {event.capacity} delegates tracked</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {upcomingEvents.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No active event folders
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
