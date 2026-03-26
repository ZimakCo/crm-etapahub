"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useSWRConfig } from "swr"
import { toast } from "sonner"
import {
  useCompanies,
  useEvents,
  useContactActivities,
  useContactCampaignHistory,
  useContactEventParticipations,
  useContactInvoices,
  useRegistrationsByContact,
  useSegments,
} from "@/lib/hooks"
import {
  syncContactSegments,
  updateContact,
  updateContactSubscriptionStatus,
} from "@/lib/crm-repository"
import { ContactTagInput } from "@/components/contacts/contact-tag-input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
  Mail,
  Phone,
  Linkedin,
  Building2,
  MapPin,
  Calendar,
  Tag,
  ExternalLink,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Clock,
  MousePointerClick,
  MessageSquare,
  UserPlus,
  Filter,
  ShieldAlert,
  FileText,
  Wallet,
  ShieldCheck,
  LoaderCircle,
  PencilLine,
  Users,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ActivityType, Contact, ContactTag, Segment } from "@/lib/types"

interface ContactDetailSheetProps {
  contact: Contact | null
  open: boolean
  onOpenChange: (open: boolean) => void
  availableTags: ContactTag[]
  onCreateCustomTag: (name: string) => Promise<ContactTag>
}

type ContactFormState = {
  firstName: string
  lastName: string
  email: string
  company: string
  jobTitle: string
  phone: string
  linkedin: string
  ownerName: string
  country: string
  city: string
  industry: string
  companySize: string
  leadSource: string
  contactType: NonNullable<Contact["contactType"]>
  outreachStatus: Contact["outreachStatus"]
  brochureStatus: NonNullable<Contact["brochureStatus"]>
  tags: string[]
  notes: string
}

const contactTypeOptions: Array<NonNullable<Contact["contactType"]>> = [
  "lead",
  "client",
  "subscriber",
  "delegate",
  "employee",
  "sponsor",
]

const brochureStatusOptions: Array<NonNullable<Contact["brochureStatus"]>> = [
  "not_requested",
  "requested",
  "sent",
]

const outreachStatusOptions: Contact["outreachStatus"][] = [
  "not_contacted",
  "in_communication",
  "in_sequence",
  "replied",
  "interested",
  "not_interested",
]

const leadSourceOptions = [
  "Manual",
  "CSV Import",
  "LinkedIn",
  "Website",
  "Referral",
  "Conference",
  "Newsletter",
  "Outbound",
]

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function getActivityIcon(type: ActivityType) {
  switch (type) {
    case "email_sent":
    case "email_opened":
      return Mail
    case "email_clicked":
      return MousePointerClick
    case "email_replied":
      return MessageSquare
    case "contact_created":
    case "contact_updated":
      return UserPlus
    case "event_registered":
    case "event_attended":
      return Calendar
    case "tag_added":
    case "tag_removed":
      return Tag
    case "segment_added":
    case "segment_removed":
      return Filter
    default:
      return Mail
  }
}

function getActivityColor(type: ActivityType) {
  switch (type) {
    case "email_opened":
    case "email_clicked":
    case "email_replied":
      return "text-brand-pink bg-brand-pink/10"
    case "contact_created":
      return "text-success bg-success/10"
    case "event_registered":
    case "event_attended":
      return "text-info bg-info/10"
    case "segment_added":
    case "tag_added":
      return "text-accent bg-accent/10"
    default:
      return "text-muted-foreground bg-muted"
  }
}

function getEventStatusIcon(status: string) {
  switch (status) {
    case "attended":
      return <CheckCircle2 className="size-4 text-success" />
    case "no_show":
      return <XCircle className="size-4 text-destructive" />
    case "registered":
    case "confirmed":
      return <Clock className="size-4 text-info" />
    default:
      return <Clock className="size-4 text-muted-foreground" />
  }
}

function formatOutreachStatus(status: Contact["outreachStatus"]) {
  return status.replace(/_/g, " ")
}

