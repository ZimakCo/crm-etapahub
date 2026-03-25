"use client"

import { use, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { toast } from "sonner"
import { updateEvent } from "@/lib/crm-repository"
import { useEventById, useEventParticipants } from "@/lib/hooks"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Edit,
  Mail,
  MapPin,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react"
import type { Event, EventParticipantWithContact } from "@/lib/types"

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

function getParticipantStatusBadge(status: EventParticipantWithContact["status"]) {
  switch (status) {
    case "attended":
      return (
        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
          <CheckCircle2 className="mr-1 size-3" />
          Attended
        </Badge>
      )
    case "no_show":
      return (
        <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
          <XCircle className="mr-1 size-3" />
          No-show
        </Badge>
      )
    case "confirmed":
      return <Badge variant="outline" className="bg-info/10 text-info border-info/20">Confirmed</Badge>
    case "cancelled":
      return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Cancelled</Badge>
    default:
      return <Badge variant="outline" className="bg-info/10 text-info border-info/20">Registered</Badge>
  }
}

function csvEscape(value: string | number | null | undefined) {
  const normalizedValue = String(value ?? "")
  if (!normalizedValue.includes(",") && !normalizedValue.includes("\n") && !normalizedValue.includes('"')) {
    return normalizedValue
  }
  return `"${normalizedValue.replace(/"/g, '""')}"`
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const { event, isLoading: eventLoading, mutate: mutateEvent } = useEventById(resolvedParams.id)
  const {
    participants,
    isLoading: participantsLoading,
  } = useEventParticipants(resolvedParams.id)
  const [editOpen, setEditOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "conference",
    date: "",
    location: "",
    description: "",
    capacity: "0",
    status: "upcoming",
  })

  useEffect(() => {
    if (!event) {
      return
    }

    setFormData({
      name: event.name,
      type: event.type,
      date: event.date,
      location: event.location,
      description: event.description,
      capacity: String(event.capacity),
      status: event.status,
    })
  }, [event])

  const companiesRepresented = useMemo(
    () => new Set(participants.map((participant) => participant.contact.company).filter(Boolean)).size,
    [participants]
  )

  const exportParticipants = () => {
    if (!event) {
      return
    }

    const rows = [
      ["event", "first_name", "last_name", "email", "company", "job_title", "status", "registered_at", "notes"],
      ...participants.map((participant) => [
        event.name,
        participant.contact.firstName,
        participant.contact.lastName,
        participant.contact.email,
        participant.contact.company,
        participant.contact.jobTitle,
        participant.status,
        participant.registeredAt,
        participant.notes ?? "",
      ]),
    ]

    const csv = rows
      .map((row) => row.map((value) => csvEscape(value)).join(","))
      .join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${event.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-participants.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success("Participant export downloaded")
  }

  const handleSaveEvent = async () => {
    if (!event) {
      return
    }

    setIsSaving(true)
    try {
      const updatedEvent = await updateEvent(event.id, {
        name: formData.name,
        type: formData.type as Event["type"],
        date: formData.date,
        location: formData.location,
        description: formData.description,
        capacity: Number(formData.capacity),
        status: formData.status as Event["status"],
      })
      await mutateEvent(updatedEvent, false)
      setEditOpen(false)
      toast.success("Event updated")
    } catch (error) {
      console.error(error)
      toast.error("Could not update the event")
    } finally {
      setIsSaving(false)
    }
  }

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

  const registrationProgress = event.capacity > 0 ? (event.registeredCount / event.capacity) * 100 : 0
  const attendanceRate =
    event.status === "completed" && event.registeredCount > 0
      ? ((event.attendedCount / event.registeredCount) * 100).toFixed(0)
      : null
  const spotsLeft = event.capacity - event.registeredCount

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
          <div className="flex items-center justify-between">
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Back to Events
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={exportParticipants}>
                <Download className="size-4" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
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

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">{event.name}</h1>
              <Badge variant="outline" className={getEventTypeColor(event.type)}>
                {event.type.replace("_", " ")}
              </Badge>
              {getStatusBadge(event.status)}
            </div>
            <p className="max-w-2xl text-muted-foreground">{event.description}</p>
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
                      : "Event not yet completed"}
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

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Delegates In This Folder</CardTitle>
              <CardDescription>
                {participants.length} contact{participants.length !== 1 ? "s" : ""} currently linked to this event folder
              </CardDescription>
            </CardHeader>
            <CardContent>
              {participantsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} className="h-12" />
                  ))}
                </div>
              ) : participants.length > 0 ? (
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
                    {participants.map((participant) => (
                      <TableRow key={participant.id}>
                        <TableCell>
                          <Link
                            href={`/contacts?selected=${participant.contact.id}`}
                            className="flex items-center gap-3 hover:underline"
                          >
                            <Avatar className="size-8">
                              <AvatarFallback className="bg-primary/10 text-xs text-primary">
                                {participant.contact.firstName[0]}
                                {participant.contact.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {participant.contact.firstName} {participant.contact.lastName}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Mail className="size-3" />
                                {participant.contact.email}
                              </div>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Building2 className="size-3.5 text-muted-foreground" />
                            {participant.contact.company}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {participant.contact.jobTitle}
                        </TableCell>
                        <TableCell>{getParticipantStatusBadge(participant.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <Users className="mx-auto mb-2 size-8 opacity-50" />
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

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>Update the event folder details and operating status.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="eventName">Event name</Label>
              <Input
                id="eventName"
                value={formData.name}
                onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Event type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData((current) => ({ ...current, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conference">Conference</SelectItem>
                    <SelectItem value="webinar">Webinar</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="meetup">Meetup</SelectItem>
                    <SelectItem value="trade_show">Trade show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Folder status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData((current) => ({ ...current, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="eventDate">Date</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={formData.date}
                  onChange={(event) => setFormData((current) => ({ ...current, date: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventCapacity">Capacity</Label>
                <Input
                  id="eventCapacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(event) => setFormData((current) => ({ ...current, capacity: event.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventLocation">Location</Label>
              <Input
                id="eventLocation"
                value={formData.location}
                onChange={(event) => setFormData((current) => ({ ...current, location: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventDescription">Description</Label>
              <Textarea
                id="eventDescription"
                rows={5}
                value={formData.description}
                onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEvent} disabled={isSaving}>
              {isSaving && <CheckCircle2 className="size-4 animate-pulse" />}
              Save Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
