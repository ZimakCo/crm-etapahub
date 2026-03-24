"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, LoaderCircle } from "lucide-react"
import { toast } from "sonner"
import { createRegistration } from "@/lib/crm-repository"
import { useCompanies, useContacts, useEvents } from "@/lib/hooks"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function parseAdditionalAttendees(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name = "", email = "", jobTitle = ""] = line.split("|").map((part) => part.trim())
      return { name, email, jobTitle: jobTitle || undefined }
    })
    .filter((attendee) => attendee.name && attendee.email)
}

function NewRegistrationPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { events } = useEvents()
  const { contacts } = useContacts()
  const { companies } = useCompanies()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    eventId: searchParams.get("eventId") ?? "",
    contactId: searchParams.get("contactId") ?? "",
    companyId: "",
    ticketType: "standard",
    ticketPrice: "650",
    currency: "EUR",
    quantity: "1",
    status: "pending",
    specialRequirements: "",
    adminNotes: "",
    additionalAttendees: "",
  })

  const selectedContact = useMemo(
    () => contacts.find((contact) => contact.id === formData.contactId) ?? null,
    [contacts, formData.contactId]
  )
  const selectedCompany = useMemo(
    () => companies.find((company) => company.id === formData.companyId) ?? null,
    [companies, formData.companyId]
  )
  const selectedEvent = useMemo(
    () => events.find((event) => event.id === formData.eventId) ?? null,
    [events, formData.eventId]
  )

  useEffect(() => {
    if (!selectedContact) {
      return
    }

    if (selectedContact.companyId) {
      setFormData((current) => ({
        ...current,
        companyId: current.companyId || selectedContact.companyId || "",
      }))
      return
    }

    const matchedCompany = companies.find(
      (company) => company.name.toLowerCase() === selectedContact.company.toLowerCase()
    )

    if (matchedCompany) {
      setFormData((current) => ({
        ...current,
        companyId: current.companyId || matchedCompany.id,
      }))
    }
  }, [companies, selectedContact])

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const registration = await createRegistration({
        eventId: formData.eventId,
        contactId: formData.contactId,
        companyId: formData.companyId,
        ticketType: formData.ticketType as
          | "standard"
          | "vip"
          | "speaker"
          | "sponsor"
          | "exhibitor"
          | "press"
          | "staff",
        ticketPrice: Number(formData.ticketPrice),
        currency: formData.currency as "EUR" | "USD" | "GBP" | "CHF",
        quantity: Number(formData.quantity),
        status: formData.status as "pending" | "confirmed" | "cancelled" | "waitlist",
        specialRequirements: formData.specialRequirements || undefined,
        adminNotes: formData.adminNotes || undefined,
        additionalAttendees: parseAdditionalAttendees(formData.additionalAttendees),
      })

      toast.success("Registration created")
      router.push(`/registrations/${registration.id}`)
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Could not create the registration")
    } finally {
      setIsSubmitting(false)
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
              <BreadcrumbLink href="/registrations">Registrations</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>New Registration</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <Button variant="ghost" size="sm" asChild className="w-fit -ml-2">
            <Link href="/registrations">
              <ArrowLeft className="size-4" />
              Back to Registrations
            </Link>
          </Button>

          <form className="grid gap-6 lg:grid-cols-[1fr_320px]" onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Create Registration</CardTitle>
                <CardDescription>
                  Registrations are the operational link between event, main contact, billing company and future invoice.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Event folder</Label>
                    <Select value={formData.eventId} onValueChange={(value) => updateField("eventId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an event" />
                      </SelectTrigger>
                      <SelectContent>
                        {events.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Main contact</Label>
                    <Select value={formData.contactId} onValueChange={(value) => updateField("contactId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a contact" />
                      </SelectTrigger>
                      <SelectContent>
                        {contacts.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.firstName} {item.lastName} · {item.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Billing company</Label>
                    <Select value={formData.companyId} onValueChange={(value) => updateField("companyId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a billing company" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(value) => updateField("status", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="waitlist">Waitlist</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label>Ticket type</Label>
                    <Select value={formData.ticketType} onValueChange={(value) => updateField("ticketType", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                        <SelectItem value="speaker">Speaker</SelectItem>
                        <SelectItem value="sponsor">Sponsor</SelectItem>
                        <SelectItem value="exhibitor">Exhibitor</SelectItem>
                        <SelectItem value="press">Press</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ticketPrice">Ticket price</Label>
                    <Input id="ticketPrice" type="number" min="0" step="0.01" value={formData.ticketPrice} onChange={(event) => updateField("ticketPrice", event.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select value={formData.currency} onValueChange={(value) => updateField("currency", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="CHF">CHF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Attendees</Label>
                    <Input id="quantity" type="number" min="1" value={formData.quantity} onChange={(event) => updateField("quantity", event.target.value)} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalAttendees">Additional attendees</Label>
                  <Textarea
                    id="additionalAttendees"
                    rows={5}
                    value={formData.additionalAttendees}
                    onChange={(event) => updateField("additionalAttendees", event.target.value)}
                    placeholder={"One attendee per line: Name | email@example.com | Job title"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialRequirements">Special requirements</Label>
                  <Textarea
                    id="specialRequirements"
                    rows={3}
                    value={formData.specialRequirements}
                    onChange={(event) => updateField("specialRequirements", event.target.value)}
                    placeholder="Food allergies, access needs, brochure handling, travel notes..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminNotes">Internal notes</Label>
                  <Textarea
                    id="adminNotes"
                    rows={4}
                    value={formData.adminNotes}
                    onChange={(event) => updateField("adminNotes", event.target.value)}
                    placeholder="Commercial owner, payment agreements, manual follow-up..."
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" asChild>
                    <Link href="/registrations">Cancel</Link>
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      isSubmitting || !formData.eventId || !formData.contactId || !formData.companyId
                    }
                  >
                    {isSubmitting && <LoaderCircle className="size-4 animate-spin" />}
                    Save Registration
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Why this record exists</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>This record is what your team uses to say: this contact is enrolled in this event, under this company, for this amount.</p>
                  <p>From here you can later generate the invoice, confirm the seat, and keep the participant history tied to the contact.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Current Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Event</p>
                    <p className="font-medium">{selectedEvent?.name ?? "Not selected"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Contact</p>
                    <p className="font-medium">
                      {selectedContact ? `${selectedContact.firstName} ${selectedContact.lastName}` : "Not selected"}
                    </p>
                    <p className="text-muted-foreground">{selectedContact?.email ?? ""}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Billing company</p>
                    <p className="font-medium">{selectedCompany?.name ?? "Not selected"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Estimated amount</p>
                    <p className="font-medium">
                      {(Number(formData.ticketPrice || 0) * Number(formData.quantity || 0)).toFixed(2)} {formData.currency}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}

export default function NewRegistrationPage() {
  return (
    <Suspense fallback={null}>
      <NewRegistrationPageContent />
    </Suspense>
  )
}
