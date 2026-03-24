"use client"

import { useEffect, useState, useTransition } from "react"
import { toast } from "sonner"
import { 
  useEvents,
  useContactActivities, 
  useContactEventParticipations, 
  useContactCampaignHistory,
  useContactInvoices,
  useRegistrationsByContact,
} from "@/lib/hooks"
import { updateContactSubscriptionStatus } from "@/lib/crm-repository"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
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
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Contact, ActivityType } from "@/lib/types"

interface ContactDetailSheetProps {
  contact: Contact | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

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

export function ContactDetailSheet({ contact, open, onOpenChange }: ContactDetailSheetProps) {
  const [localContact, setLocalContact] = useState<Contact | null>(contact)
  const [isPending, startTransition] = useTransition()
  const { activities, isLoading: activitiesLoading } = useContactActivities(localContact?.id || null)
  const { participations, isLoading: participationsLoading } = useContactEventParticipations(localContact?.id || null)
  const { campaignHistory, isLoading: campaignHistoryLoading } = useContactCampaignHistory(localContact?.id || null)
  const { invoices, isLoading: invoicesLoading } = useContactInvoices(localContact?.id || null)
  const { registrations, isLoading: registrationsLoading } = useRegistrationsByContact(localContact?.id || null)
  const { events } = useEvents()

  useEffect(() => {
    setLocalContact(contact)
  }, [contact])

  if (!localContact) return null

  const initials = `${localContact.firstName[0]}${localContact.lastName[0]}`
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

  const handleManualUnsubscribe = () => {
    startTransition(async () => {
      const updatedContact = await updateContactSubscriptionStatus(localContact.id, "unsubscribed")
      setLocalContact(updatedContact)
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-hidden p-0 sm:max-w-xl">
        <SheetHeader className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="size-16">
                <AvatarFallback className="bg-gradient-to-br from-brand-pink to-brand-purple text-lg text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <SheetTitle className="text-xl">
                  {localContact.firstName} {localContact.lastName}
                </SheetTitle>
                <p className="text-sm text-muted-foreground">{localContact.jobTitle}</p>
                <p className="text-sm text-muted-foreground">{localContact.company}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={
                      localContact.subscriptionStatus === "subscribed"
                        ? "bg-success/10 text-success border-success/20"
                        : localContact.subscriptionStatus === "complained"
                          ? "bg-warning/10 text-warning border-warning/20"
                          : localContact.subscriptionStatus === "bounced"
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : "bg-muted text-muted-foreground border-border"
                    }
                  >
                    {localContact.subscriptionStatus}
                  </Badge>
                  {localContact.hasReplied && (
                    <Badge variant="outline" className="bg-info/10 text-info border-info/20">
                      replied
                    </Badge>
                  )}
                  {localContact.contactType && (
                    <Badge variant="secondary">{localContact.contactType}</Badge>
                  )}
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
                <DropdownMenuItem onClick={() => toast.info("Inline contact editing lands in the next phase.")}>Edit Contact</DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info("Campaign assignment from the sheet lands in the next phase.")}>Add to Campaign</DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info("Segment assignment from the sheet lands in the next phase.")}>Add to Segment</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={() => toast.info("Contact deletion is intentionally disabled in this phase.")}>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SheetHeader>

        {/* Contact Info */}
        <div className="px-6 py-4 space-y-3">
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
              <a href={localContact.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                LinkedIn Profile
                <ExternalLink className="size-3" />
              </a>
            </div>
          )}
          <div className="flex items-center gap-3 text-sm">
            <Building2 className="size-4 text-muted-foreground" />
            <span>{localContact.industry} · {localContact.companySize} employees</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <MapPin className="size-4 text-muted-foreground" />
            <span>{localContact.city}, {localContact.country}</span>
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
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualUnsubscribe}
              disabled={isPending || localContact.subscriptionStatus === "unsubscribed"}
            >
              <XCircle className="size-4" />
              {localContact.subscriptionStatus === "unsubscribed" ? "Already unsubscribed" : "Manual unsubscribe"}
            </Button>
          </div>

