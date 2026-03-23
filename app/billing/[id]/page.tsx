"use client"

import { useState, use } from "react"
import Link from "next/link"
import { useInvoice, usePayments } from "@/lib/hooks"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import {
  ArrowLeft,
  Edit,
  Plus,
  Printer,
  Send,
  Building2,
  User,
  Calendar,
  CreditCard,
  FileText,
  AlertCircle,
} from "lucide-react"
import type { InvoiceStatus, PaymentStatus, PaymentMethod } from "@/lib/types"

const statusColors: Record<InvoiceStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  issued: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  partially_paid: "bg-amber-100 text-amber-700",
  overdue: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
  refunded: "bg-purple-100 text-purple-700",
}

const paymentMethodLabels: Record<PaymentMethod, string> = {
  bank_transfer: "Bank Transfer",
  card: "Card",
  cash: "Cash",
  other: "Other",
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

export default function InvoiceDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = use(params)
  const { invoice, isLoading: invoiceLoading } = useInvoice(resolvedParams.id)
  const { payments, isLoading: paymentsLoading } = usePayments(resolvedParams.id)
  const [addPaymentOpen, setAddPaymentOpen] = useState(false)

  if (invoiceLoading) {
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

  if (!invoice) {
    return (
      <>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/billing">Billing</BreadcrumbLink>
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
            <h2 className="text-xl font-semibold mb-2">Invoice Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The invoice you are looking for does not exist.
            </p>
            <Button asChild>
              <Link href="/billing">
                <ArrowLeft className="mr-2 size-4" />
                Back to Billing
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
              <BreadcrumbLink href="/billing">Billing</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{invoice.invoiceNumber}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 size-4" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Send className="mr-2 size-4" />
            Send
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="mr-2 size-4" />
            Edit
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/billing">
              <ArrowLeft className="mr-2 size-4" />
              Back to Invoices
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">{invoice.invoiceNumber}</h1>
            <Badge variant="secondary" className={statusColors[invoice.status]}>
              {invoice.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="size-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Invoice Date</p>
                        <p className="font-medium">{formatDate(invoice.invoiceDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="size-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Due Date</p>
                        <p className="font-medium">{formatDate(invoice.dueDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FileText className="size-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Related Event</p>
                        <Link href={`/events/${invoice.eventId}`} className="font-medium text-primary hover:underline">
                          {invoice.eventName}
                        </Link>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FileText className="size-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Registration</p>
                        <Link href={`/registrations/${invoice.registrationId}`} className="font-mono text-sm text-primary hover:underline">
                          {invoice.registrationId}
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <User className="size-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Contact</p>
                        <p className="font-medium">{invoice.contactName}</p>
                        <p className="text-sm text-muted-foreground">{invoice.contactEmail}</p>
                      </div>
                    </div>
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
                    <p className="font-semibold text-lg">{invoice.company.name}</p>
                    <p className="text-muted-foreground mt-2">
                      {invoice.company.address}<br />
                      {invoice.company.postalCode} {invoice.company.city}<br />
                      {invoice.company.country}
                    </p>
                  </div>
                  <div className="space-y-3">
                    {invoice.company.vatId && (
                      <div>
                        <p className="text-sm text-muted-foreground">VAT ID</p>
                        <p className="font-medium">{invoice.company.vatId}</p>
                      </div>
                    )}
                    {invoice.company.taxId && (
                      <div>
                        <p className="text-sm text-muted-foreground">Tax ID</p>
                        <p className="font-medium">{invoice.company.taxId}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader>
                <CardTitle>Line Items</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.lineItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unitPrice, invoice.currency)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(item.totalPrice, invoice.currency)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4 space-y-2 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax ({(invoice.taxRate * 100).toFixed(1)}%)</span>
                    <span>{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>{formatCurrency(invoice.totalAmount, invoice.currency)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>All payments recorded for this invoice</CardDescription>
                </div>
                <Dialog open={addPaymentOpen} onOpenChange={setAddPaymentOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-2 size-4" />
                      Add Payment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Record Payment</DialogTitle>
                      <DialogDescription>
                        Manually record a payment for invoice {invoice.invoiceNumber}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="amount">Amount</Label>
                          <Input 
                            id="amount" 
                            type="number" 
                            placeholder="0.00"
                            defaultValue={invoice.balanceDue > 0 ? invoice.balanceDue : undefined}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="currency">Currency</Label>
                          <Select defaultValue={invoice.currency}>
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
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="paymentDate">Payment Date</Label>
                          <Input id="paymentDate" type="date" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="paymentMethod">Payment Method</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                              <SelectItem value="card">Card</SelectItem>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reference">Payment Reference (Optional)</Label>
                        <Input id="reference" placeholder="e.g., TRF-2026-001234" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea id="notes" placeholder="Add any notes about this payment..." />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setAddPaymentOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => setAddPaymentOpen(false)}>
                        Record Payment
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {paymentsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : payments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                          <TableCell className={payment.amount < 0 ? "text-red-600" : "text-green-600"}>
                            {formatCurrency(payment.amount, payment.currency)}
                          </TableCell>
                          <TableCell>{paymentMethodLabels[payment.paymentMethod]}</TableCell>
                          <TableCell className="font-mono text-sm">
                            {payment.paymentReference || "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={
                              payment.status === 'completed' ? 'bg-green-100 text-green-700' :
                              payment.status === 'refunded' ? 'bg-purple-100 text-purple-700' :
                              payment.status === 'failed' ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-700'
                            }>
                              {payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {payment.notes || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="mx-auto size-10 mb-3 opacity-50" />
                    <p>No payments recorded yet</p>
                    <p className="text-sm mt-1">Click "Add Payment" to record a payment</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Admin Notes */}
            {invoice.adminNotes && (
              <Card>
                <CardHeader>
                  <CardTitle>Admin Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{invoice.adminNotes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Amount Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Amount Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    {formatCurrency(invoice.subtotal, invoice.currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Tax ({(invoice.taxRate * 100).toFixed(1)}%)</span>
                  <span className="font-medium">
                    {formatCurrency(invoice.taxAmount, invoice.currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-semibold text-lg">
                    {formatCurrency(invoice.totalAmount, invoice.currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-semibold text-lg text-green-600">
                    {formatCurrency(invoice.amountPaid, invoice.currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium">Balance Due</span>
                  <span className={`font-bold text-xl ${invoice.balanceDue > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                    {formatCurrency(invoice.balanceDue, invoice.currency)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {invoice.status === 'draft' && (
                  <Button className="w-full" variant="default">
                    <Send className="mr-2 size-4" />
                    Issue Invoice
                  </Button>
                )}
                {(invoice.status === 'issued' || invoice.status === 'partially_paid' || invoice.status === 'overdue') && (
                  <>
                    <Button className="w-full" variant="default" onClick={() => setAddPaymentOpen(true)}>
                      <Plus className="mr-2 size-4" />
                      Record Payment
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Send className="mr-2 size-4" />
                      Send Reminder
                    </Button>
                  </>
                )}
                <Button className="w-full" variant="outline">
                  <Edit className="mr-2 size-4" />
                  Edit Invoice
                </Button>
                <Button className="w-full" variant="outline">
                  <Printer className="mr-2 size-4" />
                  Download PDF
                </Button>
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
                      <p className="text-sm font-medium">Invoice Created</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(invoice.createdAt)}</p>
                    </div>
                  </div>
                  {invoice.status !== 'draft' && (
                    <div className="flex gap-3">
                      <div className="size-2 rounded-full bg-blue-500 mt-2" />
                      <div>
                        <p className="text-sm font-medium">Invoice Issued</p>
                        <p className="text-xs text-muted-foreground">{formatDateTime(invoice.invoiceDate)}</p>
                      </div>
                    </div>
                  )}
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex gap-3">
                      <div className={`size-2 rounded-full mt-2 ${payment.amount < 0 ? 'bg-purple-500' : 'bg-green-500'}`} />
                      <div>
                        <p className="text-sm font-medium">
                          {payment.amount < 0 ? 'Refund Processed' : 'Payment Received'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(Math.abs(payment.amount), payment.currency)} - {formatDateTime(payment.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-3">
                    <div className="size-2 rounded-full bg-muted mt-2" />
                    <div>
                      <p className="text-sm font-medium">Last Updated</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(invoice.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}
