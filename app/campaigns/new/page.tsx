"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, LoaderCircle } from "lucide-react"
import { toast } from "sonner"
import { createCampaign } from "@/lib/crm-repository"
import { useSegments, useTemplates } from "@/lib/hooks"
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
import { Checkbox } from "@/components/ui/checkbox"
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

export default function NewCampaignPage() {
  const router = useRouter()
  const { segments } = useSegments()
  const { templates } = useTemplates()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState("none")
  const [saveAsTemplate, setSaveAsTemplate] = useState(false)
  const [selectedSegmentIds, setSelectedSegmentIds] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: "",
    provider: "resend",
    subject: "",
    previewText: "",
    fromName: "EtapaHub Events",
    fromEmail: "events@etapahub.com",
    replyTo: "events@etapahub.com",
    status: "draft",
    scheduledAt: "",
    templateName: "",
    textContent: "",
  })

  useEffect(() => {
    if (selectedTemplateId === "none") {
      return
    }

    const template = templates.find((item) => item.id === selectedTemplateId)
    if (!template) {
      return
    }

    setFormData((current) => ({
      ...current,
      subject: template.subject,
      previewText: template.previewText,
      textContent: template.textContent ?? "",
    }))
  }, [selectedTemplateId, templates])

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const toggleSegment = (segmentId: string, checked: boolean) => {
    setSelectedSegmentIds((current) =>
      checked ? [...current, segmentId] : current.filter((item) => item !== segmentId)
    )
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const campaign = await createCampaign({
        name: formData.name,
        provider: formData.provider,
        subject: formData.subject,
        previewText: formData.previewText,
        fromName: formData.fromName,
        fromEmail: formData.fromEmail,
        replyTo: formData.replyTo,
        status: formData.status as "draft" | "scheduled" | "sending" | "sent" | "paused" | "cancelled",
        scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : undefined,
        segmentIds: selectedSegmentIds,
        templateId: selectedTemplateId === "none" ? undefined : selectedTemplateId,
        saveAsTemplate,
        templateName: saveAsTemplate ? formData.templateName : undefined,
        templateFormat: "plain_text",
        textContent: formData.textContent,
      })

      toast.success("Campaign created")
      router.push(`/campaigns/${campaign.id}`)
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Could not create the campaign")
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
              <BreadcrumbLink href="/campaigns">Campaigns</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>New Campaign</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <Button variant="ghost" size="sm" asChild className="w-fit -ml-2">
            <Link href="/campaigns">
              <ArrowLeft className="size-4" />
              Back to Campaigns
            </Link>
          </Button>

          <form className="grid gap-6 lg:grid-cols-[1fr_360px]" onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Create Campaign</CardTitle>
                <CardDescription>
                  Prepare a draft or scheduled email campaign with provider, template, and target segments.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Campaign name</Label>
                  <Input id="name" value={formData.name} onChange={(event) => updateField("name", event.target.value)} required />
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <Select value={formData.provider} onValueChange={(value) => updateField("provider", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="resend">Resend</SelectItem>
                        <SelectItem value="mailgun">Mailgun</SelectItem>
                        <SelectItem value="kumomta">KumoMTA VPS</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(value) => updateField("status", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="sent">Mark as sent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Reuse template</Label>
                  <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a saved template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No saved template</SelectItem>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" value={formData.subject} onChange={(event) => updateField("subject", event.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="previewText">Preview text</Label>
                  <Input id="previewText" value={formData.previewText} onChange={(event) => updateField("previewText", event.target.value)} />
                </div>
                <div className="grid gap-5 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="fromName">From name</Label>
                    <Input id="fromName" value={formData.fromName} onChange={(event) => updateField("fromName", event.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fromEmail">From email</Label>
                    <Input id="fromEmail" type="email" value={formData.fromEmail} onChange={(event) => updateField("fromEmail", event.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="replyTo">Reply to</Label>
                    <Input id="replyTo" type="email" value={formData.replyTo} onChange={(event) => updateField("replyTo", event.target.value)} required />
                  </div>
                </div>
                {formData.status === "scheduled" && (
                  <div className="space-y-2">
                    <Label htmlFor="scheduledAt">Scheduled at</Label>
                    <Input id="scheduledAt" type="datetime-local" value={formData.scheduledAt} onChange={(event) => updateField("scheduledAt", event.target.value)} />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="textContent">Plain text content</Label>
                  <Textarea id="textContent" rows={14} value={formData.textContent} onChange={(event) => updateField("textContent", event.target.value)} required />
                </div>
                <div className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
                  This first phase is optimized for plain-text style delivery and manual campaign setup. Delivery webhooks and provider automation can be layered on top later without rebuilding the model.
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Audience</CardTitle>
                  <CardDescription>
                    Select one or more segments. The campaign recipient count will be derived from these memberships.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {segments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No segments available yet.</p>
                  ) : (
                    segments.map((segment) => (
                      <label key={segment.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                        <Checkbox
                          checked={selectedSegmentIds.includes(segment.id)}
                          onCheckedChange={(checked) => toggleSegment(segment.id, Boolean(checked))}
                        />
                        <div className="space-y-1">
                          <div className="font-medium">{segment.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {segment.contactCount.toLocaleString()} contacts
                          </div>
                        </div>
                      </label>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Template</CardTitle>
                  <CardDescription>Optionally save this message as a reusable template.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <label className="flex items-center gap-3">
                    <Checkbox checked={saveAsTemplate} onCheckedChange={(checked) => setSaveAsTemplate(Boolean(checked))} />
                    <span className="text-sm">Save as reusable template</span>
                  </label>
                  {saveAsTemplate && (
                    <div className="space-y-2">
                      <Label htmlFor="templateName">Template name</Label>
                      <Input id="templateName" value={formData.templateName} onChange={(event) => updateField("templateName", event.target.value)} />
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex flex-col gap-3">
                <Button type="button" variant="outline" asChild>
                  <Link href="/campaigns">Cancel</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting || selectedSegmentIds.length === 0}>
                  {isSubmitting && <LoaderCircle className="size-4 animate-spin" />}
                  Save Campaign
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}
