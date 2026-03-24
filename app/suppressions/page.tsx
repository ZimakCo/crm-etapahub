"use client"

import { useMemo, useState } from "react"
import { Plus, Search } from "lucide-react"
import { toast } from "sonner"
import { createSuppression } from "@/lib/crm-repository"
import { formatProviderLabel } from "@/lib/email-ops"
import { useBroadcasts, useContacts, useSuppressions } from "@/lib/hooks"
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
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { CampaignProvider, Suppression } from "@/lib/types"

const defaultForm = {
  contactId: "manual",
  email: "",
  reason: "manual_block" as Suppression["reason"],
  sourceProvider: "none",
  sourceBroadcastId: "none",
  notes: "",
}

function reasonBadge(reason: Suppression["reason"]) {
  switch (reason) {
    case "complaint":
      return "border-amber-200 bg-amber-50 text-amber-700"
    case "unsubscribe":
      return "border-sky-200 bg-sky-50 text-sky-700"
    case "hard_bounce":
      return "border-rose-200 bg-rose-50 text-rose-700"
    default:
      return "border-zinc-200 bg-zinc-100 text-zinc-700"
  }
}

export default function SuppressionsPage() {
  const { suppressions, mutate } = useSuppressions()
  const { contacts } = useContacts()
  const { campaigns: broadcasts } = useBroadcasts()
  const [searchQuery, setSearchQuery] = useState("")
  const [reasonFilter, setReasonFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState(defaultForm)

  const filteredSuppressions = useMemo(
    () =>
      suppressions.filter((suppression) => {
        const matchesSearch =
          !searchQuery ||
          [suppression.email, suppression.contactName, suppression.sourceBroadcastName]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        const matchesReason =
          reasonFilter === "all" || suppression.reason === reasonFilter
        return matchesSearch && matchesReason
      }),
    [reasonFilter, searchQuery, suppressions]
  )

  const activeSuppressions = suppressions.filter((suppression) => suppression.status === "active")
  const bounceCount = activeSuppressions.filter((suppression) => suppression.reason === "hard_bounce").length
  const optOutCount = activeSuppressions.filter(
    (suppression) =>
      suppression.reason === "unsubscribe" || suppression.reason === "manual_block"
  ).length

  const handleContactChange = (value: string) => {
    if (value === "manual") {
      setFormData((current) => ({ ...current, contactId: "manual", email: current.email }))
      return
    }

    const selectedContact = contacts.find((contact) => contact.id === value)
    setFormData((current) => ({
      ...current,
      contactId: value,
      email: selectedContact?.email ?? current.email,
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formData.email) {
      toast.error("Email is required")
      return
    }

    try {
      setIsSubmitting(true)
      await createSuppression({
        contactId: formData.contactId === "manual" ? undefined : formData.contactId,
        email: formData.email,
        reason: formData.reason,
        sourceProvider:
          formData.sourceProvider === "none"
            ? undefined
            : (formData.sourceProvider as CampaignProvider),
        sourceBroadcastId:
          formData.sourceBroadcastId === "none" ? undefined : formData.sourceBroadcastId,
        notes: formData.notes || undefined,
      })
      await mutate()
      toast.success("Suppression created")
      setDialogOpen(false)
      setFormData(defaultForm)
    } catch (error) {
      console.error(error)
      toast.error("Could not create the suppression")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Suppressions</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" />
            Add suppression
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-auto bg-[linear-gradient(180deg,rgba(15,23,42,0.04),transparent_14rem)] px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Suppressions</h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Global exclusions across all providers. Hard bounces, complaints, unsubscribes and manual blocks stay out of every future broadcast.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-border/70 bg-card/90 shadow-sm">
              <CardContent className="pt-6">
                <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Active suppressions</p>
                <p className="mt-2 text-4xl font-semibold">{activeSuppressions.length}</p>
              </CardContent>
            </Card>
            <Card className="border-border/70 bg-card/90 shadow-sm">
              <CardContent className="pt-6">
                <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Hard bounces</p>
                <p className="mt-2 text-4xl font-semibold">{bounceCount}</p>
              </CardContent>
            </Card>
            <Card className="border-border/70 bg-card/90 shadow-sm">
              <CardContent className="pt-6">
                <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Opt-out blocks</p>
                <p className="mt-2 text-4xl font-semibold">{optOutCount}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/70 bg-card/90 shadow-sm">
            <CardContent className="space-y-4 pt-6">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Search suppressions"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </div>
                <Select value={reasonFilter} onValueChange={setReasonFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All reasons" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All reasons</SelectItem>
                    <SelectItem value="hard_bounce">Hard bounce</SelectItem>
                    <SelectItem value="complaint">Complaint</SelectItem>
                    <SelectItem value="unsubscribe">Unsubscribe</SelectItem>
                    <SelectItem value="manual_block">Manual block</SelectItem>
                    <SelectItem value="soft_bounce">Soft bounce</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppressions.map((suppression) => (
                    <TableRow key={suppression.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{suppression.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {suppression.contactName || "Manual suppression"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={reasonBadge(suppression.reason)}>
                          {suppression.reason.replaceAll("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {suppression.sourceBroadcastName ||
                          (suppression.sourceProvider
                            ? formatProviderLabel(suppression.sourceProvider)
                            : "Manual")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {suppression.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {new Date(suppression.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add suppression</DialogTitle>
            <DialogDescription>
              Create a global block across all future broadcasts.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label>Contact</Label>
              <Select value={formData.contactId} onValueChange={handleContactChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual email</SelectItem>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.firstName} {contact.lastName} · {contact.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="suppression-email">Email</Label>
              <Input
                id="suppression-email"
                value={formData.email}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, email: event.target.value }))
                }
                placeholder="name@company.com"
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Reason</Label>
                <Select
                  value={formData.reason}
                  onValueChange={(value) =>
                    setFormData((current) => ({
                      ...current,
                      reason: value as Suppression["reason"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hard_bounce">Hard bounce</SelectItem>
                    <SelectItem value="complaint">Complaint</SelectItem>
                    <SelectItem value="unsubscribe">Unsubscribe</SelectItem>
                    <SelectItem value="manual_block">Manual block</SelectItem>
                    <SelectItem value="soft_bounce">Soft bounce</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Source provider</Label>
                <Select
                  value={formData.sourceProvider}
                  onValueChange={(value) =>
                    setFormData((current) => ({ ...current, sourceProvider: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Manual / none</SelectItem>
                    <SelectItem value="resend">Resend</SelectItem>
                    <SelectItem value="mailgun">Mailgun</SelectItem>
                    <SelectItem value="kumomta">KumoMTA</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Source broadcast</Label>
              <Select
                value={formData.sourceBroadcastId}
                onValueChange={(value) =>
                  setFormData((current) => ({ ...current, sourceBroadcastId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {broadcasts.map((broadcast) => (
                    <SelectItem key={broadcast.id} value={broadcast.id}>
                      {broadcast.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="suppression-notes">Notes</Label>
              <Textarea
                id="suppression-notes"
                value={formData.notes}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, notes: event.target.value }))
                }
                placeholder="Optional operational note"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Add suppression"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
