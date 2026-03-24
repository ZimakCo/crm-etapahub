"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { LoaderCircle } from "lucide-react"
import { toast } from "sonner"
import { createCampaign } from "@/lib/crm-repository"
import { formatProviderLabel } from "@/lib/email-ops"
import {
  useBroadcasts,
  useContacts,
  useEmailDomains,
  useMarketingCampaigns,
  useSegments,
  useSenderIdentities,
  useSuppressions,
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
  const templateIdFromQuery = searchParams.get("templateId") ?? ""
  const marketingCampaignIdFromQuery = searchParams.get("marketingCampaignId") ?? ""
  const segmentIdFromQuery = searchParams.get("segmentId") ?? ""
  const { campaigns: marketingCampaigns } = useMarketingCampaigns()
  const { templates } = useTemplates()
  const { segments } = useSegments()
  const { senderIdentities } = useSenderIdentities()
  const { domains } = useEmailDomains()
  const { contacts } = useContacts()
  const { suppressions } = useSuppressions()
  const { campaigns: broadcasts } = useBroadcasts()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedMarketingCampaignId, setSelectedMarketingCampaignId] = useState(marketingCampaignIdFromQuery)
  const [selectedTemplateId, setSelectedTemplateId] = useState(templateIdFromQuery)
  const [selectedSegmentId, setSelectedSegmentId] = useState(segmentIdFromQuery)
  const [selectedSenderId, setSelectedSenderId] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    previewText: "",
    textContent: "",
    notes: "",
    status: "draft",
    scheduledAt: "",
  })

  useEffect(() => {
    if (!selectedMarketingCampaignId && marketingCampaigns.length > 0) {
      setSelectedMarketingCampaignId(marketingCampaigns[0].id)
    }
  }, [marketingCampaigns, selectedMarketingCampaignId])

  useEffect(() => {
    if (!selectedSegmentId && segments.length > 0) {
      setSelectedSegmentId(segments[0].id)
    }
  }, [segments, selectedSegmentId])

  useEffect(() => {
    if (!selectedSenderId && senderIdentities.length > 0) {
      setSelectedSenderId(senderIdentities[0].id)
    }
  }, [selectedSenderId, senderIdentities])

  const selectedMarketingCampaign = useMemo(
    () => marketingCampaigns.find((campaign) => campaign.id === selectedMarketingCampaignId) ?? null,
    [marketingCampaigns, selectedMarketingCampaignId]
  )
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
    if (
      selectedMarketingCampaign &&
      selectedMarketingCampaign.templateId &&
      !templateIdFromQuery
    ) {
      setSelectedTemplateId(selectedMarketingCampaign.templateId)
    }
  }, [selectedMarketingCampaign, templateIdFromQuery])

  useEffect(() => {
    if (!selectedTemplate) {
      return
    }

    setFormData((current) => ({
      ...current,
      subject: selectedTemplate.subject,
      previewText: selectedTemplate.previewText,
      textContent: selectedTemplate.textContent ?? current.textContent,
    }))
  }, [selectedTemplate])

  useEffect(() => {
    if (!selectedSegment) {
      return
    }

    setFormData((current) => {
      if (current.name) {
        return current
      }

      const parentName = selectedMarketingCampaign?.name ?? selectedTemplate?.name ?? "Broadcast"
      const nextIndex =
        broadcasts.filter(
          (broadcast) => broadcast.marketingCampaignId === selectedMarketingCampaign?.id
        ).length + 1

      return {
        ...current,
        name: `${parentName} · ${selectedSegment.name} · Wave ${nextIndex}`,
      }
    })
  }, [broadcasts, selectedMarketingCampaign, selectedSegment, selectedTemplate])

  const eligibleRecipients = useMemo(() => {
    if (!selectedSegment) {
      return 0
    }

    const suppressedEmails = new Set(
      suppressions
        .filter((suppression) => suppression.status === "active")
        .map((suppression) => suppression.email.toLowerCase())
    )

    return contacts.filter((contact) => {
      return (
        contact.segments.includes(selectedSegment.name) &&
        contact.subscriptionStatus === "subscribed" &&
        contact.emailStatus !== "invalid" &&
        contact.emailStatus !== "spam" &&
        !suppressedEmails.has(contact.email.toLowerCase())
      )
    }).length
  }, [contacts, selectedSegment, suppressions])

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedMarketingCampaign || !selectedTemplate || !selectedSegment || !selectedSender) {
      toast.error("Select campaign, template, segment and sender identity")
      return
    }

    try {
      setIsSubmitting(true)

      const broadcast = await createCampaign({
        name: formData.name || `${selectedMarketingCampaign.name} · ${selectedSegment.name}`,
        marketingCampaignId: selectedMarketingCampaign.id,
        provider: selectedSender.provider,
        senderIdentityId: selectedSender.id,
        subject: formData.subject,
        previewText: formData.previewText,
        fromName: selectedSender.fromName,
        fromEmail: selectedSender.email,
        replyTo: selectedSender.replyTo,
        status: formData.status as "draft" | "scheduled" | "sent",
        notes: formData.notes,
        scheduledAt:
          formData.status === "scheduled" && formData.scheduledAt
            ? new Date(formData.scheduledAt).toISOString()
            : undefined,
        segmentIds: [selectedSegment.id],
        templateId: selectedTemplate.id,
        templateFormat: selectedTemplate.format,
        textContent: formData.textContent,
      })

      toast.success("Broadcast saved")
      router.push(`/broadcasts/${broadcast.id}`)
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
            <Link href="/broadcasts" className="transition-colors hover:text-foreground">
              Broadcasts
            </Link>
            <span className="mx-2 text-border">/</span>
            <span className="font-medium text-foreground">
              {formData.name || "New broadcast"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link href="/broadcasts">Cancel</Link>
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
                <Label htmlFor="broadcast-campaign">Parent campaign</Label>
                <Select value={selectedMarketingCampaignId} onValueChange={setSelectedMarketingCampaignId}>
                  <SelectTrigger id="broadcast-campaign">
                    <SelectValue placeholder="Select a campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    {marketingCampaigns.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
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
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="broadcast-name">Internal name</Label>
                <Input
                  id="broadcast-name"
                  value={formData.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="HPAPI Milan · evento-roma-1 · wave 1"
                />
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
                <Label htmlFor="broadcast-subject">Subject</Label>
                <Input
                  id="broadcast-subject"
                  value={formData.subject}
                  onChange={(event) => updateField("subject", event.target.value)}
                  placeholder="Broadcast subject"
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
              <Label htmlFor="broadcast-body">Plain-text body</Label>
              <Textarea
                id="broadcast-body"
                className="min-h-[320px] font-mono text-sm"
                value={formData.textContent}
                onChange={(event) => updateField("textContent", event.target.value)}
                placeholder="Plain-text body"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="broadcast-notes">Internal notes</Label>
              <Textarea
                id="broadcast-notes"
                value={formData.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                placeholder="Optional notes for operations"
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/70 bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle>Delivery plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="rounded-2xl border bg-muted/20 p-4">
                <p className="text-muted-foreground">Campaign</p>
                <p className="mt-2 font-medium">
                  {selectedMarketingCampaign?.name || "Select a parent campaign"}
                </p>
                {selectedMarketingCampaign?.objective && (
                  <p className="mt-2 text-muted-foreground">
                    {selectedMarketingCampaign.objective}
                  </p>
                )}
              </div>
              <div className="rounded-2xl border bg-muted/20 p-4">
                <p className="text-muted-foreground">Sender lane</p>
                <p className="mt-2 font-medium">
                  {selectedSender
                    ? `${selectedSender.fromName} <${selectedSender.email}>`
                    : "Select a sender identity"}
                </p>
                {selectedSender && (
                  <p className="mt-2 text-muted-foreground">
                    {formatProviderLabel(selectedSender.provider)} via {selectedDomain?.name || "unknown domain"}
                  </p>
                )}
              </div>
              <div className="rounded-2xl border bg-muted/20 p-4">
                <p className="text-muted-foreground">Eligible recipients</p>
                <p className="mt-2 text-3xl font-semibold">{eligibleRecipients}</p>
                <p className="mt-2 text-muted-foreground">
                  Suppressed, invalid and unsubscribed contacts are excluded automatically.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </main>
  )
}

export default function NewBroadcastPage() {
  return (
    <Suspense>
      <NewBroadcastPageContent />
    </Suspense>
  )
}
