"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { LoaderCircle, SendHorizontal } from "lucide-react"
import { toast } from "sonner"
import { createCampaign } from "@/lib/crm-repository"
import { formatProviderLabel } from "@/lib/email-ops"
import {
  useEmailDomains,
  useSegments,
  useSenderIdentities,
  useTemplates,
} from "@/lib/hooks"
import { Button } from "@/components/ui/button"
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
import { Textarea } from "@/components/ui/textarea"

function NewBroadcastPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedTemplateId = searchParams.get("templateId") ?? ""
  const { templates } = useTemplates()
  const { segments } = useSegments()
  const { senderIdentities } = useSenderIdentities()
  const { domains } = useEmailDomains()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState(preselectedTemplateId)
  const [selectedSegmentId, setSelectedSegmentId] = useState("")
  const [selectedSenderId, setSelectedSenderId] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    previewText: "",
    textContent: "",
    status: "draft",
    scheduledAt: "",
  })

  useEffect(() => {
    if (!selectedSenderId && senderIdentities.length > 0) {
      setSelectedSenderId(senderIdentities[0].id)
    }
  }, [selectedSenderId, senderIdentities])

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) ?? null,
    [selectedTemplateId, templates]
  )
  const selectedSegment = useMemo(
    () => segments.find((segment) => segment.id === selectedSegmentId) ?? null,
    [segments, selectedSegmentId]
  )
  const selectedSender = useMemo(
    () => senderIdentities.find((sender) => sender.id === selectedSenderId) ?? null,
    [selectedSenderId, senderIdentities]
  )
  const selectedDomain = useMemo(
    () => domains.find((domain) => domain.id === selectedSender?.domainId) ?? null,
    [domains, selectedSender?.domainId]
  )

  useEffect(() => {
    if (!selectedTemplate) {
      return
    }

    setFormData((current) => ({
      ...current,
      subject: selectedTemplate.subject,
      previewText: selectedTemplate.previewText,
      textContent: selectedTemplate.textContent ?? current.textContent,
      name: current.name,
    }))
  }, [selectedTemplate])

  useEffect(() => {
    if (!selectedTemplate || !selectedSegment) {
      return
    }

    setFormData((current) => ({
      ...current,
      name: current.name || `${selectedTemplate.name} · ${selectedSegment.name}`,
    }))
  }, [selectedSegment, selectedTemplate])

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedTemplate || !selectedSegment || !selectedSender) {
      toast.error("Select template, audience segment and sender identity")
      return
    }

    try {
      setIsSubmitting(true)

      const campaign = await createCampaign({
        name: formData.name || `${selectedTemplate.name} · ${selectedSegment.name}`,
        provider: selectedSender.provider,
        senderIdentityId: selectedSender.id,
        subject: formData.subject,
        previewText: formData.previewText,
        fromName: selectedSender.fromName,
        fromEmail: selectedSender.email,
        replyTo: selectedSender.replyTo,
        status: formData.status as "draft" | "scheduled" | "sent",
        scheduledAt:
          formData.status === "scheduled" && formData.scheduledAt
            ? new Date(formData.scheduledAt).toISOString()
            : undefined,
        segmentIds: [selectedSegment.id],
        templateId: selectedTemplate.id,
        templateFormat: "plain_text",
        textContent: formData.textContent,
      })

      toast.success("Broadcast saved")
      router.push(`/campaigns/${campaign.id}`)
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Could not create the broadcast")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-full bg-[linear-gradient(180deg,rgba(15,23,42,0.04),transparent_15rem)] text-foreground">
      <div className="border-b bg-background/90 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            <Link href="/campaigns" className="transition-colors hover:text-foreground">
              Broadcasts
            </Link>
            <span className="mx-2 text-border">/</span>
            <span className="font-medium text-foreground">
              {formData.name || "New broadcast"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link href="/campaigns">Cancel</Link>
            </Button>
            <Button type="submit" form="broadcast-form" disabled={isSubmitting}>
              {isSubmitting && <LoaderCircle className="size-4 animate-spin" />}
              Save broadcast
            </Button>
          </div>
        </div>
      </div>

      <form
        id="broadcast-form"
        className="mx-auto grid max-w-7xl gap-6 px-6 py-6 xl:grid-cols-[minmax(0,1fr)_340px]"
        onSubmit={handleSubmit}
      >
        <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardContent className="space-y-6 p-6">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="broadcast-template">Template</Label>
                <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                  <SelectTrigger id="broadcast-template">
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="broadcast-segment">Audience segment</Label>
                <Select value={selectedSegmentId} onValueChange={setSelectedSegmentId}>
                  <SelectTrigger id="broadcast-segment">
                    <SelectValue placeholder="Select a segment" />
                  </SelectTrigger>
                  <SelectContent>
                    {segments.map((segment) => (
                      <SelectItem key={segment.id} value={segment.id}>
                        {segment.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="broadcast-sender">From</Label>
                <Select value={selectedSenderId} onValueChange={setSelectedSenderId}>
                  <SelectTrigger id="broadcast-sender">
                    <SelectValue placeholder="Choose sender identity" />
                  </SelectTrigger>
                  <SelectContent>
                    {senderIdentities.map((sender) => (
                      <SelectItem key={sender.id} value={sender.id}>
                        {sender.fromName} {"<"}{sender.email}{">"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="broadcast-status">Delivery mode</Label>
                <Select value={formData.status} onValueChange={(value) => updateField("status", value)}>
                  <SelectTrigger id="broadcast-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Save as draft</SelectItem>
                    <SelectItem value="scheduled">Schedule</SelectItem>
                    <SelectItem value="sent">Mark as sent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="broadcast-name">Internal name</Label>
                <Input
                  id="broadcast-name"
                  value={formData.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="HPAPI Milan · segmento 1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="broadcast-preview">Preview text</Label>
                <Input
                  id="broadcast-preview"
                  value={formData.previewText}
                  onChange={(event) => updateField("previewText", event.target.value)}
                  placeholder="Short delivery-first preview text."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="broadcast-subject">Subject</Label>
              <Input
                id="broadcast-subject"
                value={formData.subject}
                onChange={(event) => updateField("subject", event.target.value)}
                placeholder="Broadcast subject"
              />
            </div>

            {formData.status === "scheduled" && (
              <div className="space-y-2">
                <Label htmlFor="broadcast-scheduled-at">Scheduled at</Label>
                <Input
                  id="broadcast-scheduled-at"
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(event) => updateField("scheduledAt", event.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="broadcast-body">Broadcast body</Label>
              <Textarea
                id="broadcast-body"
                rows={20}
                value={formData.textContent}
                onChange={(event) => updateField("textContent", event.target.value)}
                className="min-h-[520px] resize-y font-mono text-[15px] leading-7"
                placeholder="Write the plain-text broadcast body here..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-border/70 bg-card/90 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Sender identity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="rounded-xl border bg-muted/20 p-4">
                <p className="font-medium">
                  {selectedSender
                    ? `${selectedSender.fromName} <${selectedSender.email}>`
                    : "Choose a sender identity"}
                </p>
                <p className="mt-2 text-muted-foreground">
                  {selectedSender
                    ? `${formatProviderLabel(selectedSender.provider)} · ${selectedSender.region} · ${selectedSender.volumeBand}`
                    : "Pick the warmed-up mailbox and provider lane used for this broadcast."}
                </p>
              </div>
              <div className="rounded-xl border bg-muted/20 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Domain
                </p>
                <p className="mt-2 font-medium">
                  {selectedDomain?.name || "No domain linked"}
                </p>
                <p className="mt-1 text-muted-foreground">
                  {selectedDomain?.notes || "Tracking, verification and provider health stay visible here."}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/90 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Audience slice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="rounded-xl border bg-muted/20 p-4">
                <p className="font-medium">{selectedSegment?.name || "Choose a segment"}</p>
                <p className="mt-2 text-muted-foreground">
                  {selectedSegment
                    ? `${selectedSegment.contactCount} contacts currently match this seller-curated slice.`
                    : "Sales prepares manual slices like evento-roma-1, evento-roma-2 and similar lists directly from the CRM DB."}
                </p>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/segments/new">Create segment</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/90 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Next step</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p className="inline-flex items-center gap-2 text-foreground">
                <SendHorizontal className="size-4" />
                This phase saves the broadcast and links it to template, segment and sender identity.
              </p>
              <p>After save, operations can review metrics, sender lane and linked audience from the broadcast detail page.</p>
            </CardContent>
          </Card>
        </div>
      </form>
    </main>
  )
}

export default function NewBroadcastPage() {
  return (
    <Suspense fallback={null}>
      <NewBroadcastPageContent />
    </Suspense>
  )
}
