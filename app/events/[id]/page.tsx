"use client"

import { use } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { toast } from "sonner"
import { useEventById, useContactsByEvent } from "@/lib/hooks"
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Calendar, 
  MapPin, 
  Users, 
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Mail,
  Building2,
  Edit,
  Download,
  UserPlus
} from "lucide-react"
import type { Event } from "@/lib/types"

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
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

export default function EventDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = use(params)
  const { event, isLoading: eventLoading } = useEventById(resolvedParams.id)
  const { contacts, isLoading: contactsLoading } = useContactsByEvent(resolvedParams.id)

  if (eventLoading) {
    return (
      <>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Skeleton className="h-5 w-48" />
        </header>
        <main className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid gap-6 md:grid-cols-3">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
            <Skeleton className="h-96" />
          </div>
        </main>
      </>
    )
  }

  if (!event) {
    notFound()
  }

  const registrationProgress = (event.registeredCount / event.capacity) * 100
  const attendanceRate = event.status === "completed" && event.registeredCount > 0
    ? ((event.attendedCount / event.registeredCount) * 100).toFixed(0)
    : null
  const spotsLeft = event.capacity - event.registeredCount
  const companiesRepresented = new Set(contacts.map((contact) => contact.company).filter(Boolean)).size

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/events">Events</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{event.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <main className="flex-1 overflow-auto">
        <div className="flex flex-col gap-6 p-6">
          {/* Back link & Actions */}
          <div className="flex items-center justify-between">
            <Link 
              href="/events" 
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" />
              Back to Events
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => toast.info("CSV export lands in the next phase.")}>
                <Download className="size-4" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.info("Inline event editing lands in the next phase.")}>
                <Edit className="size-4" />
                Edit
              </Button>
              <Button size="sm" asChild>
                <Link href={`/events/${event.id}/attendees/new`}>
                <UserPlus className="size-4" />
                Add Attendee
                </Link>
              </Button>
            </div>
          </div>

          {/* Event Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-semibold tracking-tight">{event.name}</h1>
              <Badge variant="outline" className={getEventTypeColor(event.type)}>
                {event.type.replace("_", " ")}
              </Badge>
              {getStatusBadge(event.status)}
            </div>
            <p className="text-muted-foreground max-w-2xl">{event.description}</p>
            <p className="text-sm text-muted-foreground">
              This folder groups delegates, registrations and attendance around a single EtapaHub event.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="size-4" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="size-4" />
                <span>{event.location}</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5">
                  <Users className="size-4" />
                  Registration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-semibold">{event.registeredCount}</span>
                    <span className="text-sm text-muted-foreground">/ {event.capacity} capacity</span>
                  </div>
                  <Progress value={registrationProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    {spotsLeft > 0 ? `${spotsLeft} spots remaining` : "Fully booked"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-4" />
                  Attendance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-semibold">{event.attendedCount}</span>
                    <span className="text-sm text-muted-foreground">
                      {attendanceRate ? `${attendanceRate}% rate` : "Pending"}
                    </span>
                  </div>
                  <Progress 
                    value={event.registeredCount > 0 ? (event.attendedCount / event.registeredCount) * 100 : 0} 
                    className="h-2" 
                  />
                  <p className="text-sm text-muted-foreground">
                    {event.status === "completed" 
                      ? `${event.registeredCount - event.attendedCount} no-shows`
                      : "Event not yet completed"
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5">
                  <Building2 className="size-4" />
                  Companies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-semibold">{companiesRepresented}</div>
                  <p className="text-sm text-muted-foreground">
                    Unique companies represented by the contacts already attached to this folder.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5">
                  <Clock className="size-4" />
                  Status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-semibold capitalize">{event.status}</div>
                  <p className="text-sm text-muted-foreground">
                    {event.status === "upcoming" && "Folder is collecting delegates and registrations."}
                    {event.status === "ongoing" && "Event is live and attendance can be updated."}
                    {event.status === "completed" && "Folder is now useful as historical CRM memory."}
                    {event.status === "cancelled" && "Folder is preserved but no longer active."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attendees Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Delegates In This Folder</CardTitle>
              <CardDescription>
                {contacts.length} contact{contacts.length !== 1 ? "s" : ""} currently linked to this event folder
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contactsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              ) : contacts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contact</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map((contact) => {
                      const attended = Math.random() > 0.3 // Simulated attendance status
                      return (
                        <TableRow key={contact.id}>
                          <TableCell>
                            <Link 
                              href={`/contacts?selected=${contact.id}`}
                              className="flex items-center gap-3 hover:underline"
                            >
                              <Avatar className="size-8">
                                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                  {contact.firstName[0]}{contact.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {contact.firstName} {contact.lastName}
                                </div>
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Mail className="size-3" />
                                  {contact.email}
                                </div>
                              </div>
                            </Link>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Building2 className="size-3.5 text-muted-foreground" />
                              {contact.company}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {contact.jobTitle}
                          </TableCell>
                          <TableCell>
                            {event.status === "completed" ? (
                              attended ? (
                                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                                  <CheckCircle2 className="size-3 mr-1" />
                                  Attended
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                                  <XCircle className="size-3 mr-1" />
                                  No-show
                                </Badge>
                              )
                            ) : (
                              <Badge variant="outline" className="bg-info/10 text-info border-info/20">
                                Registered
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="size-8 mx-auto mb-2 opacity-50" />
                  <p>No attendees registered yet</p>
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <Link href={`/events/${event.id}/attendees/new`}>
                      <UserPlus className="size-4" />
                      Add Attendee
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