function outreachStatusBadgeClass(status: Contact["outreachStatus"]) {
  switch (status) {
    case "interested":
      return "border-success/20 bg-success/10 text-success"
    case "replied":
      return "border-info/20 bg-info/10 text-info"
    case "in_sequence":
      return "border-brand-pink/20 bg-brand-pink/10 text-brand-pink"
    case "in_communication":
      return "border-warning/20 bg-warning/10 text-warning"
    case "not_interested":
      return "border-destructive/20 bg-destructive/10 text-destructive"
    default:
      return "border-border bg-muted text-muted-foreground"
  }
}

function buildContactForm(contact: Contact): ContactFormState {
  return {
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email,
    company: contact.company,
    jobTitle: contact.jobTitle,
    phone: contact.phone,
    linkedin: contact.linkedin,
    ownerName: contact.ownerName ?? "",
    country: contact.country,
    city: contact.city,
    industry: contact.industry,
    companySize: contact.companySize,
    leadSource: contact.leadSource || "Manual",
    contactType: contact.contactType ?? "lead",
    outreachStatus: contact.outreachStatus,
    brochureStatus: contact.brochureStatus ?? "not_requested",
    tags: contact.tags,
    notes: contact.notes ?? "",
  }
}

function emptyContactForm(): ContactFormState {
  return {
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    jobTitle: "",
    phone: "",
    linkedin: "",
    ownerName: "",
    country: "",
    city: "",
    industry: "",
    companySize: "",
    leadSource: "Manual",
    contactType: "lead",
    outreachStatus: "not_contacted",
    brochureStatus: "not_requested",
    tags: [],
    notes: "",
  }
}

function getSegmentIdsForContact(contact: Contact, segments: Segment[]) {
  const names = new Set(contact.segments)
  return segments.filter((segment) => names.has(segment.name)).map((segment) => segment.id)
}

