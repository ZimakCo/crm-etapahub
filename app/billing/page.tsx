"use client"

import { useState } from "react"
import Link from "next/link"
import { useInvoices } from "@/lib/hooks"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CircleAlert,
  Plus,
  Search,
  FileText,
  CircleDollarSign,
  Clock,
  UserRound,
} from "lucide-react"
import type { InvoiceStatus, PaymentStatus } from "@/lib/types"

const statusColors: Record<InvoiceStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  issued: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  partially_paid: "bg-amber-100 text-amber-700",
  overdue: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
  refunded: "bg-purple-100 text-purple-700",
}

const paymentStatusColors: Record<PaymentStatus, string> = {
  unpaid: "bg-red-100 text-red-700",
  partially_paid: "bg-amber-100 text-amber-700",
  paid: "bg-green-100 text-green-700",
  refunded: "bg-purple-100 text-purple-700",
  cancelled: "bg-gray-100 text-gray-500",
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
    month: 'short',
    day: 'numeric',
  })
}

export default function BillingPage() {
  const { invoices, isLoading } = useInvoices()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.company.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Calculate summary stats
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0)
  const totalPending = invoices.filter(inv => inv.status === 'issued' || inv.status === 'partially_paid')
    .reduce((sum, inv) => sum + inv.balanceDue, 0)
  const totalOverdue = invoices.filter(inv => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.balanceDue, 0)

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Billing</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <Button asChild>
            <Link href="/billing/new">
              <Plus className="mr-2 size-4" />
              New Invoice
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">Billing Ledger</h1>
            <p className="text-sm text-muted-foreground">
              Compact view of invoices generated from registrations, focused on what is still open and what has been paid.
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
                <FileText className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-2xl font-bold">{formatCurrency(totalInvoiced, 'EUR')}</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                <CircleDollarSign className="size-4 text-green-600" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid, 'EUR')}</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="size-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-2xl font-bold text-amber-600">{formatCurrency(totalPending, 'EUR')}</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <CircleAlert className="size-4 text-red-600" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-2xl font-bold text-red-600">{formatCurrency(totalOverdue, 'EUR')}</div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-dashed">
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Billing starts from registrations. The team confirms the registration first, creates the invoice from it, then records payments manually on the invoice detail page.
            </CardContent>
          </Card>

          {/* Filters */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partially_paid">Partially Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Invoices Table */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Ledger</CardTitle>
              <CardDescription>
                A tighter, more operational list of billing records tied to registrations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-36 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  {filteredInvoices.map((invoice) => (
                    <Link
                      key={invoice.id}
                      href={`/billing/${invoice.id}`}
                      className="group block rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/40"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold">{invoice.invoiceNumber}</p>
                            <Badge variant="secondary" className={statusColors[invoice.status]}>
                              {invoice.status.replace("_", " ")}
                            </Badge>
                            <Badge variant="secondary" className={paymentStatusColors[invoice.paymentStatus]}>
                              {invoice.paymentStatus.replace("_", " ")}
                            </Badge>
                          </div>

                          <div className="grid gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <UserRound className="size-4" />
                              <span className="font-medium text-foreground">{invoice.contactName}</span>
                              <span>{invoice.contactEmail}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Building2 className="size-4" />
                              <span className="font-medium text-foreground">{invoice.company.name}</span>
                              <span>{invoice.company.city}, {invoice.company.country}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CalendarDays className="size-4" />
                              <span className="font-medium text-foreground">{invoice.eventName}</span>
                              <span>issued {formatDate(invoice.invoiceDate)}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span>Registration:</span>
                            <span className="rounded-md bg-muted px-2 py-1 font-mono text-foreground">
                              {invoice.registrationId}
                            </span>
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[360px]">
                          <div className="rounded-lg border border-border p-3">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total</p>
                            <p className="mt-1 font-semibold">{formatCurrency(invoice.totalAmount, invoice.currency)}</p>
                          </div>
                          <div className="rounded-lg border border-border p-3">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Paid</p>
                            <p className="mt-1 font-semibold text-green-700">
                              {formatCurrency(invoice.amountPaid, invoice.currency)}
                            </p>
                          </div>
                          <div className="rounded-lg border border-border p-3">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Balance</p>
                            <p className={`mt-1 font-semibold ${invoice.balanceDue > 0 ? "text-amber-700" : "text-green-700"}`}>
                              {formatCurrency(invoice.balanceDue, invoice.currency)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm">
                        <div className="flex flex-wrap gap-4 text-muted-foreground">
                          <span>Due {formatDate(invoice.dueDate)}</span>
                          <span>Event billing record</span>
                        </div>
                        <div className="flex items-center gap-2 font-medium text-primary">
                          Open invoice
                          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </Link>
                  ))}

                  {filteredInvoices.length === 0 && (
                    <div className="py-10 text-center text-muted-foreground">
                      No invoices found
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
