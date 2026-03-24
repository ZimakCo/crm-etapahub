"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { LoaderCircle } from "lucide-react"
import { toast } from "sonner"
import { createMarketingCampaign } from "@/lib/crm-repository"
import { useEvents, useTemplates } from "@/lib/hooks"
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

export default function NewCampaignPage() {
  const router = useRouter()
  const { events } = useEvents()
  const { templates } = useTemplates()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    status: "planning",
    objective: "",
    ownerName: "",
    eventId: "none",
    templateId: "none",
    notes: "",
  })

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formData.name || !formData.objective) {
      toast.error("Campaign name and objective are required")
      return
    }

    try {
      setIsSubmitting(true)
      const campaign = await createMarketingCampaign({
        name: formData.name,
        status: formData.status as "planning" | "active" | "completed" | "archived",
        objective: formData.objective,
        ownerName: formData.ownerName || undefined,
        eventId: formData.eventId === "none" ? undefined : formData.eventId,
        templateId: formData.templateId === "none" ? undefined : formData.templateId,
        notes: formData.notes || undefined,
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
    <main className="min-h-full bg-[linear-gradient(180deg,rgba(15,23,42,0.04),transparent_15rem)] text-foreground">
      <div className="border-b bg-background/90 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            <Link href="/campaigns" className="transition-colors hover:text-foreground">
              Campaigns
            </Link>
            <span className="mx-2 text-border">/</span>
            <span className="font-medium text-foreground">New campaign</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link href="/campaigns">Cancel</Link>
            </Button>
            <Button type="submit" form="campaign-form" disabled={isSubmitting}>
              {isSubmitting && <LoaderCircle className="size-4 animate-spin" />}
              Save campaign
            </Button>
          </div>
        </div>
      </div>

      <form
        id="campaign-form"
        className="mx-auto grid max-w-7xl gap-6 px-6 py-6 xl:grid-cols-[minmax(0,1fr)_320px]"
        onSubmit={handleSubmit}
      >
        <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardContent className="space-y-6 p-6">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="campaign-name">Campaign name</Label>
                <Input
                  id="campaign-name"
                  value={formData.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="HPAPI Milan 2026"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="campaign-status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => updateField("status", value)}>
                  <SelectTrigger id="campaign-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="campaign-objective">Objective</Label>
              <Textarea
                id="campaign-objective"
                value={formData.objective}
                onChange={(event) => updateField("objective", event.target.value)}
                placeholder="Describe the commercial goal and the audience strategy for this initiative."
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="campaign-owner">Owner</Label>
                <Input
                  id="campaign-owner"
                  value={formData.ownerName}
                  onChange={(event) => updateField("ownerName", event.target.value)}
                  placeholder="Events Desk"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="campaign-event">Linked event</Label>
                <Select value={formData.eventId} onValueChange={(value) => updateField("eventId", value)}>
                  <SelectTrigger id="campaign-event">
                    <SelectValue placeholder="Optional event" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No linked event</SelectItem>
                    {events.map((eventItem) => (
                      <SelectItem key={eventItem.id} value={eventItem.id}>
                        {eventItem.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="campaign-template">Default template</Label>
              <Select value={formData.templateId} onValueChange={(value) => updateField("templateId", value)}>
                <SelectTrigger id="campaign-template">
                  <SelectValue placeholder="Optional default template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No default template</SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="campaign-notes">Notes</Label>
              <Textarea
                id="campaign-notes"
                value={formData.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                placeholder="Internal notes, sequencing or seller guidance."
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle>How this works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="rounded-2xl border bg-muted/20 p-4">
              A campaign is the parent initiative. It does not send by itself.
            </div>
            <div className="rounded-2xl border bg-muted/20 p-4">
              After saving, operations will create one or more child broadcasts with a seller-built segment and a sender identity.
            </div>
            <div className="rounded-2xl border bg-muted/20 p-4">
              Suppressions are global, so bounced, complained or unsubscribed contacts stay out of all future broadcasts automatically.
            </div>
          </CardContent>
        </Card>
      </form>
    </main>
  )
}