export function ContactDetailSheet({
  contact,
  open,
  onOpenChange,
  availableTags,
  onCreateCustomTag,
}: ContactDetailSheetProps) {
  const { mutate } = useSWRConfig()
  const [localContact, setLocalContact] = useState<Contact | null>(contact)
  const [editOpen, setEditOpen] = useState(false)
  const [segmentsOpen, setSegmentsOpen] = useState(false)
  const [contactForm, setContactForm] = useState<ContactFormState>(contact ? buildContactForm(contact) : emptyContactForm())
  const [selectedSegmentIds, setSelectedSegmentIds] = useState<string[]>([])
  const [isUpdatingSubscription, setIsUpdatingSubscription] = useState(false)
  const [isSavingDetails, setIsSavingDetails] = useState(false)
  const [isSavingSegments, setIsSavingSegments] = useState(false)
  const { activities, isLoading: activitiesLoading } = useContactActivities(localContact?.id || null)
  const { participations, isLoading: participationsLoading } = useContactEventParticipations(localContact?.id || null)
  const { campaignHistory, isLoading: campaignHistoryLoading } = useContactCampaignHistory(localContact?.id || null)
  const { invoices, isLoading: invoicesLoading } = useContactInvoices(localContact?.id || null)
  const { registrations, isLoading: registrationsLoading } = useRegistrationsByContact(localContact?.id || null)
  const { companies } = useCompanies()
  const { events } = useEvents()
  const { segments, isLoading: segmentsLoading } = useSegments()

  useEffect(() => {
    setLocalContact(contact)
  }, [contact])

  useEffect(() => {
    if (localContact && !editOpen) {
      setContactForm(buildContactForm(localContact))
    }
  }, [localContact, editOpen])

  useEffect(() => {
    if (localContact && !segmentsOpen) {
      setSelectedSegmentIds(getSegmentIdsForContact(localContact, segments))
    }
  }, [localContact, segments, segmentsOpen])

  if (!localContact) return null

  const initials = `${localContact.firstName[0] ?? ""}${localContact.lastName[0] ?? ""}`
  const paidInvoices = invoices.filter((invoice) => invoice.paymentStatus === "paid").length
  const outstandingInvoices = invoices.filter((invoice) => invoice.paymentStatus !== "paid").length
  const brochureLabel = localContact.brochureStatus?.replace("_", " ") ?? "not requested"
  const emailHealthLabel =
    localContact.subscriptionStatus === "bounced"
      ? "Bounced"
      : localContact.subscriptionStatus === "complained"
        ? "Complained"
        : localContact.subscriptionStatus === "unsubscribed"
          ? "Unsubscribed"
          : localContact.emailStatus === "spam"
            ? "Spam risk"
            : "Deliverable"

  const assignedSegments = segments.filter((segment) => localContact.segments.includes(segment.name))

  const refreshCaches = async (updatedContact: Contact) => {
    setLocalContact(updatedContact)
    await mutate(["contact", updatedContact.id], updatedContact, { revalidate: false })
    await Promise.all([
      mutate((key) => Array.isArray(key) && key[0] === "contacts"),
      mutate((key) => Array.isArray(key) && key[0] === "contacts-page"),
      mutate((key) => Array.isArray(key) && key[0] === "segment"),
      mutate(["contact-activities", updatedContact.id]),
      mutate("contact-tags"),
      mutate("segments"),
      mutate("recent-activities"),
      mutate("dashboard-stats"),
    ])
  }

  const updateForm = <Field extends keyof ContactFormState>(field: Field, value: ContactFormState[Field]) => {
    setContactForm((current) => ({ ...current, [field]: value }))
  }

  const handleManualUnsubscribe = async () => {
    if (localContact.subscriptionStatus === "unsubscribed") {
      return
    }

    try {
      setIsUpdatingSubscription(true)
      const updatedContact = await updateContactSubscriptionStatus(localContact.id, "unsubscribed")
      await refreshCaches(updatedContact)
      toast.success("Contact unsubscribed manually")
    } catch (error) {
      console.error(error)
      toast.error("Could not update subscription status")
    } finally {
      setIsUpdatingSubscription(false)
    }
  }

  const handleSaveContact = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      setIsSavingDetails(true)
      const updatedContact = await updateContact(localContact.id, {
        firstName: contactForm.firstName.trim(),
        lastName: contactForm.lastName.trim(),
        email: contactForm.email.trim(),
        company: contactForm.company.trim(),
        jobTitle: contactForm.jobTitle.trim(),
        phone: contactForm.phone.trim(),
        linkedin: contactForm.linkedin.trim(),
        ownerName: contactForm.ownerName.trim(),
        country: contactForm.country.trim(),
        city: contactForm.city.trim(),
        industry: contactForm.industry.trim(),
        companySize: contactForm.companySize.trim(),
        leadSource: contactForm.leadSource.trim(),
        contactType: contactForm.contactType,
        outreachStatus: contactForm.outreachStatus,
        brochureStatus: contactForm.brochureStatus,
        tags: contactForm.tags,
        notes: contactForm.notes.trim(),
      })

      await refreshCaches(updatedContact)
      setEditOpen(false)
      toast.success("Contact updated")
    } catch (error) {
      console.error(error)
      toast.error("Could not save contact details")
    } finally {
      setIsSavingDetails(false)
    }
  }

  const handleToggleSegment = (segmentId: string, checked: boolean) => {
    setSelectedSegmentIds((current) =>
      checked ? [...current, segmentId] : current.filter((id) => id !== segmentId)
    )
  }

  const handleSaveSegments = async () => {
    try {
      setIsSavingSegments(true)
      const updatedContact = await syncContactSegments(localContact.id, selectedSegmentIds)
      await refreshCaches(updatedContact)
      setSegmentsOpen(false)
      toast.success("Segment membership updated")
    } catch (error) {
      console.error(error)
      toast.error("Could not update segments")
    } finally {
      setIsSavingSegments(false)
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full gap-0 p-0 sm:max-w-xl">
          <SheetHeader className="shrink-0 p-6 pb-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="size-16">
                  <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-900 text-lg text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <SheetTitle className="text-xl">
                    {localContact.firstName} {localContact.lastName}
                  </SheetTitle>
                  <p className="text-sm text-muted-foreground">{localContact.jobTitle || "No job title"}</p>
                  <p className="text-sm text-muted-foreground">
                    {localContact.companyId ? (
                      <Link href={`/companies/${localContact.companyId}`} className="hover:text-foreground hover:underline">
                        {localContact.company || "No company assigned"}
                      </Link>
                    ) : (
                      localContact.company || "No company assigned"
                    )}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        localContact.subscriptionStatus === "subscribed"
                          ? "border-success/20 bg-success/10 text-success"
                          : localContact.subscriptionStatus === "complained"
                            ? "border-warning/20 bg-warning/10 text-warning"
                            : localContact.subscriptionStatus === "bounced"
                              ? "border-destructive/20 bg-destructive/10 text-destructive"
                              : "border-border bg-muted text-muted-foreground"
                      }
                    >
                      {localContact.subscriptionStatus}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={outreachStatusBadgeClass(localContact.outreachStatus)}
                    >
                      {formatOutreachStatus(localContact.outreachStatus)}
                    </Badge>
                    {localContact.hasReplied && (
                      <Badge variant="outline" className="border-info/20 bg-info/10 text-info">
                        replied
                      </Badge>
                    )}
                    {localContact.contactType && <Badge variant="secondary">{localContact.contactType}</Badge>}
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => setEditOpen(true)}>
                    Edit details
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setSegmentsOpen(true)}>
                    Manage segments
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onSelect={handleManualUnsubscribe}
                    disabled={isUpdatingSubscription || localContact.subscriptionStatus === "unsubscribed"}
                  >
                    Manual unsubscribe
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SheetHeader>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="space-y-6 px-6 pb-6 pt-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="size-4 text-muted-foreground" />
                  <a href={`mailto:${localContact.email}`} className="text-primary hover:underline">
                    {localContact.email}
                  </a>
                </div>
                {localContact.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="size-4 text-muted-foreground" />
                    <span>{localContact.phone}</span>
                  </div>
                )}
                {localContact.linkedin && (
                  <div className="flex items-center gap-3 text-sm">
                    <Linkedin className="size-4 text-muted-foreground" />
                    <a
                      href={localContact.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      LinkedIn Profile
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Building2 className="size-4 text-muted-foreground" />
                  <span>
                    {localContact.industry || "Industry n/a"} · {localContact.companySize || "Size n/a"} employees
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="size-4 text-muted-foreground" />
                  <span>
                    {localContact.city || "City n/a"}
                    {localContact.country ? `, ${localContact.country}` : ""}
                  </span>
                </div>
                {localContact.ownerName && (
                  <div className="flex items-center gap-3 text-sm">
                    <ShieldAlert className="size-4 text-muted-foreground" />
                    <span>Owner: {localContact.ownerName}</span>
                  </div>
                )}
                {localContact.lastReplyAt && (
                  <div className="text-xs text-muted-foreground">
                    Last reply: {formatDateTime(localContact.lastReplyAt)}
                  </div>
                )}
                {localContact.notes && (
                  <div className="rounded-lg border border-border p-3 text-sm text-muted-foreground">
                    {localContact.notes}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => setEditOpen(true)}>
                  <PencilLine className="size-4" />
                  Edit details
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSegmentsOpen(true)}>
                  <Users className="size-4" />
                  Manage segments
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/outreach/emails?contactId=${localContact.id}`}>
                    <Mail className="size-4" />
                    Open Seller Outreach
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualUnsubscribe}
                  disabled={isUpdatingSubscription || localContact.subscriptionStatus === "unsubscribed"}
                >
                  {isUpdatingSubscription ? <LoaderCircle className="size-4 animate-spin" /> : <XCircle className="size-4" />}
                  {localContact.subscriptionStatus === "unsubscribed" ? "Already unsubscribed" : "Manual unsubscribe"}
                </Button>
              </div>

              {(localContact.tags.length > 0 || localContact.segments.length > 0) && (
                <div className="space-y-3">
                  {localContact.tags.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Tag className="mt-1 size-4 text-muted-foreground" />
                      <div className="flex flex-wrap gap-1">
                        {localContact.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {localContact.segments.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Filter className="mt-1 size-4 text-muted-foreground" />
                      <div className="flex flex-wrap gap-1">
                        {localContact.segments.map((segment) => (
                          <Badge key={segment} variant="outline" className="text-xs">
                            {segment}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                    <Mail className="size-3.5" />
                    Email health
                  </div>
                  <p className="mt-2 text-sm font-medium">{emailHealthLabel}</p>
                  <p className="text-xs text-muted-foreground">
                    Subscription: {localContact.subscriptionStatus} · validation: {localContact.emailStatus}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                    <FileText className="size-3.5" />
                    Brochure workflow
                  </div>
                  <p className="mt-2 text-sm font-medium capitalize">{brochureLabel}</p>
                  <p className="text-xs text-muted-foreground">
                    Manual brochure requests and follow-up stay visible on the contact.
                  </p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                    <ShieldCheck className="size-3.5" />
                    Commercial ownership
                  </div>
                  <p className="mt-2 text-sm font-medium">{localContact.ownerName ?? "Unassigned"}</p>
                  <p className="text-xs text-muted-foreground">
                    Contact type: {localContact.contactType ?? "lead"} · source: {localContact.leadSource}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                    <MessageSquare className="size-3.5" />
                    Outreach workflow
                  </div>
                  <p className="mt-2 text-sm font-medium capitalize">
                    {formatOutreachStatus(localContact.outreachStatus)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Mark this contact as in communication, in sequence, replied or interested.
                  </p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                    <Wallet className="size-3.5" />
                    Finance snapshot
                  </div>
                  <p className="mt-2 text-sm font-medium">
                    {paidInvoices} paid · {outstandingInvoices} outstanding
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {registrations.length} registration{registrations.length !== 1 ? "s" : ""} linked to this contact.
                  </p>
                </div>
              </div>

              <Separator />

              <Tabs defaultValue="activity" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="events">Events</TabsTrigger>
                  <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                  <TabsTrigger value="finance">Finance</TabsTrigger>
                </TabsList>

                <TabsContent value="activity" className="m-0">
                  {activitiesLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Skeleton key={index} className="h-16" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activities.map((activity) => {
                        const Icon = getActivityIcon(activity.type)
                        const colorClass = getActivityColor(activity.type)

                        return (
                          <div key={activity.id} className="flex gap-3">
                            <div className={`h-fit rounded-full p-2 ${colorClass}`}>
                              <Icon className="size-3.5" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium">{activity.title}</p>
                              <p className="text-sm text-muted-foreground">{activity.description}</p>
                              <p className="text-xs text-muted-foreground">{formatDateTime(activity.createdAt)}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="events" className="m-0">
                  {participationsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton key={index} className="h-20" />
                      ))}
                    </div>
                  ) : participations.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No event participation yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {participations.map((participation) => {
                        const event = events.find((item) => item.id === participation.eventId)
                        if (!event) return null

                        return (
                          <div key={participation.id} className="space-y-2 rounded-lg border border-border p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-medium">{event.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(event.date)} · {event.location}
                                </p>
                              </div>
                              <div className="flex items-center gap-1.5">
                                {getEventStatusIcon(participation.status)}
                                <span className="text-xs capitalize">
                                  {participation.status.replace("_", " ")}
                                </span>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Registered: {formatDate(participation.registeredAt)}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="campaigns" className="m-0">
                  {campaignHistoryLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton key={index} className="h-20" />
                      ))}
                    </div>
                  ) : campaignHistory.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No campaign history yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {campaignHistory.map((campaign) => (
                        <div key={campaign.campaignId} className="space-y-2 rounded-lg border border-border p-3">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium">{campaign.campaignName}</p>
                            <span className="text-xs text-muted-foreground">{formatDate(campaign.sentAt)}</span>
                          </div>
                          <div className="flex gap-4 text-xs">
                            <div className="flex items-center gap-1.5">
                              {campaign.opened ? (
                                <CheckCircle2 className="size-3.5 text-success" />
                              ) : (
                                <XCircle className="size-3.5 text-muted-foreground" />
                              )}
                              <span className={campaign.opened ? "text-success" : "text-muted-foreground"}>
                                Opened
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {campaign.clicked ? (
                                <CheckCircle2 className="size-3.5 text-success" />
                              ) : (
                                <XCircle className="size-3.5 text-muted-foreground" />
                              )}
                              <span className={campaign.clicked ? "text-success" : "text-muted-foreground"}>
                                Clicked
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {campaign.replied ? (
                                <CheckCircle2 className="size-3.5 text-success" />
                              ) : (
                                <XCircle className="size-3.5 text-muted-foreground" />
                              )}
                              <span className={campaign.replied ? "text-success" : "text-muted-foreground"}>
                                Replied
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="finance" className="m-0">
                  {invoicesLoading || registrationsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton key={index} className="h-20" />
                      ))}
                    </div>
                  ) : invoices.length === 0 && registrations.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No registrations or invoices linked yet
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {registrations.length > 0 && (
                        <div className="space-y-3">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Registrations
                          </p>
                          {registrations.map((registration) => (
                            <div key={registration.id} className="space-y-2 rounded-lg border border-border p-3">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-sm font-medium">{registration.eventName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {registration.ticketType} · {registration.quantity} seat
                                    {registration.quantity !== 1 ? "s" : ""} · {registration.currency}{" "}
                                    {registration.totalAmount.toLocaleString()}
                                  </p>
                                </div>
                                <Badge variant="outline" className="capitalize">
                                  {registration.status}
                                </Badge>
                              </div>
                              {registration.adminNotes && (
                                <p className="text-xs text-muted-foreground">{registration.adminNotes}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {invoices.length > 0 && (
                        <div className="space-y-3">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Invoices
                          </p>
                          {invoices.map((invoice) => (
                            <div key={invoice.id} className="space-y-2 rounded-lg border border-border p-3">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-sm font-medium">{invoice.invoiceNumber}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {invoice.currency} {invoice.totalAmount.toLocaleString()} · due{" "}
                                    {formatDate(invoice.dueDate)}
                                  </p>
                                </div>
                                <Badge
                                  variant="outline"
                                  className={
                                    invoice.paymentStatus === "paid"
                                      ? "border-success/20 bg-success/10 text-success"
                                      : "border-warning/20 bg-warning/10 text-warning"
                                  }
                                >
                                  {invoice.paymentStatus.replace("_", " ")}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Paid: {invoice.currency} {invoice.amountPaid.toLocaleString()} · Balance:{" "}
                                {invoice.currency} {invoice.balanceDue.toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit contact</DialogTitle>
            <DialogDescription>
              Update profile, ownership, brochure state and enrichment data for this contact.
            </DialogDescription>
          </DialogHeader>
          <form className="flex min-h-0 flex-col gap-4" onSubmit={handleSaveContact}>
            <div className="grid max-h-[60vh] gap-4 overflow-y-auto pr-2 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact-first-name">First name</Label>
                <Input
                  id="contact-first-name"
                  value={contactForm.firstName}
                  onChange={(event) => updateForm("firstName", event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-last-name">Last name</Label>
                <Input
                  id="contact-last-name"
                  value={contactForm.lastName}
                  onChange={(event) => updateForm("lastName", event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={contactForm.email}
                  onChange={(event) => updateForm("email", event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-company">Company</Label>
                <Input
                  id="contact-company"
                  list="contact-company-options"
                  value={contactForm.company}
                  onChange={(event) => updateForm("company", event.target.value)}
                />
                <datalist id="contact-company-options">
                  {companies.map((company) => (
                    <option key={company.id} value={company.name} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-job-title">Job title</Label>
                <Input
                  id="contact-job-title"
                  value={contactForm.jobTitle}
                  onChange={(event) => updateForm("jobTitle", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-phone">Phone</Label>
                <Input
                  id="contact-phone"
                  value={contactForm.phone}
                  onChange={(event) => updateForm("phone", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-linkedin">LinkedIn</Label>
                <Input
                  id="contact-linkedin"
                  value={contactForm.linkedin}
                  onChange={(event) => updateForm("linkedin", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-owner">Commercial owner</Label>
                <Input
                  id="contact-owner"
                  value={contactForm.ownerName}
                  onChange={(event) => updateForm("ownerName", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-country">Country</Label>
                <Input
                  id="contact-country"
                  value={contactForm.country}
                  onChange={(event) => updateForm("country", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-city">City</Label>
                <Input
                  id="contact-city"
                  value={contactForm.city}
                  onChange={(event) => updateForm("city", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-industry">Industry</Label>
                <Input
                  id="contact-industry"
                  value={contactForm.industry}
                  onChange={(event) => updateForm("industry", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-company-size">Company size</Label>
                <Input
                  id="contact-company-size"
                  value={contactForm.companySize}
                  onChange={(event) => updateForm("companySize", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Contact type</Label>
                <Select value={contactForm.contactType} onValueChange={(value) => updateForm("contactType", value as ContactFormState["contactType"])}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contactTypeOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Lead source</Label>
                <Select value={contactForm.leadSource} onValueChange={(value) => updateForm("leadSource", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {leadSourceOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Outreach status</Label>
                <Select
                  value={contactForm.outreachStatus}
                  onValueChange={(value) =>
                    updateForm("outreachStatus", value as ContactFormState["outreachStatus"])
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {outreachStatusOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {formatOutreachStatus(option)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Brochure status</Label>
                <Select
                  value={contactForm.brochureStatus}
                  onValueChange={(value) => updateForm("brochureStatus", value as ContactFormState["brochureStatus"])}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {brochureStatusOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="contact-tags">Tags</Label>
                <ContactTagInput
                  availableTags={availableTags}
                  value={contactForm.tags}
                  onChange={(tags) => updateForm("tags", tags)}
                  onCreateTag={onCreateCustomTag}
                  inputId="contact-tags"
                  inputTestId="contact-detail-tags-input"
                  placeholder="Search or create contact tags"
                  disabled={isSavingDetails}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="contact-notes">Internal notes</Label>
                <Textarea
                  id="contact-notes"
                  value={contactForm.notes}
                  onChange={(event) => updateForm("notes", event.target.value)}
                  rows={5}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSavingDetails}>
                {isSavingDetails && <LoaderCircle className="size-4 animate-spin" />}
                Save contact
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={segmentsOpen} onOpenChange={setSegmentsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage audience segments</DialogTitle>
            <DialogDescription>
              Assign this contact to manual or campaign-driven segments used by daily email batches.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
              {assignedSegments.length > 0
                ? `${assignedSegments.length} active segment assignment${assignedSegments.length > 1 ? "s" : ""} on this contact.`
                : "This contact is not assigned to any segment yet."}
            </div>
            <div className="max-h-[50vh] space-y-2 overflow-y-auto pr-2">
              {segmentsLoading ? (
                Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-16" />)
              ) : segments.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                  No audience segments created yet.
                </p>
              ) : (
                segments.map((segment) => {
                  const checked = selectedSegmentIds.includes(segment.id)

                  return (
                    <label
                      key={segment.id}
                      className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/40"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) => handleToggleSegment(segment.id, value === true)}
                      />
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium">{segment.name}</span>
                          <Badge variant="outline" className="text-[11px]">
                            {segment.contactCount} contacts
                          </Badge>
                          {segment.segmentKind && (
                            <Badge variant="secondary" className="text-[11px] capitalize">
                              {segment.segmentKind}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{segment.description}</p>
                      </div>
                    </label>
                  )
                })
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSegmentsOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveSegments} disabled={isSavingSegments}>
              {isSavingSegments && <LoaderCircle className="size-4 animate-spin" />}
              Save segments
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
