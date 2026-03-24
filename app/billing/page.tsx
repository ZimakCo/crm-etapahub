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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Plus,
  Search,
  FileText,
  CircleDollarSign,
  Clock,
  AlertCircle,
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
        <div className="mx-auto max-w-7xl space-y-6">
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
                <AlertCircle className="size-4 text-red-600" />
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
              <CardTitle>Invoices</CardTitle>
              <CardDescription>
                Manage invoices generated from registrations and keep manual payment records aligned.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Registration</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Billing Company</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvoices.map((invoice) => (
                        <TableRow key={invoice.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell>
                            <Link 
                              href={`/billing/${invoice.id}`}
                              className="font-medium text-primary hover:underline"
                            >
                              {invoice.invoiceNumber}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Link 
                              href={`/registrations/${invoice.registrationId}`}
                              className="text-xs font-mono text-muted-foreground hover:text-primary hover:underline"
                            >
                              {invoice.registrationId}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{invoice.contactName}</div>
                            <div className="text-xs text-muted-foreground">{invoice.contactEmail}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{invoice.company.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {invoice.company.city}, {invoice.company.country}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Link 
                              href={`/events/${invoice.eventId}`}
                              className="text-sm hover:text-primary hover:underline"
                            >
                              {invoice.eventName}
                            </Link>
                          </TableCell>
                          <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(invoice.totalAmount, invoice.currency)}
                          </TableCell>
                          <TableCell>
                            {invoice.amountPaid > 0 ? (
                              <span className="text-green-600 font-medium">
                                {formatCurrency(invoice.amountPaid, invoice.currency)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {invoice.balanceDue > 0 ? (
                              <span className="text-amber-600 font-medium">
                                {formatCurrency(invoice.balanceDue, invoice.currency)}
                              </span>
                            ) : (
                              <span className="text-green-600">Paid</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={statusColors[invoice.status]}>
                              {invoice.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredInvoices.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                            No invoices found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
