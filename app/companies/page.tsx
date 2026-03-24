"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowRight, Building2, ClipboardList, Plus, Search, Users, Wallet } from "lucide-react"
import { useCompanies, useContacts, useInvoices, useRegistrations } from "@/lib/hooks"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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

export default function CompaniesPage() {
  const { companies, isLoading } = useCompanies()
  const { contacts } = useContacts()
  const { registrations } = useRegistrations()
  const { invoices } = useInvoices()
  const [searchQuery, setSearchQuery] = useState("")

  const companyRows = useMemo(
    () =>
      companies.map((company) => {
        const linkedContacts = contacts.filter(
          (contact) =>
            contact.companyId === company.id ||
            (!contact.companyId && contact.company.toLowerCase() === company.name.toLowerCase())
        )
        const linkedRegistrations = registrations.filter((registration) => registration.companyId === company.id)
        const linkedInvoices = invoices.filter((invoice) => invoice.companyId === company.id)
        const outstandingBalance = linkedInvoices.reduce((sum, invoice) => sum + invoice.balanceDue, 0)
        const totalInvoiced = linkedInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0)

        return {
          company,
          linkedContacts,
          linkedRegistrations,
          linkedInvoices,
          outstandingBalance,
          totalInvoiced,
          currency: linkedInvoices[0]?.currency ?? "EUR",
        }
      }),
    [companies, contacts, registrations, invoices]
  )

  const filteredCompanies = companyRows.filter(({ company }) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return [company.name, company.industry, company.country, company.city]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(query))
  })

  const companiesWithContacts = filteredCompanies.filter((row) => row.linkedContacts.length > 0).length
  const companiesWithOpenBalance = filteredCompanies.filter((row) => row.outstandingBalance > 0).length
  const totalOutstanding = filteredCompanies.reduce((sum, row) => sum + row.outstandingBalance, 0)

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Companies</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <Button asChild>
            <Link href="/companies/new">
              <Plus className="size-4" />
              New Company
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">Companies</h1>
            <p className="text-sm text-muted-foreground">
              Keep company records separate from contacts, then attach people, registrations and billing to the right account.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Companies in CRM</p>
                <p className="mt-1 text-2xl font-semibold">{filteredCompanies.length}</p>
                <p className="text-xs text-muted-foreground">Accounts currently visible in this workspace.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Companies with Contacts</p>
                <p className="mt-1 text-2xl font-semibold">{companiesWithContacts}</p>
                <p className="text-xs text-muted-foreground">Accounts already connected to at least one person.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Open Balance</p>
                <p className="mt-1 text-2xl font-semibold">{formatMoney(totalOutstanding)}</p>
                <p className="text-xs text-muted-foreground">
                  {companiesWithOpenBalance} compan{companiesWithOpenBalance === 1 ? "y" : "ies"} with unpaid invoices.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Company Directory</CardTitle>
              <CardDescription>
                Use this directory before importing contacts, so account names stay clean and reusable across events and billing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search by company, industry, city or country"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>

              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-14 rounded-md" />
                  ))}
                </div>
              ) : filteredCompanies.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border px-6 py-12 text-center">
                  <Building2 className="mx-auto size-8 text-muted-foreground" />
                  <p className="mt-4 font-medium">No company found</p>
                  <p className="text-sm text-muted-foreground">
                    Create a company record first, then attach contacts and billing to it.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Contacts</TableHead>
                      <TableHead>Registrations</TableHead>
                      <TableHead>Billing</TableHead>
                      <TableHead className="text-right">Open</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCompanies.map((row) => (
                      <TableRow key={row.company.id}>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Link href={`/companies/${row.company.id}`} className="font-medium hover:underline">
                              {row.company.name}
                            </Link>
                            <div className="flex flex-wrap gap-2">
                              {row.company.industry && <Badge variant="secondary">{row.company.industry}</Badge>}
                              {row.company.vatId && <Badge variant="outline">VAT on file</Badge>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {[row.company.city, row.company.country].filter(Boolean).join(", ") || "Not set"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="size-4 text-muted-foreground" />
                            {row.linkedContacts.length}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <ClipboardList className="size-4 text-muted-foreground" />
                            {row.linkedRegistrations.length}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {row.linkedInvoices.length > 0
                            ? formatMoney(row.totalInvoiced, row.currency)
                            : "No invoices"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {formatMoney(row.outstandingBalance, row.currency)}
                            </span>
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/companies/${row.company.id}`}>
                                <ArrowRight className="size-4" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
