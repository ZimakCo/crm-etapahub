"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, LoaderCircle, TriangleAlert } from "lucide-react"
import { toast } from "sonner"
import { createInvoice } from "@/lib/crm-repository"
import { useRegistrations } from "@/lib/hooks"
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

function toDateInputValue(value: Date) {
  return value.toISOString().slice(0, 10)
}

function NewInvoicePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { registrations } = useRegistrations()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    registrationId: searchParams.get("registrationId") ?? "",
    invoiceNumber: "",
    invoiceDate: toDateInputValue(new Date()),
    dueDate: toDateInputValue(new Date(Date.now() + 1000 * 60 * 60 * 24 * 14)),
    status: "draft",
    taxRate: "22",
    description: "",
    quantity: "1",
    unitPrice: "0",
    adminNotes: "",
    publicNotes: "",
  })

  const selectedRegistration = useMemo(
    () => registrations.find((registration) => registration.id === formData.registrationId) ?? null,
    [formData.registrationId, registrations]
  )

  useEffect(() => {
    if (!selectedRegistration) {
      return
    }

    setFormData((current) => ({
      ...current,
      description: `${selectedRegistration.eventName} · ${selectedRegistration.ticketType} registration`,
      quantity: String(selectedRegistration.quantity),
      unitPrice: String(selectedRegistration.ticketPrice),
    }))
  }, [selectedRegistration])

  const subtotal =
    Number(formData.quantity || 0) * Number(formData.unitPrice || 0)
  const taxAmount = subtotal * (Number(formData.taxRate || 0) / 100)
  const totalAmount = subtotal + taxAmount

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const invoice = await createInvoice({
        registrationId: formData.registrationId,
        invoiceNumber: formData.invoiceNumber || undefined,
        invoiceDate: formData.invoiceDate,
        dueDate: formData.dueDate,
        status: formData.status as
          | "draft"
          | "issued"
          | "paid"
          | "partially_paid"
          | "overdue"
          | "cancelled"
          | "refunded",
        taxRate: Number(formData.taxRate) / 100,
        currency: selectedRegistration?.currency ?? "EUR",
        adminNotes: formData.adminNotes || undefined,
        publicNotes: formData.publicNotes || undefined,
        lineItems: [
          {
            description: formData.description,
            quantity: Number(formData.quantity),
            unitPrice: Number(formData.unitPrice),
          },
        ],
      })

      toast.success("Invoice created")
      router.push(`/billing/${invoice.id}`)
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error(
        error instanceof Error ? error.message : "Could not create the invoice"
      )
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
              <BreadcrumbLink href="/billing">Billing</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>New Invoice</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <Button variant="ghost" size="sm" asChild className="w-fit -ml-2">
            <Link href="/billing">
              <ArrowLeft className="size-4" />
              Back to Billing
            </Link>
          </Button>

          <form className="grid gap-6 lg:grid-cols-[1fr_320px]" onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Create Invoice</CardTitle>
                <CardDescription>
                  Invoices should be generated from a registration, so billing always stays tied to the event and main contact.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label>Registration</Label>
                  <Select value={formData.registrationId} onValueChange={(value) => updateField("registrationId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a registration" />
                    </SelectTrigger>
                    <SelectContent>
                      {registrations.map((registration) => (
                        <SelectItem key={registration.id} value={registration.id}>
                          {registration.eventName} · {registration.contactName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedRegistration?.invoiceId && (
                  <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                    <div className="flex items-start gap-3">
                      <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                      <div className="space-y-2">
                        <p>This registration already has an invoice linked.</p>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/billing/${selectedRegistration.invoiceId}`}>Open existing invoice</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="invoiceNumber">Invoice number</Label>
                    <Input
                      id="invoiceNumber"
                      value={formData.invoiceNumber}
                      onChange={(event) => updateField("invoiceNumber", event.target.value)}
                      placeholder="Leave empty for auto-numbering"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(value) => updateField("status", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="issued">Issued</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="invoiceDate">Invoice date</Label>
                    <Input id="invoiceDate" type="date" value={formData.invoiceDate} onChange={(event) => updateField("invoiceDate", event.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due date</Label>
                    <Input id="dueDate" type="date" value={formData.dueDate} onChange={(event) => updateField("dueDate", event.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">VAT %</Label>
                    <Input id="taxRate" type="number" min="0" step="0.1" value={formData.taxRate} onChange={(event) => updateField("taxRate", event.target.value)} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Line item description</Label>
                  <Input id="description" value={formData.description} onChange={(event) => updateField("description", event.target.value)} required />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input id="quantity" type="number" min="1" step="1" value={formData.quantity} onChange={(event) => updateField("quantity", event.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitPrice">Unit price</Label>
                    <Input id="unitPrice" type="number" min="0" step="0.01" value={formData.unitPrice} onChange={(event) => updateField("unitPrice", event.target.value)} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="publicNotes">Public note</Label>
                  <Textarea
                    id="publicNotes"
                    rows={3}
                    value={formData.publicNotes}
                    onChange={(event) => updateField("publicNotes", event.target.value)}
                    placeholder="Optional note visible on the invoice"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminNotes">Internal note</Label>
                  <Textarea
                    id="adminNotes"
                    rows={4}
                    value={formData.adminNotes}
                    onChange={(event) => updateField("adminNotes", event.target.value)}
                    placeholder="Payment terms, manual approvals, bookkeeping notes..."
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" asChild>
                    <Link href="/billing">Cancel</Link>
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !selectedRegistration || Boolean(selectedRegistration?.invoiceId)}
                  >
                    {isSubmitting && <LoaderCircle className="size-4 animate-spin" />}
                    Save Invoice
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Billing Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Event</p>
                    <p className="font-medium">{selectedRegistration?.eventName ?? "Not selected"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Contact</p>
                    <p className="font-medium">{selectedRegistration?.contactName ?? "Not selected"}</p>
                    <p className="text-muted-foreground">{selectedRegistration?.contactEmail ?? ""}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Company</p>
                    <p className="font-medium">{selectedRegistration?.company.name ?? "Not selected"}</p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{subtotal.toFixed(2)} {selectedRegistration?.currency ?? "EUR"}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span>{taxAmount.toFixed(2)} {selectedRegistration?.currency ?? "EUR"}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t pt-3 font-medium">
                      <span>Total</span>
                      <span>{totalAmount.toFixed(2)} {selectedRegistration?.currency ?? "EUR"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommended flow</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>1. Create or confirm the registration first.</p>
                  <p>2. Generate the invoice from that registration.</p>
                  <p>3. Record payments directly on the invoice detail page.</p>
                </CardContent>
              </Card>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}

export default function NewInvoicePage() {
  return (
    <Suspense fallback={null}>
      <NewInvoicePageContent />
    </Suspense>
  )
}
