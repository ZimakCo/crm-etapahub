"use client"

import { useMemo, useState } from "react"
import { PencilLine, Plus } from "lucide-react"
import { toast } from "sonner"
import {
  createWebhookEndpoint,
  updateWebhookEndpoint,
} from "@/lib/crm-repository"
import {
  formatLastEvent,
  formatProviderLabel,
  formatWebhookStatusLabel,
  getWebhookStatusBadgeClass,
} from "@/lib/email-ops"
import { useWebhookEndpoints } from "@/lib/hooks"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { WebhookEndpoint } from "@/lib/types"

const trackedEvents = ["delivered", "bounced", "complained", "unsubscribed", "clicked", "replied"]

const defaultForm = {
  provider: "resend" as WebhookEndpoint["provider"],
  label: "",
  url: "",
  status: "healthy" as WebhookEndpoint["status"],
  events: ["delivered", "bounced"],
  notes: "",
}

export default function WebhooksPage() {
  const { webhookEndpoints, mutate } = useWebhookEndpoints()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEndpoint, setEditingEndpoint] = useState<WebhookEndpoint | null>(null)
  const [formData, setFormData] = useState(defaultForm)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const sortedEndpoints = useMemo(
    () =>
      [...webhookEndpoints].sort(
        (left, right) =>
          new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
      ),
    [webhookEndpoints]
  )

  const openCreateDialog = () => {
    setEditingEndpoint(null)
    setFormData(defaultForm)
    setDialogOpen(true)
  }

  const openEditDialog = (endpoint: WebhookEndpoint) => {
    setEditingEndpoint(endpoint)
    setFormData({
      provider: endpoint.provider,
      label: endpoint.label,
      url: endpoint.url,
      status: endpoint.status,
      events: endpoint.events,
      notes: endpoint.notes ?? "",
    })
    setDialogOpen(true)
  }

  const toggleEvent = (eventName: string) => {
    setFormData((current) => ({
      ...current,
      events: current.events.includes(eventName)
        ? current.events.filter((item) => item !== eventName)
        : [...current.events, eventName],
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (formData.events.length === 0) {
      toast.error("Select at least one tracked event")
      return
    }

    try {
      setIsSubmitting(true)
      if (editingEndpoint) {
        await updateWebhookEndpoint(editingEndpoint.id, formData)
        toast.success("Endpoint updated")
      } else {
        await createWebhookEndpoint(formData)
        toast.success("Endpoint added")
      }
      await mutate()
      setDialogOpen(false)
    } catch (error) {
      console.error(error)
      toast.error("Could not save the endpoint")
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
              <BreadcrumbPage>Webhooks</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <Button onClick={openCreateDialog}>
            <Plus className="size-4" />
            Add endpoint
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-auto bg-[linear-gradient(180deg,rgba(15,23,42,0.04),transparent_14rem)] px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Webhooks</h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Provider event endpoints update bounced, complained and unsubscribed contact states inside the CRM.
            </p>
          </div>

          <div className="grid gap-4">
            {sortedEndpoints.map((endpoint) => (
              <Card key={endpoint.id} className="border-border/70 bg-card/90 shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">
                      {endpoint.label} · {formatProviderLabel(endpoint.provider)}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{endpoint.url}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getWebhookStatusBadgeClass(endpoint.status)}>
                      {formatWebhookStatusLabel(endpoint.status)}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(endpoint)}>
                      <PencilLine className="size-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border bg-muted/20 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Last event
                      </p>
                      <p className="mt-2 text-lg font-medium">
                        {formatLastEvent(endpoint.lastEventAt)}
                      </p>
                    </div>
                    <div className="rounded-2xl border bg-muted/20 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Tracked events
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {endpoint.events.map((eventName) => (
                          <Badge key={eventName} variant="secondary">
                            {eventName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  {endpoint.notes && (
                    <div className="rounded-2xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                      {endpoint.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEndpoint ? "Edit endpoint" : "Add endpoint"}</DialogTitle>
            <DialogDescription>
              Define where provider events are posted back into EtapaHub CRM.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select
                  value={formData.provider}
                  onValueChange={(value) =>
                    setFormData((current) => ({
                      ...current,
                      provider: value as WebhookEndpoint["provider"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resend">Resend</SelectItem>
                    <SelectItem value="mailgun">Mailgun</SelectItem>
                    <SelectItem value="kumomta">KumoMTA</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((current) => ({
                      ...current,
                      status: value as WebhookEndpoint["status"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="healthy">Healthy</SelectItem>
                    <SelectItem value="warming">Warming</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endpoint-label">Label</Label>
              <Input
                id="endpoint-label"
                value={formData.label}
                onChange={(event) => setFormData((current) => ({ ...current, label: event.target.value }))}
                placeholder="Provider Events"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endpoint-url">URL</Label>
              <Input
                id="endpoint-url"
                value={formData.url}
                onChange={(event) => setFormData((current) => ({ ...current, url: event.target.value }))}
                placeholder="https://crm.etapahub.com/api/webhooks/provider-events"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Events</Label>
              <div className="flex flex-wrap gap-2">
                {trackedEvents.map((eventName) => {
                  const active = formData.events.includes(eventName)
                  return (
                    <button
                      key={eventName}
                      type="button"
                      onClick={() => toggleEvent(eventName)}
                      className={`rounded-full border px-3 py-1.5 text-xs transition ${
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-muted text-muted-foreground"
                      }`}
                    >
                      {eventName}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endpoint-notes">Notes</Label>
              <Input
                id="endpoint-notes"
                value={formData.notes}
                onChange={(event) => setFormData((current) => ({ ...current, notes: event.target.value }))}
                placeholder="Shared endpoint for Resend and Mailgun"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {editingEndpoint ? "Save changes" : "Add endpoint"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
