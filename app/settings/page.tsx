"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Cable, Globe, Mail, PencilLine, Plus, Webhook } from "lucide-react"
import { toast } from "sonner"
import { createSenderIdentity, updateSenderIdentity } from "@/lib/crm-repository"
import {
  formatProviderLabel,
  getProviderBadgeClass,
  getProviderStatusBadgeClass,
  getSenderStatusBadgeClass,
  providerLanes,
} from "@/lib/email-ops"
import {
  useEmailDomains,
  useSenderIdentities,
  useWebhookEndpoints,
} from "@/lib/hooks"
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
import type { SenderIdentity } from "@/lib/types"

const defaultForm = {
  provider: "resend" as SenderIdentity["provider"],
  fromName: "",
  email: "",
  replyTo: "",
  domainId: "",
  region: "",
  status: "active" as SenderIdentity["status"],
  volumeBand: "",
  purpose: "",
}

export default function SettingsPage() {
  const { domains } = useEmailDomains()
  const { senderIdentities, mutate } = useSenderIdentities()
  const { webhookEndpoints } = useWebhookEndpoints()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSender, setEditingSender] = useState<SenderIdentity | null>(null)
  const [formData, setFormData] = useState(defaultForm)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const senderCards = useMemo(
    () =>
      [...senderIdentities].sort((left, right) => left.email.localeCompare(right.email)),
    [senderIdentities]
  )

  const openCreateDialog = () => {
    setEditingSender(null)
    setFormData({
      ...defaultForm,
      provider: domains[0]?.provider ?? defaultForm.provider,
      domainId: domains[0]?.id ?? "",
      region: domains[0]?.region ?? "",
    })
    setDialogOpen(true)
  }

  const openEditDialog = (sender: SenderIdentity) => {
    setEditingSender(sender)
    setFormData({
      provider: sender.provider,
      fromName: sender.fromName,
      email: sender.email,
      replyTo: sender.replyTo,
      domainId: sender.domainId,
      region: sender.region,
      status: sender.status,
      volumeBand: sender.volumeBand,
      purpose: sender.purpose,
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formData.domainId) {
      toast.error("Select a domain before saving the sender identity")
      return
    }

    try {
      setIsSubmitting(true)
      if (editingSender) {
        await updateSenderIdentity(editingSender.id, formData)
        toast.success("Sender identity updated")
      } else {
        await createSenderIdentity(formData)
        toast.success("Sender identity added")
      }
      await mutate()
      setDialogOpen(false)
    } catch (error) {
      console.error(error)
      toast.error("Could not save the sender identity")
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
              <BreadcrumbPage>Settings</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex-1 overflow-auto bg-[linear-gradient(180deg,rgba(15,23,42,0.04),transparent_14rem)] px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Email settings</h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Configure the infrastructure behind broadcasts: sender identities, verified domains, webhook endpoints and provider lanes.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-border/70 bg-card/90 shadow-sm">
              <CardContent className="pt-6">
                <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Provider lanes</p>
                <p className="mt-2 text-4xl font-semibold">{providerLanes.length}</p>
              </CardContent>
            </Card>
            <Card className="border-border/70 bg-card/90 shadow-sm">
              <CardContent className="pt-6">
                <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Sender identities</p>
                <p className="mt-2 text-4xl font-semibold">{senderIdentities.length}</p>
              </CardContent>
            </Card>
            <Card className="border-border/70 bg-card/90 shadow-sm">
              <CardContent className="pt-6">
                <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Domains / webhooks</p>
                <p className="mt-2 text-4xl font-semibold">
                  {domains.length} / {webhookEndpoints.length}
                </p>
              </CardContent>
            </Card>
          </div>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <Cable className="size-5 text-muted-foreground" />
              <h2 className="text-2xl font-semibold">Provider lanes</h2>
            </div>
            <div className="grid gap-4 xl:grid-cols-3">
              {providerLanes.map((lane) => (
                <Card key={lane.id} className="border-border/70 bg-card/90 shadow-sm">
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-xl">{lane.title}</CardTitle>
                      <Badge variant="outline" className={getProviderStatusBadgeClass(lane.status)}>
                        {lane.status}
                      </Badge>
                    </div>
                    <Badge variant="outline" className={getProviderBadgeClass(lane.provider)}>
                      {formatProviderLabel(lane.provider)}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-2xl border bg-muted/20 p-4">
                        <p className="text-muted-foreground">Active days</p>
                        <p className="mt-2 font-medium">{lane.activeDays}</p>
                      </div>
                      <div className="rounded-2xl border bg-muted/20 p-4">
                        <p className="text-muted-foreground">Send window</p>
                        <p className="mt-2 font-medium">{lane.sendWindow}</p>
                      </div>
                    </div>
                    <div className="rounded-2xl border bg-muted/20 p-4">
                      <p className="text-muted-foreground">Capacity</p>
                      <p className="mt-2 font-medium">{lane.dailyVolume}</p>
                      <p className="mt-2 text-muted-foreground">{lane.notes}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Mail className="size-5 text-muted-foreground" />
                <h2 className="text-2xl font-semibold">Sender identities</h2>
              </div>
              <Button onClick={openCreateDialog}>
                <Plus className="size-4" />
                Add sender identity
              </Button>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {senderCards.map((sender) => {
                const domain = domains.find((item) => item.id === sender.domainId)

                return (
                  <Card key={sender.id} className="border-border/70 bg-card/90 shadow-sm">
                    <CardContent className="space-y-4 pt-6">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-lg font-medium">{sender.fromName}</p>
                          <p className="text-sm text-muted-foreground">{sender.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getProviderBadgeClass(sender.provider)}>
                            {formatProviderLabel(sender.provider)}
                          </Badge>
                          <Badge variant="outline" className={getSenderStatusBadgeClass(sender.status)}>
                            {sender.status}
                          </Badge>
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(sender)}>
                            <PencilLine className="size-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-2xl border bg-muted/20 p-4">
                          <p className="text-muted-foreground">Domain</p>
                          <p className="mt-2 font-medium">{domain?.name || "No domain linked"}</p>
                        </div>
                        <div className="rounded-2xl border bg-muted/20 p-4">
                          <p className="text-muted-foreground">Volume band</p>
                          <p className="mt-2 font-medium">{sender.volumeBand}</p>
                        </div>
                      </div>
                      <div className="rounded-2xl border bg-muted/20 p-4">
                        <p className="text-muted-foreground">Reply-To</p>
                        <p className="mt-2 font-medium">{sender.replyTo}</p>
                        <p className="mt-2 text-muted-foreground">{sender.purpose}</p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-border/70 bg-card/90 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Globe className="size-5 text-muted-foreground" />
                  <CardTitle>Domains</CardTitle>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/domains">Manage domains</Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>{domains.length} verified or warming domains available for routing.</p>
                <p>Tracking configuration, region and provider mapping live in the domain registry.</p>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/90 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Webhook className="size-5 text-muted-foreground" />
                  <CardTitle>Webhooks</CardTitle>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/webhooks">Manage webhooks</Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>{webhookEndpoints.length} webhook endpoints currently feed delivery events back into the CRM.</p>
                <p>Bounce, complaint, unsubscribe and click events are tracked from here.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSender ? "Edit sender identity" : "Add sender identity"}</DialogTitle>
            <DialogDescription>
              Configure the mailbox operations chooses in the broadcast composer.
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
                      provider: value as SenderIdentity["provider"],
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
                <Label>Domain</Label>
                <Select
                  value={formData.domainId}
                  onValueChange={(value) => {
                    const domain = domains.find((item) => item.id === value)
                    setFormData((current) => ({
                      ...current,
                      domainId: value,
                      provider: domain?.provider ?? current.provider,
                      region: domain?.region ?? current.region,
                    }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select domain" />
                  </SelectTrigger>
                  <SelectContent>
                    {domains.map((domain) => (
                      <SelectItem key={domain.id} value={domain.id}>
                        {domain.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sender-name">From name</Label>
                <Input
                  id="sender-name"
                  value={formData.fromName}
                  onChange={(event) => setFormData((current) => ({ ...current, fromName: event.target.value }))}
                  placeholder="EtapaHub Events"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sender-email">Email</Label>
                <Input
                  id="sender-email"
                  value={formData.email}
                  onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
                  placeholder="events@mail.etapa-conferences.com"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sender-reply-to">Reply-To</Label>
                <Input
                  id="sender-reply-to"
                  value={formData.replyTo}
                  onChange={(event) => setFormData((current) => ({ ...current, replyTo: event.target.value }))}
                  placeholder="events@mail.etapa-conferences.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sender-region">Region</Label>
                <Input
                  id="sender-region"
                  value={formData.region}
                  onChange={(event) => setFormData((current) => ({ ...current, region: event.target.value }))}
                  placeholder="Ireland (eu-west-1)"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((current) => ({
                      ...current,
                      status: value as SenderIdentity["status"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="warmup">Warm-up</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sender-volume">Volume band</Label>
                <Input
                  id="sender-volume"
                  value={formData.volumeBand}
                  onChange={(event) => setFormData((current) => ({ ...current, volumeBand: event.target.value }))}
                  placeholder="6k-10k/day"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sender-purpose">Purpose</Label>
              <Input
                id="sender-purpose"
                value={formData.purpose}
                onChange={(event) => setFormData((current) => ({ ...current, purpose: event.target.value }))}
                placeholder="Primary conference invitation sender"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {editingSender ? "Save changes" : "Add sender identity"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
