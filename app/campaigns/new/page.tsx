"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LoaderCircle } from "lucide-react"
import { toast } from "sonner"
import { createCampaign } from "@/lib/crm-repository"
import { senderIdentities } from "@/lib/email-ops"
import { useSegments, useTemplates } from "@/lib/hooks"
import { Button } from "@/components/ui/button"
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

export default function NewBroadcastPage() {
  const router = useRouter()
  const { templates } = useTemplates()
  const { segments } = useSegments()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("")
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>("")
  const [selectedSenderId, setSelectedSenderId] = useState<string>(senderIdentities[0]?.id ?? "")
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    previewText: "",
    textContent: "",
    status: "draft",
    scheduledAt: "",
  })

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
    [selectedSenderId]
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
      name:
        current.name ||
        `${selectedTemplate.name}${selectedSegment ? ` · ${selectedSegment.name}` : ""}`,
    }))
  }, [selectedSegment, selectedTemplate])

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedTemplate || !selectedSegment || !selectedSender) {
      toast.error("Select template, segment and sender identity first")
      return
    }

    try {
      setIsSubmitting(true)

      const campaign = await createCampaign({
        name: formData.name || `${selectedTemplate.name} · ${selectedSegment.name}`,
        provider: selectedSender.provider,
        subject: formData.subject,
        previewText: formData.previewText,
        fromName: selectedSender.fromName,
        fromEmail: selectedSender.email,
        replyTo: selectedSender.replyTo,
        status: formData.status as "draft" | "scheduled" | "sent",
        scheduledAt: formData.status === "scheduled" && formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : undefined,
        segmentIds: [selectedSegment.id],
        templateId: selectedTemplate.id,
        templateFormat: "plain_text",
        textContent: formData.textContent,
      })

      toast.success("Broadcast created")
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
    <main className="min-h-full bg-[#050505] text-white">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
        <div className="text-sm text-white/60">
          <Link href="/campaigns" className="hover:text-white">Broadcasts</Link>
          <span className="mx-2 text-white/30">/</span>
          <span className="font-medium text-white">{formData.name || "Untitled Broadcast"}</span>
          <span className="ml-3 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/55">
            {formData.status}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.07]" asChild>
            <Link href="/campaigns">Cancel</Link>
          </Button>
          <Button
            type="submit"
            form="broadcast-form"
            className="rounded-xl bg-white text-black hover:bg-white/90"
            disabled={isSubmitting}
          >
            {isSubmitting && <LoaderCircle className="size-4 animate-spin" />}
            Review
          </Button>
        </div>
      </div>

      <form
        id="broadcast-form"
        className="grid gap-6 px-6 py-6 xl:grid-cols-[76px_minmax(0,1fr)_420px]"
        onSubmit={handleSubmit}
      >
        <div className="hidden xl:flex xl:flex-col xl:items-center xl:gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04] text-lg font-medium">
            T
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04] text-lg font-medium">
            /
          </div>
        </div>

        <div className="rounded-[36px] border border-white/10 bg-white px-6 py-8 text-black shadow-[0_0_0_1px_rgba(255,255,255,0.03)] xl:px-10">
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="grid gap-5 md:grid-cols-[120px_minmax(0,1fr)_120px_minmax(0,1fr)]">
              <Label className="pt-3 text-3xl font-normal text-black/65">From</Label>
              <div className="border-b border-black/10 pb-3">
                <Select value={selectedSenderId} onValueChange={setSelectedSenderId}>
                  <SelectTrigger className="w-full border-0 bg-transparent px-0 text-lg text-black shadow-none focus-visible:ring-0">
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
              <Label className="pt-3 text-3xl font-normal text-black/65">Reply-To</Label>
              <div className="border-b border-black/10 pb-3 text-lg text-black/55">
                {selectedSender?.replyTo || "Select sender"}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-[120px_minmax(0,1fr)_120px_minmax(0,1fr)]">
              <Label className="pt-3 text-3xl font-normal text-black/65">To</Label>
              <div className="border-b border-black/10 pb-3">
                <Select value={selectedSegmentId} onValueChange={setSelectedSegmentId}>
                  <SelectTrigger className="w-full border-0 bg-transparent px-0 text-lg text-black shadow-none focus-visible:ring-0">
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
              <Label className="pt-3 text-3xl font-normal text-black/65">When</Label>
              <div className="border-b border-black/10 pb-3">
                <Select value={formData.status} onValueChange={(value) => updateField("status", value)}>
                  <SelectTrigger className="w-full border-0 bg-transparent px-0 text-lg text-black shadow-none focus-visible:ring-0">
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

            <div className="grid gap-5 md:grid-cols-[120px_minmax(0,1fr)_120px_minmax(0,1fr)]">
              <Label className="pt-3 text-3xl font-normal text-black/65">Template</Label>
              <div className="border-b border-black/10 pb-3">
                <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                  <SelectTrigger className="w-full border-0 bg-transparent px-0 text-lg text-black shadow-none focus-visible:ring-0">
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
              <Label className="pt-3 text-3xl font-normal text-black/65">Preview text</Label>
              <div className="border-b border-black/10 pb-3">
                <Input
                  value={formData.previewText}
                  onChange={(event) => updateField("previewText", event.target.value)}
                  className="h-auto border-0 bg-transparent px-0 text-lg text-black shadow-none focus-visible:ring-0"
                  placeholder="Preview text"
                />
              </div>
            </div>

            <div className="border-b border-black/10 pb-3">
              <Input
                value={formData.subject}
                onChange={(event) => updateField("subject", event.target.value)}
                className="h-auto border-0 bg-transparent px-0 text-4xl font-medium tracking-tight text-black shadow-none focus-visible:ring-0"
                placeholder="Broadcast subject"
              />
            </div>

            <div className="space-y-4 pt-4">
              <Input
                value={formData.name}
                onChange={(event) => updateField("name", event.target.value)}
                className="h-auto border-0 bg-transparent px-0 text-base text-black/55 shadow-none focus-visible:ring-0"
                placeholder="Internal broadcast name"
              />
              {formData.status === "scheduled" && (
                <Input
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(event) => updateField("scheduledAt", event.target.value)}
                  className="max-w-sm rounded-2xl border border-black/10 bg-black/[0.02] text-black"
                />
              )}
              <Textarea
                rows={20}
                value={formData.textContent}
                onChange={(event) => updateField("textContent", event.target.value)}
                className="min-h-[580px] resize-none border-0 bg-transparent px-0 text-[18px] leading-[1.65] text-black shadow-none focus-visible:ring-0"
                placeholder="Write the plain text email body here..."
              />
            </div>
          </div>
        </div>

        <aside className="rounded-[30px] border border-white/10 bg-[#0f1012] p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.18em] text-white/40">Sender identity</p>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="font-medium text-white">
                  {selectedSender ? `${selectedSender.fromName} <${selectedSender.email}>` : "Choose a sender"}
                </p>
                <p className="mt-2 text-sm text-white/50">
                  {selectedSender
                    ? `${selectedSender.provider.toUpperCase()} · ${selectedSender.region} · ${selectedSender.volumeBand}`
                    : "Each provider has multiple warmed-up identities."}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.18em] text-white/40">Audience slice</p>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="font-medium text-white">{selectedSegment?.name || "Choose a segment"}</p>
                <p className="mt-2 text-sm text-white/50">
                  {selectedSegment
                    ? `${selectedSegment.contactCount} contacts currently in this manual slice.`
                    : "Sales creates the segment from the CRM database before the broadcast is drafted."}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.18em] text-white/40">Template source</p>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="font-medium text-white">{selectedTemplate?.name || "Choose a template"}</p>
                <p className="mt-2 text-sm text-white/50">
                  {selectedTemplate
                    ? "Templates stay separate from broadcasts, exactly like the Resend workflow."
                    : "Pick a template and the subject/body will be pulled into the draft."}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </form>
    </main>
  )
}
