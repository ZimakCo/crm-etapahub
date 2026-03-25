"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  Building2,
  ClipboardList,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Phone,
  Plus,
} from "lucide-react"
import { useCompany, useContactsByCompany, useInvoices, useRegistrationsByCompany } from "@/lib/hooks"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function formatMoney(amount: number, currency = "EUR") {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function CompanyDetailPage() {
  const params = useParams<{ id: string }>()
  const companyId = typeof params.id === "string" ? params.id : null
  const { company, isLoading } = useCompany(companyId)
  const { contacts, isLoading: contactsLoading } = useContactsByCompany(companyId)
  const { registrations, isLoading: registrationsLoading } = useRegistrationsByCompany(companyId)
  const { invoices, isLoading: invoicesLoading } = useInvoices()

  const companyInvoices = useMemo(
    () => invoices.filter((invoice) => invoice.companyId === companyId),
    [companyId, invoices]
  )

  const outstandingBalance = companyInvoices.reduce((sum, invoice) => sum + invoice.balanceDue, 0)
  const totalInvoiced = companyInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0)
  const summaryCurrency = companyInvoices[0]?.currency ?? "EUR"

  if (isLoading) {
    return (
      <>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Company</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <div className="mx-auto flex max-w-6xl flex-col gap-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-28 rounded-xl" />
              ))}
            </div>
            <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
              <Skeleton className="h-96 rounded-xl" />
              <Skeleton className="h-[32rem] rounded-xl" />
            </div>
          </div>
        </main>
      </>
    )
  }

  if (!company) {
    return (
      <>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/companies">Companies</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Not found</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-3xl">
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
                <Building2 className="size-8 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="font-medium">Company not found</p>
                  <p className="text-sm text-muted-foreground">
                    The requested account record does not exist in the CRM.
                  </p>
                </div>
                <Button asChild>
                  <Link href="/companies">Back to Companies</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/companies">Companies</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{company.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
                <Link href="/companies">
                  <ArrowLeft className="size-4" />
                  Back to Companies
                </Link>
              </Button>
              <h1 className="text-2xl font-semibold tracking-tight">{company.name}</h1>
              <p className="text-sm text-muted-foreground">
                Account record for linked contacts, registrations and billing.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link href={`/registrations/new?companyId=${company.id}`}>
                  <ClipboardList className="size-4" />
                  New Registration
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/contacts/new?company=${encodeURIComponent(company.name)}`}>
                  <Plus className="size-4" />
                  Add Contact
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Linked Contacts</p>
                <p className="mt-1 text-2xl font-semibold">{contacts.length}</p>
                <p className="text-xs text-muted-foreground">People associated with this account.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Registrations</p>
                <p className="mt-1 text-2xl font-semibold">{registrations.length}</p>
                <p className="text-xs text-muted-foreground">Event orders billed to this company.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Total Invoiced</p>
                <p className="mt-1 text-2xl font-semibold">{formatMoney(totalInvoiced, summaryCurrency)}</p>
                <p className="text-xs text-muted-foreground">All invoices currently linked to this account.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="mt-1 text-2xl font-semibold">{formatMoney(outstandingBalance, summaryCurrency)}</p>
                <p className="text-xs text-muted-foreground">Balance still open on unpaid or partial invoices.</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
            <Card>
              <CardHeader>
                <CardTitle>Company Profile</CardTitle>
                <CardDescription>
                  Central account data reused by contacts, registrations and billing.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-border p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Industry</p>
                  <p className="mt-1 font-medium">{company.industry || "Not set"}</p>
                </div>
                <div className="space-y-3 text-sm">
                  {company.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="size-4 text-muted-foreground" />
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        {company.website}
                        <ExternalLink className="size-3" />
                      </a>
                    </div>
                  )}
                  {company.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="size-4 text-muted-foreground" />
                      <span>{company.phone}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 size-4 text-muted-foreground" />
                    <span>
                      {[company.address, company.city, company.postalCode, company.country]
                        .filter(Boolean)
                        .join(", ") || "Address not set"}
                    </span>
                  </div>
                </div>
                <Separator />
                <div className="space-y-3 text-sm">
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">VAT ID</p>
                    <p className="mt-1 font-medium">{company.vatId || "Not set"}</p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Tax ID</p>
                    <p className="mt-1 font-medium">{company.taxId || "Not set"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Linked Contacts</CardTitle>
                  <CardDescription>
                    Primary people tied to this company for commercial follow-up and campaign usage.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {contactsLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <Skeleton key={index} className="h-14 rounded-md" />
                      ))}
                    </div>
                  ) : contacts.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border px-6 py-12 text-center">
                      <p className="font-medium">No contacts linked yet</p>
                      <p className="text-sm text-muted-foreground">
                        Add a contact from this company to start building the account record.
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Contact</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Owner</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contacts.map((contact) => (
                          <TableRow key={contact.id}>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <span className="font-medium">
                                  {contact.firstName} {contact.lastName}
                                </span>
                                <span className="text-xs text-muted-foreground">{contact.jobTitle || "No title"}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-2 hover:underline">
                                <Mail className="size-4 text-muted-foreground" />
                                {contact.email}
                              </a>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {contact.subscriptionStatus}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {contact.ownerName || "Unassigned"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Registrations and Billing</CardTitle>
                  <CardDescription>
                    Event activity and invoice status billed to this company.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Registrations</p>
                    {registrationsLoading ? (
                      Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton key={index} className="h-20 rounded-md" />
                      ))
                    ) : registrations.length === 0 ? (
                      <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                        No registrations billed to this account yet.
                      </p>
                    ) : (
                      registrations.map((registration) => (
                        <div key={registration.id} className="rounded-lg border border-border p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium">{registration.eventName}</p>
                              <p className="text-sm text-muted-foreground">
                                {registration.contactName} · {registration.ticketType} · {registration.quantity} seat
                                {registration.quantity !== 1 ? "s" : ""}
                              </p>
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {registration.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Invoices</p>
                    {invoicesLoading ? (
                      Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton key={index} className="h-20 rounded-md" />
                      ))
                    ) : companyInvoices.length === 0 ? (
                      <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                        No invoices linked to this company yet.
                      </p>
                    ) : (
                      companyInvoices.map((invoice) => (
                        <div key={invoice.id} className="rounded-lg border border-border p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium">{invoice.invoiceNumber}</p>
                              <p className="text-sm text-muted-foreground">
                                {invoice.eventName} · due {new Date(invoice.dueDate).toLocaleDateString("en-US")}
                              </p>
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {invoice.paymentStatus.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span>Total {formatMoney(invoice.totalAmount, invoice.currency)}</span>
                            <span>Balance {formatMoney(invoice.balanceDue, invoice.currency)}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