          {/* Tags */}
          {localContact.tags.length > 0 && (
            <div className="flex items-center gap-2 pt-2">
              <Tag className="size-4 text-muted-foreground" />
              <div className="flex flex-wrap gap-1">
                {localContact.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

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

        <Tabs defaultValue="activity" className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <TabsList className="mx-6 grid w-auto shrink-0 grid-cols-4">
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="finance">Finance</TabsTrigger>
          </TabsList>

          {/* Activity Tab */}
          <TabsContent value="activity" className="m-0 min-h-0 flex-1 overflow-hidden px-6 pt-4">
            <ScrollArea className="h-full min-h-0 pr-1">
              {activitiesLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4 pb-6">
                  {activities.map((activity) => {
                    const Icon = getActivityIcon(activity.type)
                    const colorClass = getActivityColor(activity.type)
                    return (
                      <div key={activity.id} className="flex gap-3">
                        <div className={`rounded-full p-2 h-fit ${colorClass}`}>
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
            </ScrollArea>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="m-0 min-h-0 flex-1 overflow-hidden px-6 pt-4">
            <ScrollArea className="h-full min-h-0 pr-1">
              {participationsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-20" />
                  ))}
                </div>
              ) : participations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No event participation yet
                </p>
              ) : (
                <div className="space-y-3 pb-6">
                  {participations.map((participation) => {
                    const event = events.find(e => e.id === participation.eventId)
                    if (!event) return null
                    
                    return (
                      <div key={participation.id} className="rounded-lg border border-border p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-sm">{event.name}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(event.date)} · {event.location}</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {getEventStatusIcon(participation.status)}
                            <span className="text-xs capitalize">{participation.status.replace("_", " ")}</span>
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
            </ScrollArea>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="m-0 min-h-0 flex-1 overflow-hidden px-6 pt-4">
            <ScrollArea className="h-full min-h-0 pr-1">
              {campaignHistoryLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-20" />
                  ))}
                </div>
              ) : campaignHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No campaign history yet
                </p>
              ) : (
                <div className="space-y-3 pb-6">
                  {campaignHistory.map((campaign) => (
                    <div key={campaign.campaignId} className="rounded-lg border border-border p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm">{campaign.campaignName}</p>
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
            </ScrollArea>
          </TabsContent>

          <TabsContent value="finance" className="m-0 min-h-0 flex-1 overflow-hidden px-6 pt-4">
            <ScrollArea className="h-full min-h-0 pr-1">
              {invoicesLoading || registrationsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-20" />
                  ))}
                </div>
              ) : invoices.length === 0 && registrations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No registrations or invoices linked yet
                </p>
              ) : (
                <div className="space-y-4 pb-6">
                  {registrations.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Registrations</p>
                      {registrations.map((registration) => (
                        <div key={registration.id} className="rounded-lg border border-border p-3 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium text-sm">{registration.eventName}</p>
                              <p className="text-xs text-muted-foreground">
                                {registration.ticketType} · {registration.quantity} seat{registration.quantity !== 1 ? "s" : ""} · {registration.currency} {registration.totalAmount.toLocaleString()}
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
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Invoices</p>
                      {invoices.map((invoice) => (
                        <div key={invoice.id} className="rounded-lg border border-border p-3 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium text-sm">{invoice.invoiceNumber}</p>
                              <p className="text-xs text-muted-foreground">
                                {invoice.currency} {invoice.totalAmount.toLocaleString()} · due {formatDate(invoice.dueDate)}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={invoice.paymentStatus === "paid" ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"}
                            >
                              {invoice.paymentStatus.replace("_", " ")}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Paid: {invoice.currency} {invoice.amountPaid.toLocaleString()} · Balance: {invoice.currency} {invoice.balanceDue.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
