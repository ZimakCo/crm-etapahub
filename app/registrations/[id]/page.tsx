"use client"

import { use, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useRegistration, useInvoice } from "@/lib/hooks"
import { updateRegistrationStatus } from "@/lib/crm-repository"
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft,
  Edit,
  Calendar,
  Building2,
  User,
  Users,
  FileText,
  Ticket,
  AlertCircle,
  Mail,
} from "lucide-react"
import type { RegistrationStatus, RegistrationTicketType } from "@/lib/types"

const statusColors: Record<RegistrationStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  waitlist: "bg-blue-100 text-blue-700",
}

const ticketTypeColors: Record<RegistrationTicketType, string> = {
  standard: "bg-muted text-muted-foreground",
  vip: "bg-purple-100 text-purple-700",
  speaker: "bg-blue-100 text-blue-700",
  sponsor: "bg-amber-100 text-amber-700",
  exhibitor: "bg-green-100 text-green-700",
  press: "bg-cyan-100 text-cyan-700",
  staff: "bg-gray-100 text-gray-500",
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function RegistrationDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [isUpdating, startTransition] = useTransition()
  const { registration, isLoading: registrationLoading, mutate: mutateRegistration } = useRegistration(resolvedParams.id)
  const { invoice, mutate: mutateInvoice } = useInvoice(registration?.invoiceId || null)

  const handleStatusUpdate = (nextStatus: "confirmed" | "cancelled") => {
    if (!registration) {
      return
    }

    startTransition(async () => {
      try {
        const updatedRegistration = await updateRegistrationStatus(registration.id, nextStatus)
        await mutateRegistration(updatedRegistration, false)
        await mutateInvoice()
        router.refresh()
        toast.success(
          nextStatus === "confirmed" ? "Registration confirmed" : "Registration cancelled"
        )
      } catch (error) {
        console.error(error)
        toast.error("Could not update the registration")
      }
    })
  }

  if (registrationLoading) {
    return (
      <>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Skeleton className="h-5 w-48" />
        </header>
        <main className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
      </>
    )
  }

  if (!registration) {
    return (
      <>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/registrations">Registrations</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Not Found</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="mx-auto size-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Registration Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The registration you are looking for does not exist.
            </p>
            <Button asChild>
              <Link href="/registrations">
                <ArrowLeft className="mr-2 size-4" />
                Back to Registrations
              </Link>
            </Button>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/registrations">Registrations</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{registration.id}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a
              href={`mailto:${registration.contactEmail}?subject=${encodeURIComponent(`Registration update · ${registration.eventName}`)}`}
            >
              <Mail className="mr-2 size-4" />
              Send Confirmation
            </a>
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.info("Inline registration editing lands in the next phase.")}>
            <Edit className="mr-2 size-4" />
            Edit
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/registrations">
              <ArrowLeft className="mr-2 size-4" />
              Back to Registrations
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold font-mono">{registration.id}</h1>
            <Badge variant="secondary" className={statusColors[registration.status]}>
              {registration.status}
            </Badge>
            <Badge variant="secondary" className={ticketTypeColors[registration.ticketType]}>
              {registration.ticketType}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="size-5 text-muted-foreground" />
                  <CardTitle>Event</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Link href={`/events/${registration.eventId}`} className="text-xl font-semibold text-primary hover:underline">
                  {registration.eventName}
                </Link>
                <p className="text-sm text-muted-foreground mt-2">
                  Registered on {formatDate(registration.registeredAt)}
                </p>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="size-5 text-muted-foreground" />
                  <CardTitle>Primary Contact</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="font-semibold text-lg">{registration.contactName}</p>
                    <p className="text-muted-foreground">{registration.contactEmail}</p>
                  </div>
                  <div>
                    <Link 
                      href="/contacts"
                      className="text-sm text-primary hover:underline"
                    >
                      Open Contacts Workspace
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Billing Company */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Building2 className="size-5 text-muted-foreground" />
                  <CardTitle>Billing Company</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="font-semibold text-lg">{registration.company.name}</p>
                    <p className="text-muted-foreground mt-2">
                      {registration.company.address}<br />
                      {registration.company.postalCode} {registration.company.city}<br />
                      {registration.company.country}
                    </p>
                  </div>
                  <div className="space-y-3">
                    {registration.company.vatId && (
                      <div>
                        <p className="text-sm text-muted-foreground">VAT ID</p>
                        <p className="font-medium">{registration.company.vatId}</p>
                      </div>
                    )}
                    {registration.company.taxId && (
                      <div>
                        <p className="text-sm text-muted-foreground">Tax ID</p>
                        <p className="font-medium">{registration.company.taxId}</p>
                      </div>
                    )}
                    {registration.company.industry && (
                      <div>
                        <p className="text-sm text-muted-foreground">Industry</p>
                        <p className="font-medium">{registration.company.industry}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attendees */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="size-5 text-muted-foreground" />
                  <CardTitle>Attendees ({registration.quantity})</CardTitle>
                </div>
                <CardDescription>
                  All attendees included in this registration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Job Title</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Primary contact */}
                    <TableRow>
                      <TableCell className="font-medium">
                        {registration.contactName}
                        <Badge variant="outline" className="ml-2 text-xs">Primary</Badge>
                      </TableCell>
                      <TableCell>{registration.contactEmail}</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                    {/* Additional attendees */}
                    {registration.additionalAttendees?.map((attendee, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{attendee.name}</TableCell>
                        <TableCell>{attendee.email}</TableCell>
                        <TableCell>{attendee.jobTitle || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Special Requirements */}
            {registration.specialRequirements && (
              <Card>
                <CardHeader>
                  <CardTitle>Special Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{registration.specialRequirements}</p>
                </CardContent>
              </Card>
            )}

            {/* Admin Notes */}
            {registration.adminNotes && (
              <Card>
                <CardHeader>
                  <CardTitle>Admin Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{registration.adminNotes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ticket Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Ticket className="size-5 text-muted-foreground" />
                  <CardTitle>Ticket Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Ticket Type</span>
                  <Badge variant="secondary" className={ticketTypeColors[registration.ticketType]}>
                    {registration.ticketType}
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Price per Ticket</span>
                  <span className="font-medium">
                    {formatCurrency(registration.ticketPrice, registration.currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Quantity</span>
                  <span className="font-medium">{registration.quantity}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium">Total Amount</span>
                  <span className="font-bold text-xl">
                    {formatCurrency(registration.totalAmount, registration.currency)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Invoice Link */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="size-5 text-muted-foreground" />
                  <CardTitle>Invoice</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {registration.invoiceId ? (
                  <div className="space-y-4">
                    <Link 
                      href={`/billing/${registration.invoiceId}`}
                      className="text-primary font-mono hover:underline"
                    >
                      {invoice?.invoiceNumber || registration.invoiceId}
                    </Link>
                    {invoice && (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status</span>
                          <Badge variant="secondary" className={
                            invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                            invoice.status === 'overdue' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }>
                            {invoice.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Balance Due</span>
                          <span className={invoice.balanceDue > 0 ? 'text-amber-600 font-medium' : 'text-green-600'}>
                            {formatCurrency(invoice.balanceDue, invoice.currency)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground text-sm mb-3">No invoice created yet</p>
                    <Button size="sm" asChild>
                      <Link href={`/billing/new?registrationId=${registration.id}`}>
                        <FileText className="mr-2 size-4" />
                        Create Invoice
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="size-2 rounded-full bg-primary mt-2" />
                    <div>
                      <p className="text-sm font-medium">Registration Created</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(registration.createdAt)}</p>
                    </div>
                  </div>
                  {registration.confirmedAt && (
                    <div className="flex gap-3">
                      <div className="size-2 rounded-full bg-green-500 mt-2" />
                      <div>
                        <p className="text-sm font-medium">Registration Confirmed</p>
                        <p className="text-xs text-muted-foreground">{formatDateTime(registration.confirmedAt)}</p>
                      </div>
                    </div>
                  )}
                  {registration.cancelledAt && (
                    <div className="flex gap-3">
                      <div className="size-2 rounded-full bg-red-500 mt-2" />
                      <div>
                        <p className="text-sm font-medium">Registration Cancelled</p>
                        <p className="text-xs text-muted-foreground">{formatDateTime(registration.cancelledAt)}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <div className="size-2 rounded-full bg-muted mt-2" />
                    <div>
                      <p className="text-sm font-medium">Last Updated</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(registration.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {registration.status === 'pending' && (
                  <Button className="w-full" variant="default" onClick={() => handleStatusUpdate("confirmed")} disabled={isUpdating}>
                    Confirm Registration
                  </Button>
                )}
                <Button className="w-full" variant="outline" asChild>
                  <a
                    href={`mailto:${registration.contactEmail}?subject=${encodeURIComponent(`Registration update · ${registration.eventName}`)}`}
                  >
                    <Mail className="mr-2 size-4" />
                    Send Confirmation Email
                  </a>
                </Button>
                <Button className="w-full" variant="outline" onClick={() => toast.info("Inline registration editing lands in the next phase.")}>
                  <Edit className="mr-2 size-4" />
                  Edit Registration
                </Button>
                {registration.status !== 'cancelled' && (
                  <Button className="w-full" variant="destructive" onClick={() => handleStatusUpdate("cancelled")} disabled={isUpdating}>
                    Cancel Registration
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}
